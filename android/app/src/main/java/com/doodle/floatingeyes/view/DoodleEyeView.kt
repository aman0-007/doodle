package com.doodle.floatingeyes.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.os.Handler
import android.os.Looper
import android.util.AttributeSet
import android.view.View
import com.doodle.floatingeyes.model.MoodType
import kotlin.random.Random

/**
 * Custom Android View rendering the floating expressive glowing doodle eyes.
 * Includes natural blinking, smooth transitions, and glowing shadows.
 */
class DoodleEyeView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var currentMood: MoodType = MoodType.IDLE
    private var isBlinking: Boolean = false

    private val eyePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        maskFilter = android.graphics.BlurMaskFilter(16f, android.graphics.BlurMaskFilter.Blur.NORMAL)
    }

    private val leftEyeRect = RectF()
    private val rightEyeRect = RectF()

    private val density = resources.displayMetrics.density
    private val handlerRef = Handler(Looper.getMainLooper())

    private val blinkRunnable = object : Runnable {
        override fun run() {
            triggerBlink()
            val nextDelay = if (currentMood == MoodType.SLEEP) 6000L else (2400L + Random.nextLong(3000))
            handlerRef.postDelayed(this, nextDelay)
        }
    }

    init {
        setLayerType(LAYER_TYPE_SOFTWARE, null) // Required for BlurMaskFilter glow
        handlerRef.postDelayed(blinkRunnable, 2500L)
    }

    fun setMood(mood: MoodType) {
        this.currentMood = mood
        invalidate()
    }

    fun getMood(): MoodType = currentMood

    fun triggerBlink() {
        if (currentMood == MoodType.SLEEP) return
        isBlinking = true
        invalidate()
        handlerRef.postDelayed({
            isBlinking = false
            invalidate()
        }, 130L)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val cx = width / 2f
        val cy = height / 2f
        val gap = 16f * density

        val colorInt = currentMood.glowColor
        eyePaint.color = colorInt
        glowPaint.color = colorInt

        val lWidth = currentMood.leftWidthDp * density
        val lHeight = (if (isBlinking) 4f else currentMood.leftHeightDp) * density
        val lRadius = (if (isBlinking) 2f else currentMood.leftRadiusDp) * density

        val rWidth = currentMood.rightWidthDp * density
        val rHeight = (if (isBlinking) 4f else currentMood.rightHeightDp) * density
        val rRadius = (if (isBlinking) 2f else currentMood.rightRadiusDp) * density

        val leftEyeX = cx - (gap / 2f) - lWidth
        val leftEyeY = cy - (lHeight / 2f)
        leftEyeRect.set(leftEyeX, leftEyeY, leftEyeX + lWidth, leftEyeY + lHeight)

        val rightEyeX = cx + (gap / 2f)
        val rightEyeY = cy - (rHeight / 2f)
        rightEyeRect.set(rightEyeX, rightEyeY, rightEyeX + rWidth, rightEyeY + rHeight)

        // Draw Left Eye with rotation
        canvas.save()
        canvas.rotate(currentMood.leftRotationDeg, leftEyeRect.centerX(), leftEyeRect.centerY())
        canvas.drawRoundRect(leftEyeRect, lRadius, lRadius, glowPaint)
        canvas.drawRoundRect(leftEyeRect, lRadius, lRadius, eyePaint)
        canvas.restore()

        // Draw Right Eye with rotation
        canvas.save()
        canvas.rotate(currentMood.rightRotationDeg, rightEyeRect.centerX(), rightEyeRect.centerY())
        canvas.drawRoundRect(rightEyeRect, rRadius, rRadius, glowPaint)
        canvas.drawRoundRect(rightEyeRect, rRadius, rRadius, eyePaint)
        canvas.restore()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        handlerRef.removeCallbacks(blinkRunnable)
    }
}
