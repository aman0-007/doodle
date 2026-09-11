package com.doodle.floatingeyes.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.doodle.floatingeyes.action.EyeAppLauncher
import com.doodle.floatingeyes.model.MoodType
import java.util.Locale

/**
 * Listens to voice speech in real-time, changing eye expressions
 * and triggering app launches based on what the user says.
 */
class EyeVoiceListener(
    private val context: Context,
    private val appLauncher: EyeAppLauncher,
    private val onExpressionChange: (MoodType) -> Unit
) : RecognitionListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false

    fun startListening() {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) return
        if (isListening) return

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(this@EyeVoiceListener)
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
        }

        speechRecognizer?.startListening(intent)
        isListening = true
    }

    fun stopListening() {
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
        isListening = false
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val spokenText = matches[0].lowercase(Locale.ROOT)
            processSpokenText(spokenText)
        }
        // Auto-restart listening loop
        if (isListening) {
            startListening()
        }
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val partial = matches[0].lowercase(Locale.ROOT)
            processSpokenText(partial)
        }
    }

    private fun processSpokenText(text: String) {
        when {
            // Expression triggers
            text.contains("sleep") || text.contains("goodnight") || text.contains("tired") -> {
                onExpressionChange(MoodType.SLEEP)
            }
            text.contains("wake up") || text.contains("hello") || text.contains("hey") -> {
                onExpressionChange(MoodType.HAPPY)
            }
            text.contains("love") || text.contains("cute") || text.contains("sweet") -> {
                onExpressionChange(MoodType.LOVE)
            }
            text.contains("angry") || text.contains("mad") || text.contains("stop") -> {
                onExpressionChange(MoodType.ANGRY)
            }
            text.contains("party") || text.contains("dance") || text.contains("music") -> {
                onExpressionChange(MoodType.BOOMBOX)
            }
            text.contains("wow") || text.contains("omg") || text.contains("shock") -> {
                onExpressionChange(MoodType.SHOCKED)
            }
            // App launch triggers
            text.contains("open camera") || text.contains("take photo") -> {
                onExpressionChange(MoodType.EXCITED)
                appLauncher.launchCamera()
            }
            text.contains("open spotify") || text.contains("play song") -> {
                onExpressionChange(MoodType.BOOMBOX)
                appLauncher.launchSpotify()
            }
            text.contains("open whatsapp") || text.contains("chat") -> {
                onExpressionChange(MoodType.HAPPY)
                appLauncher.launchWhatsApp()
            }
            text.contains("open maps") || text.contains("navigate") -> {
                onExpressionChange(MoodType.IDLE)
                appLauncher.launchMaps()
            }
            text.contains("open youtube") || text.contains("video") -> {
                onExpressionChange(MoodType.EXCITED)
                appLauncher.launchYouTube()
            }
        }
    }

    override fun onReadyForSpeech(params: Bundle?) {}
    override fun onBeginningOfSpeech() {}
    override fun onRmsChanged(rmsdB: Float) {
        // High volume acoustic spike (like a shout or loud noise) can trigger shocked eyes
        if (rmsdB > 9.5f) {
            onExpressionChange(MoodType.SHOCKED)
        }
    }
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() {}
    override fun onError(error: Int) {
        // Restart speech recognizer after silent timeouts
        if (isListening) {
            speechRecognizer?.destroy()
            startListening()
        }
    }
    override fun onEvent(eventType: Int, params: Bundle?) {}
}
