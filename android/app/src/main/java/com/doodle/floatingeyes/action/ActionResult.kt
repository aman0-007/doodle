package com.doodle.floatingeyes.action

import com.doodle.floatingeyes.model.MoodType

/**
 * Result returned by the EyeActionRouter after dispatching a voice/gesture command.
 */
sealed class ActionResult {
    data class Success(
        val message: String,
        val targetMood: MoodType = MoodType.EXCITED,
        val appName: String? = null,
        val cuteVoiceResponse: String? = null
    ) : ActionResult()

    data class NotFound(
        val query: String,
        val suggestedMood: MoodType = MoodType.SHOCKED,
        val cuteVoiceResponse: String? = null
    ) : ActionResult()

    data class HandledMood(
        val mood: MoodType,
        val cuteVoiceResponse: String? = null
    ) : ActionResult()

    data class NeedWakeWord(
        val spokenText: String,
        val prompt: String = "Please start your command with Doodle!"
    ) : ActionResult()

    data object Unhandled : ActionResult()
}
