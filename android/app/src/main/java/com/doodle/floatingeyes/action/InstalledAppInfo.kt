package com.doodle.floatingeyes.action

/**
 * Model representing an installed application discovered on the user's device.
 */
data class InstalledAppInfo(
    val appName: String,
    val packageName: String,
    val normalizedName: String,
    val aliases: List<String> = emptyList()
)
