package com.doodle.floatingeyes.action

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import com.doodle.floatingeyes.model.MoodType
import java.util.Locale

/**
 * Main command router that dispatches voice phrases, shortcuts, and gestures.
 * Easily extensible to add new voice actions, tools, and integrations.
 */
class EyeActionRouter(
    private val context: Context,
    val appLauncher: EyeAppLauncher = EyeAppLauncher(context)
) {

    private val mainHandler = Handler(Looper.getMainLooper())

    /**
     * Parses an arbitrary voice speech string and routes it to the corresponding action.
     */
    fun dispatchVoiceCommand(spokenText: String): ActionResult {
        val clean = spokenText.lowercase(Locale.ROOT).trim()

        // 1. Explicit app open triggers: "open X", "launch X", "start X", "go to X", "run X"
        val openPrefixes = listOf("open ", "launch ", "start ", "go to ", "run ", "show me ")
        for (prefix in openPrefixes) {
            if (clean.startsWith(prefix) || clean.contains(" $prefix")) {
                val appTarget = clean.substringAfter(prefix).trim()
                if (appTarget.isNotEmpty()) {
                    val openedApp = appLauncher.launchAppByName(appTarget)
                    return if (openedApp != null) {
                        showFeedback("Opening $openedApp")
                        ActionResult.Success(
                            message = "Opened $openedApp",
                            targetMood = MoodType.EXCITED,
                            appName = openedApp
                        )
                    } else {
                        showFeedback("Couldn't find \"$appTarget\"")
                        ActionResult.NotFound(query = appTarget, suggestedMood = MoodType.SHOCKED)
                    }
                }
            }
        }

        // 2. Direct standalone app keywords or shortcut phrases
        when {
            clean.contains("camera") || clean.contains("take a picture") || clean.contains("take photo") -> {
                appLauncher.launchCamera()
                showFeedback("Opening Camera")
                return ActionResult.Success("Opened Camera", MoodType.EXCITED, "Camera")
            }
            clean.contains("maps") || clean.contains("navigate") || clean.contains("directions") -> {
                appLauncher.launchMaps()
                showFeedback("Opening Maps")
                return ActionResult.Success("Opened Maps", MoodType.IDLE, "Maps")
            }
            clean.contains("browser") || clean.contains("surf web") || clean.contains("search web") -> {
                appLauncher.launchBrowser()
                showFeedback("Opening Browser")
                return ActionResult.Success("Opened Browser", MoodType.HAPPY, "Browser")
            }
        }

        // 3. Fallback app discovery: If user just speaks the app name alone (e.g. "Instagram", "Spotify", "Calculator")
        val directMatch = appLauncher.launchAppByName(clean)
        if (directMatch != null) {
            showFeedback("Opening $directMatch")
            return ActionResult.Success("Opened $directMatch", MoodType.EXCITED, directMatch)
        }

        // 4. Emotional and conversational expression triggers
        return when {
            clean.contains("sleep") || clean.contains("goodnight") || clean.contains("tired") || clean.contains("nap") -> {
                ActionResult.HandledMood(MoodType.SLEEP)
            }
            clean.contains("wake up") || clean.contains("hello") || clean.contains("hey") || clean.contains("good morning") -> {
                ActionResult.HandledMood(MoodType.HAPPY)
            }
            clean.contains("love") || clean.contains("cute") || clean.contains("sweet") || clean.contains("kiss") -> {
                ActionResult.HandledMood(MoodType.LOVE)
            }
            clean.contains("angry") || clean.contains("mad") || clean.contains("grr") || clean.contains("stop") -> {
                ActionResult.HandledMood(MoodType.ANGRY)
            }
            clean.contains("party") || clean.contains("dance") || clean.contains("music") || clean.contains("beat") -> {
                ActionResult.HandledMood(MoodType.BOOMBOX)
            }
            clean.contains("wow") || clean.contains("omg") || clean.contains("shock") || clean.contains("surprise") -> {
                ActionResult.HandledMood(MoodType.SHOCKED)
            }
            clean.contains("happy") || clean.contains("smile") || clean.contains("yay") -> {
                ActionResult.HandledMood(MoodType.HAPPY)
            }
            clean.contains("excite") || clean.contains("awesome") || clean.contains("cool") -> {
                ActionResult.HandledMood(MoodType.EXCITED)
            }
            else -> ActionResult.Unhandled
        }
    }

    private fun showFeedback(message: String) {
        mainHandler.post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }
}
