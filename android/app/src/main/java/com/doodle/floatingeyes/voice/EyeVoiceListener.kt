package com.doodle.floatingeyes.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.doodle.floatingeyes.action.ActionResult
import com.doodle.floatingeyes.action.EyeActionRouter
import com.doodle.floatingeyes.model.MoodType
import java.util.Locale

/**
 * Real-time Speech Recognizer integrating with EyeActionRouter
 * to drive universal app launching, smart actions, and eye moods.
 */
class EyeVoiceListener(
    private val context: Context,
    val actionRouter: EyeActionRouter,
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
            val spokenText = matches[0]
            handleCommand(spokenText)
        }
        if (isListening) {
            startListening()
        }
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val partial = matches[0]
            // We can check high-priority commands on partial speech
            handleCommand(partial)
        }
    }

    private fun handleCommand(text: String) {
        val result = actionRouter.dispatchVoiceCommand(text)
        when (result) {
            is ActionResult.Success -> {
                onExpressionChange(result.targetMood)
            }
            is ActionResult.NotFound -> {
                onExpressionChange(result.suggestedMood)
            }
            is ActionResult.HandledMood -> {
                onExpressionChange(result.mood)
            }
            is ActionResult.Unhandled -> {
                // Keep current mood
            }
        }
    }

    override fun onReadyForSpeech(params: Bundle?) {}
    override fun onBeginningOfSpeech() {}

    override fun onRmsChanged(rmsdB: Float) {
        if (rmsdB > 9.5f) {
            onExpressionChange(MoodType.SHOCKED)
        }
    }

    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() {}

    override fun onError(error: Int) {
        if (isListening) {
            speechRecognizer?.destroy()
            startListening()
        }
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}
}
