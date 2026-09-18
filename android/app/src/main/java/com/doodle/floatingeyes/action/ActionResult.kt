package com.doodle.floatingeyes.action

import com.doodle.floatingeyes.model.MoodType

/**
 * Result returned by the EyeActionRouter after dispatching a voice/gesture command.
 */
sealed class ActionResult {
    data class Success(
        val message: String,
        val targetMood: MoodType = MoodType.EXCITED,
        val appName: String? = null
    ) : ActionResult()

    data class NotFound(
        val query: String,
        val suggestedMood: MoodType = MoodType.SHOCKED
    ) : ActionResult()

    data class HandledMood(
        val mood: MoodType
    ) : ActionResult()

    data object Unhandled : ActionResult()
}
