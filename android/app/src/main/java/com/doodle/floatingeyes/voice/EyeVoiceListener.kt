package com.doodle.floatingeyes.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.doodle.floatingeyes.action.ActionResult
import com.doodle.floatingeyes.action.EyeActionRouter
import com.doodle.floatingeyes.model.MoodType
import java.util.Locale

/**
 * Real-time Speech Recognizer integrating with EyeActionRouter
 * with robust continuous listening (auto-recovery on silence) and
 * high-pitched cute companion voice synthesis.
 */
class EyeVoiceListener(
    private val context: Context,
    val actionRouter: EyeActionRouter,
    private val onExpressionChange: (MoodType) -> Unit
) : RecognitionListener {

    private val handler = Handler(Looper.getMainLooper())
    private var speechRecognizer: SpeechRecognizer? = null
    private var isContinuousListeningEnabled = false
    private var isSessionActive = false
    private var isSpeakingResponse = false

    private var textToSpeech: TextToSpeech? = null

    private val restartRunnable = Runnable {
        if (isContinuousListeningEnabled && !isSpeakingResponse) {
            startRecognitionSession()
        }
    }

    init {
        // Initialize Android TextToSpeech with natural male Jarvis voice persona
        textToSpeech = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                textToSpeech?.language = Locale.US
                textToSpeech?.setPitch(0.88f)       // Deep, natural masculine tone
                textToSpeech?.setSpeechRate(1.40f)  // 1.40x conversational pace as requested

                try {
                    val availableVoices = textToSpeech?.voices
                    if (!availableVoices.isNullOrEmpty()) {
                        val maleVoice = availableVoices.find { voice ->
                            val name = voice.name.lowercase(Locale.ROOT)
                            val isEn = voice.locale.language.startsWith("en", ignoreCase = true)
                            isEn && (name.contains("male") || name.contains("man") || name.contains("guy")) &&
                                !name.contains("female")
                        } ?: availableVoices.find { voice ->
                            val name = voice.name.lowercase(Locale.ROOT)
                            voice.locale.language.startsWith("en", ignoreCase = true) && !name.contains("female")
                        }
                        if (maleVoice != null) {
                            textToSpeech?.voice = maleVoice
                        }
                    }
                } catch (e: Exception) {}
            }
        }
    }

    fun startListening() {
        isContinuousListeningEnabled = true
        startRecognitionSession()
    }

    fun stopListening() {
        isContinuousListeningEnabled = false
        handler.removeCallbacks(restartRunnable)
        try {
            speechRecognizer?.stopListening()
            speechRecognizer?.destroy()
        } catch (e: Exception) {}
        speechRecognizer = null
        isSessionActive = false
        textToSpeech?.stop()
    }

    private fun startRecognitionSession() {
        if (!isContinuousListeningEnabled || isSpeakingResponse) return
        if (!SpeechRecognizer.isRecognitionAvailable(context)) return

        try {
            speechRecognizer?.destroy()
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
            isSessionActive = true
        } catch (e: Exception) {
            isSessionActive = false
            scheduleRestart()
        }
    }

    private fun scheduleRestart() {
        if (!isContinuousListeningEnabled || isSpeakingResponse) return
        handler.removeCallbacks(restartRunnable)
        handler.postDelayed(restartRunnable, 300)
    }

    override fun onResults(results: Bundle?) {
        isSessionActive = false
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val spokenText = matches[0]
            handleCommand(spokenText)
        } else {
            scheduleRestart()
        }
    }

    override fun onPartialResults(partialResults: Bundle?) {
        // Partial speech preview
    }

    private fun handleCommand(text: String) {
        val result = actionRouter.dispatchVoiceCommand(text)
        when (result) {
            is ActionResult.Success -> {
                onExpressionChange(result.targetMood)
                result.cuteVoiceResponse?.let { speakCuteResponse(it) } ?: scheduleRestart()
            }
            is ActionResult.NotFound -> {
                onExpressionChange(result.suggestedMood)
                result.cuteVoiceResponse?.let { speakCuteResponse(it) } ?: scheduleRestart()
            }
            is ActionResult.HandledMood -> {
                onExpressionChange(result.mood)
                result.cuteVoiceResponse?.let { speakCuteResponse(it) } ?: scheduleRestart()
            }
            is ActionResult.NeedWakeWord -> {
                // User didn't say Doodle: gently prompt or keep current mood
                speakCuteResponse(result.prompt)
            }
            is ActionResult.Unhandled -> {
                scheduleRestart()
            }
        }
    }

    private fun speakCuteResponse(message: String) {
        val tts = textToSpeech
        if (tts == null || message.isBlank()) {
            scheduleRestart()
            return
        }

        isSpeakingResponse = true
        try {
            speechRecognizer?.stopListening()
        } catch (e: Exception) {}

        val utteranceId = "doodle_cute_${System.currentTimeMillis()}"
        tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}

            override fun onDone(utteranceId: String?) {
                handler.post {
                    isSpeakingResponse = false
                    scheduleRestart()
                }
            }

            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                handler.post {
                    isSpeakingResponse = false
                    scheduleRestart()
                }
            }
        })

        tts.speak(message, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
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
        isSessionActive = false
        // Non-fatal errors like speech timeout (7) or no match (6) mean silence.
        // Keep listening by scheduling restart rather than stopping!
        scheduleRestart()
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}
}
