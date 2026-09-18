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
     * Enforces the wake word requirement ("doodle" / "doddle").
     */
    fun dispatchVoiceCommand(spokenText: String): ActionResult {
        val clean = spokenText.lowercase(Locale.ROOT).trim()
        if (clean.isEmpty()) return ActionResult.Unhandled

        // Check for wake word prefix: "doodle", "doddle", "hey doodle", "ok doddle", etc.
        val wakeRegex = Regex("""^(?:hey\s+|hi\s+|ok\s+|yo\s+|hello\s+)?(?:doodle|doddle|dudle|doodler|doodel)\b[,\s]*(.*)$""", RegexOption.IGNORE_CASE)
        val match = wakeRegex.find(clean)

        if (match == null) {
            // User did not say the wake word "Doodle" / "Doddle"
            showFeedback("Say 'Doodle' before your command!")
            return ActionResult.NeedWakeWord(spokenText, "Start your command with 'Doodle' so I know you're calling me!")
        }

        val command = match.groupValues.getOrNull(1)?.trim() ?: ""

        // If the user just said "Doodle" / "Hey Doddle" to wake it up:
        if (command.isEmpty() || command in listOf("hi", "hello", "hey", "what's up", "listen")) {
            showFeedback("Hi! Doodle is listening!")
            return ActionResult.HandledMood(
                mood = MoodType.HAPPY,
                cuteVoiceResponse = "Hi! Doodle is listening, what can I do for you?"
            )
        }

        // 1. Explicit app open triggers: "open X", "launch X", "start X", "go to X", "run X"
        val openPrefixes = listOf("open ", "launch ", "start ", "go to ", "run ", "show me ")
        for (prefix in openPrefixes) {
            if (command.startsWith(prefix) || command.contains(" $prefix")) {
                val appTarget = command.substringAfter(prefix).trim()
                if (appTarget.isNotEmpty()) {
                    val openedApp = appLauncher.launchAppByName(appTarget)
                    return if (openedApp != null) {
                        showFeedback("Opening $openedApp")
                        ActionResult.Success(
                            message = "Opened $openedApp",
                            targetMood = MoodType.EXCITED,
                            appName = openedApp,
                            cuteVoiceResponse = "Opening $openedApp right now for you!"
                        )
                    } else {
                        showFeedback("Couldn't find \"$appTarget\"")
                        ActionResult.NotFound(
                            query = appTarget,
                            suggestedMood = MoodType.SHOCKED,
                            cuteVoiceResponse = "Oh no, I couldn't find $appTarget on your device!"
                        )
                    }
                }
            }
        }

        // 2. Direct standalone app keywords or shortcut phrases
        when {
            command.contains("camera") || command.contains("take a picture") || command.contains("take photo") -> {
                appLauncher.launchCamera()
                showFeedback("Opening Camera")
                return ActionResult.Success("Opened Camera", MoodType.EXCITED, "Camera", "Opening Camera! Say cheese!")
            }
            command.contains("maps") || command.contains("navigate") || command.contains("directions") -> {
                appLauncher.launchMaps()
                showFeedback("Opening Maps")
                return ActionResult.Success("Opened Maps", MoodType.IDLE, "Maps", "Opening Maps! Let's explore!")
            }
            command.contains("browser") || command.contains("surf web") || command.contains("search web") -> {
                appLauncher.launchBrowser()
                showFeedback("Opening Browser")
                return ActionResult.Success("Opened Browser", MoodType.HAPPY, "Browser", "Opening Browser for you!")
            }
        }

        // 3. Fallback app discovery: If user just speaks the app name (e.g. "Instagram", "Spotify", "Calculator")
        val directMatch = appLauncher.launchAppByName(command)
        if (directMatch != null) {
            showFeedback("Opening $directMatch")
            return ActionResult.Success("Opened $directMatch", MoodType.EXCITED, directMatch, "Opening $directMatch for you!")
        }

        // 4. Emotional and conversational expression triggers
        return when {
            command.contains("sleep") || command.contains("goodnight") || command.contains("tired") || command.contains("nap") -> {
                ActionResult.HandledMood(MoodType.SLEEP, "Goodnight! Doodle is going to sleep now. Zzz...")
            }
            command.contains("wake up") || command.contains("hello") || command.contains("hey") || command.contains("good morning") -> {
                ActionResult.HandledMood(MoodType.HAPPY, "Good morning! Doodle is wide awake and happy!")
            }
            command.contains("love") || command.contains("cute") || command.contains("sweet") || command.contains("kiss") -> {
                ActionResult.HandledMood(MoodType.LOVE, "Aww, Doodle loves you so much too!")
            }
            command.contains("angry") || command.contains("mad") || command.contains("grr") || command.contains("stop") -> {
                ActionResult.HandledMood(MoodType.ANGRY, "Hmph! Doodle is grumpy now!")
            }
            command.contains("party") || command.contains("dance") || command.contains("music") || command.contains("beat") -> {
                ActionResult.HandledMood(MoodType.BOOMBOX, "Yay! Party time, let's dance to the beats!")
            }
            command.contains("wow") || command.contains("omg") || command.contains("shock") || command.contains("surprise") -> {
                ActionResult.HandledMood(MoodType.SHOCKED, "Whoa! That took me by surprise!")
            }
            command.contains("happy") || command.contains("smile") || command.contains("yay") -> {
                ActionResult.HandledMood(MoodType.HAPPY, "Yay! Doodle is full of joy today!")
            }
            command.contains("excite") || command.contains("awesome") || command.contains("cool") -> {
                ActionResult.HandledMood(MoodType.EXCITED, "Woohoo! That sounds so cool!")
            }
            else -> {
                ActionResult.HandledMood(
                    MoodType.CONFUSED,
                    cuteVoiceResponse = "Doodle heard: $command! I'm learning new tricks every day!"
                )
            }
        }
    }

    private fun showFeedback(message: String) {
        mainHandler.post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }
}
