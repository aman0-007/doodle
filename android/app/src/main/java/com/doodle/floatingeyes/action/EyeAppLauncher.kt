package com.doodle.floatingeyes.action

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import android.widget.Toast

/**
 * Universal application launcher supporting any installed package,
 * custom system hardware intents, and Play Store fallback.
 */
class EyeAppLauncher(private val context: Context) {

    val directoryService: AppDirectoryService = AppDirectoryService(context)

    /**
     * Attempts to find and launch any application by name or alias.
     * Returns the name of the opened app on success, or null if not found.
     */
    fun launchAppByName(nameQuery: String): String? {
        val targetApp = directoryService.findApp(nameQuery)
        if (targetApp != null) {
            val opened = launchPackage(targetApp.packageName)
            if (opened) return targetApp.appName
        }

        // Check common native hardware intents
        when (nameQuery.lowercase().trim()) {
            "camera", "photo", "cam" -> {
                launchCamera()
                return "Camera"
            }
            "maps", "map", "navigation", "gps" -> {
                launchMaps()
                return "Maps"
            }
            "browser", "chrome", "internet", "web" -> {
                launchBrowser("https://www.google.com")
                return "Browser"
            }
        }

        return null
    }

    /**
     * Launches a specific package by its Android package identifier.
     */
    fun launchPackage(packageName: String): Boolean {
        return try {
            val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
                context.startActivity(launchIntent)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    fun launchCamera() {
        try {
            val intent = Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            try {
                val fallbackIntent = Intent("android.media.action.IMAGE_CAPTURE").apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(fallbackIntent)
            } catch (_: Exception) {
                Toast.makeText(context, "Unable to open camera", Toast.LENGTH_SHORT).show()
            }
        }
    }

    fun launchMaps() {
        try {
            val gmmIntentUri = Uri.parse("geo:0,0?q=")
            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                setPackage("com.google.android.apps.maps")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(mapIntent)
        } catch (_: Exception) {
            launchBrowser("https://maps.google.com")
        }
    }

    fun launchBrowser(url: String = "https://www.google.com") {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            Toast.makeText(context, "Unable to launch browser", Toast.LENGTH_SHORT).show()
        }
    }

    fun launchOrOpenMarket(packageName: String, fallbackUrl: String) {
        if (!launchPackage(packageName)) {
            try {
                val marketIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(marketIntent)
            } catch (_: Exception) {
                launchBrowser(fallbackUrl)
            }
        }
    }
}
