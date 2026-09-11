# Floating Doodle Eyes - Android Native Application

This directory contains the standalone Android companion application that makes the expressive doodle eyes float over the screen and interact across any active Android app.

## Architecture & Code Separation

To maintain strict separation of concerns, the project is divided into distinct, decoupled layers:

1. **Overlay & Service Layer (`service/`)**:
   - `FloatingEyeService.kt`: Android `Service` managing `WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY`. Handles dragging across screen boundaries, edge-snapping, touch detection, and life cycle without interfering with any UI styling.

2. **Custom Render Engine (`view/`)**:
   - `DoodleEyeView.kt`: Custom hardware-accelerated Android view dedicated exclusively to drawing the glowing eye contours, blinking cycles, rotations, and blur glow effects. Completely decoupled from business logic and gestures.

3. **Expression Model (`model/`)**:
   - `EyeExpression.kt`: Defines dimensions, corner radii, rotation angles, and glowing hex colors for all mood states (`IDLE`, `HAPPY`, `LOVE`, `SLEEP`, `ANGRY`, `BOOMBOX`, `SHOCKED`).

4. **Speech & Audio Integration (`voice/`)**:
   - `EyeVoiceListener.kt`: Continuous real-time voice speech recognition using Android's `SpeechRecognizer`. Parses spoken keywords and volume spikes (RMS dB) to trigger dynamic expressions.

5. **External App Integration (`action/`)**:
   - `EyeAppLauncher.kt`: Launches external apps (Camera, Spotify, WhatsApp, Maps, YouTube) via implicit and explicit system intents.

6. **Host & Permission Screen (`MainActivity.kt`)**:
   - Jetpack Compose interface for toggling the overlay service and granting required permissions (`SYSTEM_ALERT_WINDOW` and `RECORD_AUDIO`).

## Integrations Available

- **Floating Overlay**: Runs on top of any active app or Android home screen.
- **Gesture Interactions**:
  - Drag anywhere to reposition the floating eyes.
  - Tap to cycle through happy and excited expressions.
  - Long-press to put the eyes to sleep.
- **Voice Recognition**:
  - Speaks "sleep" or "goodnight" -> switches to sleepy eyes.
  - Speaks "wake up" or "hello" -> switches to smiling eyes.
  - Speaks "party" or "dance" -> switches to boombox eyes.
  - Speaks "open camera", "open spotify", "open whatsapp", etc. -> immediately opens the respective application.

## Automatic APK Generation on Git Push

Whenever you make a `git push`, the Android APK is automatically generated in two ways:

1. **Local Git Hook (`.githooks/pre-push`)**:
   - Automatically executes whenever you run `git push` in your local terminal.
   - Invokes `scripts/build-apk.sh` to assemble the debug APK into `android/apk/floating-doodle-eyes-debug.apk`.
   - Setup: run `./scripts/setup-git-hooks.sh` to enable git hooks in any cloned repo.

2. **GitHub Actions CI/CD (`.github/workflows/build-apk.yml`)**:
   - Triggers automatically whenever a push is made to GitHub.
   - Compiles the Android project using JDK 17 and Android SDK.
   - Uploads `floating-doodle-eyes-debug.apk` directly as a downloadable GitHub Actions artifact for immediate installation on your device.

