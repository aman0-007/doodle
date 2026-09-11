package com.doodle.floatingeyes.action

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast

/**
 * Handles launching external applications and system intents
 * in response to eye gestures or voice triggers.
 */
class EyeAppLauncher(private val context: Context) {

    fun launchCamera() {
        try {
            val intent = Intent("android.media.action.IMAGE_CAPTURE").apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Cannot open camera", Toast.LENGTH_SHORT).show()
        }
    }

    fun launchSpotify() {
        launchOrOpenMarket("com.spotify.music", "https://open.spotify.com")
    }

    fun launchWhatsApp() {
        launchOrOpenMarket("com.whatsapp", "https://api.whatsapp.com")
    }

    fun launchMaps() {
        try {
            val gmmIntentUri = Uri.parse("geo:0,0?q=")
            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                setPackage("com.google.android.apps.maps")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(mapIntent)
        } catch (e: Exception) {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.google.com")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(browserIntent)
        }
    }

    fun launchYouTube() {
        launchOrOpenMarket("com.google.android.youtube", "https://www.youtube.com")
    }

    private fun launchOrOpenMarket(packageName: String, fallbackUrl: String) {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
        } else {
            try {
                val marketIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(marketIntent)
            } catch (e: Exception) {
                val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(webIntent)
            }
        }
    }
}
