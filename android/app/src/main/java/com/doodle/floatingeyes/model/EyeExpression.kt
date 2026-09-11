package com.doodle.floatingeyes.model

import android.graphics.Color

/**
 * Model defining the geometric properties and colors for each eye expression.
 */
enum class MoodType(
    val label: String,
    val glowColor: Int,
    val leftWidthDp: Float,
    val leftHeightDp: Float,
    val leftRadiusDp: Float,
    val rightWidthDp: Float,
    val rightHeightDp: Float,
    val rightRadiusDp: Float,
    val leftRotationDeg: Float = 0f,
    val rightRotationDeg: Float = 0f
) {
    IDLE(
        label = "Idle",
        glowColor = Color.parseColor("#19EAFF"),
        leftWidthDp = 34f, leftHeightDp = 42f, leftRadiusDp = 9f,
        rightWidthDp = 34f, rightHeightDp = 42f, rightRadiusDp = 9f
    ),
    HAPPY(
        label = "Happy",
        glowColor = Color.parseColor("#38EF7D"),
        leftWidthDp = 34f, leftHeightDp = 22f, leftRadiusDp = 11f,
        rightWidthDp = 34f, rightHeightDp = 22f, rightRadiusDp = 11f,
        leftRotationDeg = -8f, rightRotationDeg = 8f
    ),
    EXCITED(
        label = "Excited",
        glowColor = Color.parseColor("#FF9900"),
        leftWidthDp = 38f, leftHeightDp = 46f, leftRadiusDp = 12f,
        rightWidthDp = 38f, rightHeightDp = 46f, rightRadiusDp = 12f
    ),
    LOVE(
        label = "Love",
        glowColor = Color.parseColor("#FF4D8D"),
        leftWidthDp = 34f, leftHeightDp = 40f, leftRadiusDp = 14f,
        rightWidthDp = 34f, rightHeightDp = 40f, rightRadiusDp = 14f
    ),
    SLEEP(
        label = "Sleep",
        glowColor = Color.parseColor("#6EE7B7"),
        leftWidthDp = 36f, leftHeightDp = 7f, leftRadiusDp = 4f,
        rightWidthDp = 36f, rightHeightDp = 7f, rightRadiusDp = 4f
    ),
    ANGRY(
        label = "Angry",
        glowColor = Color.parseColor("#FF3344"),
        leftWidthDp = 34f, leftHeightDp = 36f, leftRadiusDp = 8f,
        rightWidthDp = 34f, rightHeightDp = 36f, rightRadiusDp = 8f,
        leftRotationDeg = 16f, rightRotationDeg = -16f
    ),
    SHOCKED(
        label = "Shocked",
        glowColor = Color.parseColor("#FBBF24"),
        leftWidthDp = 42f, leftHeightDp = 42f, leftRadiusDp = 21f,
        rightWidthDp = 42f, rightHeightDp = 42f, rightRadiusDp = 21f
    ),
    BOOMBOX(
        label = "Boombox",
        glowColor = Color.parseColor("#F43F5E"),
        leftWidthDp = 36f, leftHeightDp = 38f, leftRadiusDp = 10f,
        rightWidthDp = 36f, rightHeightDp = 38f, rightRadiusDp = 10f
    )
}
