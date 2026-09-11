package com.doodle.floatingeyes.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat
import com.doodle.floatingeyes.action.EyeAppLauncher
import com.doodle.floatingeyes.model.MoodType
import com.doodle.floatingeyes.view.DoodleEyeView
import com.doodle.floatingeyes.voice.EyeVoiceListener
import kotlin.math.abs

/**
 * Android Foreground Service managing the Floating Overlay Window.
 * Enables the Doodle Eyes to float continuously over all apps.
 */
class FloatingEyeService : Service() {

    private var windowManager: WindowManager? = null
    private var eyeView: DoodleEyeView? = null
    private var params: WindowManager.LayoutParams? = null

    private lateinit var appLauncher: EyeAppLauncher
    private var voiceListener: EyeVoiceListener? = null

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var touchStartTime = 0L

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForegroundNotification()

        appLauncher = EyeAppLauncher(this)
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val density = resources.displayMetrics.density
        val viewWidth = (140 * density).toInt()
        val viewHeight = (90 * density).toInt()

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            viewWidth,
            viewHeight,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 300
        }

        eyeView = DoodleEyeView(this).apply {
            setOnTouchListener(createTouchListener())
        }

        windowManager?.addView(eyeView, params)

        // Initialize voice detection
        voiceListener = EyeVoiceListener(this, appLauncher) { newMood ->
            eyeView?.post {
                eyeView?.setMood(newMood)
            }
        }
        voiceListener?.startListening()
    }

    private fun createTouchListener(): View.OnTouchListener {
        return View.OnTouchListener { _, event ->
            val p = params ?: return@OnTouchListener false

            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = p.x
                    initialY = p.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    touchStartTime = System.currentTimeMillis()
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    p.x = initialX + (event.rawX - initialTouchX).toInt()
                    p.y = initialY + (event.rawY - initialTouchY).toInt()
                    windowManager?.updateViewLayout(eyeView, p)
                    true
                }
                MotionEvent.ACTION_UP -> {
                    val duration = System.currentTimeMillis() - touchStartTime
                    val diffX = abs(event.rawX - initialTouchX)
                    val diffY = abs(event.rawY - initialTouchY)

                    // Detected Tap (not a drag)
                    if (duration < 300 && diffX < 15 && diffY < 15) {
                        handleTap()
                    } else if (duration >= 600 && diffX < 15 && diffY < 15) {
                        // Long press to toggle sleep mode
                        eyeView?.setMood(MoodType.SLEEP)
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun handleTap() {
        val current = eyeView?.getMood()
        if (current == MoodType.SLEEP) {
            eyeView?.setMood(MoodType.HAPPY)
            return
        }

        val moods = listOf(MoodType.HAPPY, MoodType.LOVE, MoodType.EXCITED, MoodType.IDLE)
        val nextMood = moods.random()
        eyeView?.setMood(nextMood)
    }

    private fun startForegroundNotification() {
        val channelId = "floating_eyes_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Floating Eyes Companion",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Doodle Eyes Active")
            .setContentText("Eyes are floating on screen. Tap to interact.")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setOngoing(true)
            .build()

        startForeground(101, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
        voiceListener?.stopListening()
        if (eyeView != null) {
            windowManager?.removeView(eyeView)
        }
    }
}
