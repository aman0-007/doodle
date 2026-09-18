/* =========================================================
   PIXEL DOODLE V2.5 - INTERACTIVE BEHAVIOR ENGINE
   Handles gestures, chiptune sound, expressions, battery & shake
   ========================================================= */

/* =========================================================
   ELEMENT REFERENCES
   ========================================================= */

const doodle = document.getElementById("doodle");
const leftEye = document.getElementById("eyeLeft");
const rightEye = document.getElementById("eyeRight");
const moodBubble = document.getElementById("mood-bubble");
const soundToggle = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");
const soundLabel = document.getElementById("soundLabel");
const micToggle = document.getElementById("micToggle");
const micIcon = document.getElementById("micIcon");
const micLabel = document.getElementById("micLabel");
const modalMicToggle = document.getElementById("modalMicToggle");
const modalMicIcon = document.getElementById("modalMicIcon");
const modalMicText = document.getElementById("modalMicText");
const voiceStatusBadge = document.getElementById("voiceStatusBadge");
const hearingDot = document.getElementById("hearingDot");
const hearingStatusText = document.getElementById("hearingStatusText");
const liveTranscriptBox = document.getElementById("liveTranscriptBox");
const voiceSelect = document.getElementById("voiceSelect");
const voiceSelectedLabel = document.getElementById("voiceSelectedLabel");
const voiceSpeedSlider = document.getElementById("voiceSpeedSlider");
const voiceSpeedVal = document.getElementById("voiceSpeedVal");
const voicePitchSlider = document.getElementById("voicePitchSlider");
const voicePitchVal = document.getElementById("voicePitchVal");
const previewVoiceBtn = document.getElementById("previewVoiceBtn");
const shakeBtn = document.getElementById("shakeBtn");
const batteryWidget = document.getElementById("batteryWidget");
const batteryFill = document.getElementById("batteryFill");
const batteryPercent = document.getElementById("batteryPercent");
const batteryStatus = document.getElementById("batteryStatus");
const moodDock = document.getElementById("moodDock");
const dockToggle = document.getElementById("dockToggle");
const gestureHint = document.getElementById("gestureHint");

/* =========================================================
   CORE STATE
   ========================================================= */

let state = "idle";
let idleTimer = null;
let blinkTimer = null;
let bubbleTimer = null;
let animationTimers = [];
let lookOffset = { x: 0, y: 0 };

// Tap & Gesture tracking
let taps = 0;
let tapTimer = null;
let pointerDown = false;
let pointerStartX = 0;
let pointerStartY = 0;
let pointerStartTime = 0;
let longPressTimer = null;

// Cursor shake tracking
let cursorXHistory = [];
let cursorShakeReversals = 0;
let cursorLastDir = 0;
let lastCursorShakeTime = 0;

// Device accelerometer shake tracking
let lastAccX, lastAccY, lastAccZ;
let shakeCount = 0;
let shakeTimer = null;

// Battery simulation state
const BATTERY_MODES = ["auto", "charging", "normal", "low"];
let currentBatteryModeIndex = 1; // Default to charging demo if API restricted
let realBatteryRef = null;

/* =========================================================
   AUDIO & SOUND INTEGRATION
   ========================================================= */

function updateSoundUI() {
    const muted = SoundFX.isMuted();
    soundIcon.textContent = muted ? "🔇" : "🔊";
    soundLabel.textContent = muted ? "Muted" : "Sound ON";
}

soundToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const muted = SoundFX.toggleMute();
    updateSoundUI();
    if (!muted) {
        SoundFX.play("happy");
    }
});

updateSoundUI();

/* =========================================================
   MOOD BUBBLE FEEDBACK
   ========================================================= */

function showMoodBubble(text) {
    if (!moodBubble) return;
    clearTimeout(bubbleTimer);
    moodBubble.textContent = text;
    moodBubble.classList.add("show");

    bubbleTimer = setTimeout(() => {
        moodBubble.classList.remove("show");
    }, 1800);
}

/* =========================================================
   EXPRESSION ENGINE
   ========================================================= */

function clearExpressionTimers() {
    animationTimers.forEach(timer => clearTimeout(timer));
    animationTimers = [];
}

function resetEyeStyles(eye) {
    eye.style.width = "";
    eye.style.height = "";
    eye.style.borderRadius = "";
    eye.style.transform = "";
    eye.style.opacity = "";
    eye.style.background = "";
    eye.style.border = "";
    eye.style.boxShadow = "";
}

function applyEyeGeometry(eye, cfg) {
    if (!cfg) return;

    if (cfg.width !== undefined) {
        eye.style.width = typeof cfg.width === "number" ? cfg.width + "px" : cfg.width;
    }
    if (cfg.height !== undefined) {
        eye.style.height = typeof cfg.height === "number" ? cfg.height + "px" : cfg.height;
    }
    if (cfg.radius !== undefined) {
        eye.style.borderRadius = typeof cfg.radius === "number" ? cfg.radius + "px" : cfg.radius;
    }

    // Apply look offset to idle or basic poses
    let transform = cfg.transform || "";
    if ((state === "idle" || !transform || transform === "none") && (lookOffset.x !== 0 || lookOffset.y !== 0)) {
        transform = `translate(${lookOffset.x}px, ${lookOffset.y}px)`;
    }
    eye.style.transform = transform || "none";

    if (cfg.opacity !== undefined) {
        eye.style.opacity = cfg.opacity;
    }
    if (cfg.background !== undefined) {
        eye.style.background = cfg.background;
    }
    if (cfg.border !== undefined) {
        eye.style.border = cfg.border;
    }
    if (cfg.boxShadow !== undefined) {
        eye.style.boxShadow = cfg.boxShadow;
    }
}

function applyExpression(name, triggerSound = false) {
    const expr = EXPRESSIONS[name] || EXPRESSIONS.idle;

    // Reset base inline styling so previous shapes don't leak
    resetEyeStyles(leftEye);
    resetEyeStyles(rightEye);

    // Toggle expression classes on #doodle
    doodle.classList.toggle("love", name === "love");
    doodle.classList.toggle("boombox", name === "boombox");
    doodle.classList.toggle("sleep", name === "sleep");

    if (name === "specs") {
        doodle.classList.remove("specs");
        void doodle.offsetWidth;
        doodle.classList.add("specs");
    } else {
        doodle.classList.remove("specs");
    }

    // Manage boombox looping song
    if (name === "boombox") {
        SoundFX.startBoomboxSong();
    } else {
        if (SoundFX.isBoomboxPlaying()) {
            SoundFX.stopBoomboxSong();
        }
    }

    // Resolve geometry configs for left and right
    const leftCfg = expr.left || {
        width: expr.width,
        height: expr.height,
        radius: expr.radius,
        transform: expr.leftTransform !== undefined ? expr.leftTransform : expr.transform,
        opacity: expr.leftOpacity !== undefined ? expr.leftOpacity : expr.opacity,
        background: expr.background,
        border: expr.border
    };

    const rightCfg = expr.right || {
        width: expr.width,
        height: expr.height,
        radius: expr.radius,
        transform: expr.rightTransform !== undefined ? expr.rightTransform : expr.transform,
        opacity: expr.rightOpacity !== undefined ? expr.rightOpacity : expr.opacity,
        background: expr.background,
        border: expr.border
    };

    applyEyeGeometry(leftEye, leftCfg);
    applyEyeGeometry(rightEye, rightCfg);

    // Apply glowing color
    const glow = expr.glow || "#19eaff";
    doodle.style.setProperty("--glow", glow);

    // Play associated 8-bit sound if requested
    if (triggerSound && expr.sound) {
        SoundFX.play(expr.sound);
    }
}

function setState(newState, triggerSound = true) {
    clearExpressionTimers();
    state = newState;
    applyExpression(newState, triggerSound);

    // Update active state in dock
    updateActiveMoodButton(newState);

    if (newState !== "sleep" && newState !== "dizzy") {
        resetIdle();
    }
}

function playFrames(frames, finalState = "idle", sound = null) {
    if (!frames || !frames.length) return;

    clearExpressionTimers();

    if (sound) {
        SoundFX.play(sound);
    }

    frames.forEach(frame => {
        const timer = setTimeout(() => {
            state = frame.name;
            applyExpression(frame.name, false);
            updateActiveMoodButton(frame.name);
        }, frame.ms);
        animationTimers.push(timer);
    });

    const lastFrame = frames[frames.length - 1];
    const finalTimer = setTimeout(() => {
        state = finalState;
        applyExpression(finalState, false);
        updateActiveMoodButton(finalState);
        if (finalState !== "sleep") {
            resetIdle();
        }
    }, lastFrame.ms + 60);

    animationTimers.push(finalTimer);
}

function playExpression(name, feedbackLabel = null) {
    const frames = EXPRESSION_FRAMES[name];
    const expr = EXPRESSIONS[name];
    const soundKey = (expr && expr.sound) ? expr.sound : name;

    if (feedbackLabel) {
        showMoodBubble(feedbackLabel);
    } else {
        const found = MOOD_LIST.find(m => m.id === name);
        if (found) {
            if (found.id === "sleep") {
                showMoodBubble("Sleeping... Zzz");
            } else {
                const iconBadge = found.icon || "✨";
                showMoodBubble(`${found.label}! ${iconBadge}`);
            }
        }
    }

    if (name === "boombox") {
        setState("boombox", true);
        return;
    }

    if (frames) {
        playFrames(frames, "idle", soundKey);
    } else if (expr) {
        setState(name, true);
        if (name !== "sleep" && name !== "idle") {
            const timer = setTimeout(() => {
                setState("idle", false);
            }, 1800);
            animationTimers.push(timer);
        }
    }
}

// Global API hook for external or dev control
window.doodleExpression = function(name) {
    playExpression(name);
};

/* =========================================================
   NATURAL BLINKING & IDLE CYCLE
   ========================================================= */

function blink() {
    if (state === "sleep" || state === "dizzy" || state === "angry") return;

    applyExpression("blink", true);

    setTimeout(() => {
        if (state !== "dizzy" && state !== "sleep") {
            applyExpression(state, false);
        }
    }, 130);
}

function scheduleBlink() {
    clearTimeout(blinkTimer);
    const delay = (doodle.classList.contains("tired")) ? 5000 + Math.random() * 4000 : 2600 + Math.random() * 3200;
    blinkTimer = setTimeout(() => {
        blink();
        scheduleBlink();
    }, delay);
}

function resetIdle() {
    clearTimeout(idleTimer);
    if (state !== "sleep" && state !== "dizzy") {
        idleTimer = setTimeout(() => {
            // Subtle wandering glance when bored
            if (state === "idle") {
                const randomGaze = [
                    { x: -4, y: -2 },
                    { x: 4, y: -2 },
                    { x: -3, y: 3 },
                    { x: 3, y: 3 },
                    { x: 0, y: 0 }
                ][Math.floor(Math.random() * 5)];
                lookOffset = randomGaze;
                applyExpression("idle", false);

                setTimeout(() => {
                    lookOffset = { x: 0, y: 0 };
                    applyExpression("idle", false);
                }, 1400);
            }
            resetIdle();
        }, 6000 + Math.random() * 4000);
    }
}

/* =========================================================
   SHAKE DETECTION & DIZZY ANIMATION
   ========================================================= */

function getDizzy() {
    if (state === "dizzy") return;

    clearExpressionTimers();
    clearTimeout(idleTimer);

    state = "dizzy";
    doodle.classList.add("shaking");
    doodle.classList.add("dizzy");

    SoundFX.play("shake");
    showMoodBubble("Whoa! Dizzy! 💫");

    if (navigator.vibrate) {
        navigator.vibrate([60, 40, 60, 40, 100]);
    }

    setTimeout(() => {
        doodle.classList.remove("shaking");
    }, 450);

    // Recover after 3.5 seconds
    setTimeout(() => {
        doodle.classList.remove("dizzy");
        state = "idle";
        applyExpression("idle", false);
        SoundFX.play("wink");
        resetIdle();
    }, 3600);
}

shakeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    SoundFX.init();
    getDizzy();
});

// Cursor shake detection on desktop
window.addEventListener("pointermove", (e) => {
    // Eye pupil tracking
    const rect = doodle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (window.innerWidth / 2);
    const dy = (e.clientY - centerY) / (window.innerHeight / 2);

    lookOffset.x = Math.max(-5, Math.min(5, dx * 6));
    lookOffset.y = Math.max(-4, Math.min(4, dy * 5));

    if (state === "idle") {
        applyExpression("idle", false);
    }

    // Shake tracking by cursor
    const now = Date.now();
    cursorXHistory.push({ x: e.clientX, t: now });
    cursorXHistory = cursorXHistory.filter(pt => now - pt.t < 600);

    if (cursorXHistory.length >= 6) {
        const deltaX = cursorXHistory[cursorXHistory.length - 1].x - cursorXHistory[cursorXHistory.length - 2].x;
        const currentDir = deltaX > 8 ? 1 : deltaX < -8 ? -1 : 0;

        if (currentDir !== 0 && currentDir !== cursorLastDir) {
            cursorLastDir = currentDir;
            cursorShakeReversals++;

            if (cursorShakeReversals >= 5 && now - lastCursorShakeTime > 3000) {
                lastCursorShakeTime = now;
                cursorShakeReversals = 0;
                getDizzy();
            }
        }
    }
});

// Mobile Accelerometer shake detection
if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", (event) => {
        if (state === "dizzy") return;
        const acc = event.accelerationIncludingGravity;
        if (!acc || acc.x == null) return;

        if (lastAccX !== undefined) {
            const delta = Math.abs(acc.x - lastAccX) + Math.abs(acc.y - lastAccY) + Math.abs(acc.z - lastAccZ);
            if (delta > 22) {
                shakeCount++;
                clearTimeout(shakeTimer);
                shakeTimer = setTimeout(() => { shakeCount = 0; }, 700);

                if (shakeCount >= 4) {
                    shakeCount = 0;
                    getDizzy();
                }
            }
        }
        lastAccX = acc.x;
        lastAccY = acc.y;
        lastAccZ = acc.z;
    });
}

/* =========================================================
   BATTERY INTEGRATION (Hardware + Interactive Simulation)
   ========================================================= */

function updateBatteryVisuals(level, isCharging, modeLabel) {
    const percent = Math.round(level * 100);
    batteryPercent.textContent = `${percent}%`;
    batteryFill.style.width = `${percent}%`;

    batteryWidget.classList.toggle("charging", isCharging);
    batteryWidget.classList.toggle("low", level <= 0.2 && !isCharging);
    batteryStatus.textContent = isCharging ? "⚡" : modeLabel || "";

    // Toggle doodle character states
    doodle.classList.toggle("charging", isCharging);
    doodle.classList.toggle("tired", level <= 0.2 && !isCharging);

    if (isCharging) {
        doodle.style.setProperty("--glow", "#00f0ff");
    } else if (level <= 0.2) {
        doodle.style.setProperty("--glow", "#f59e0b");
    } else if (state === "idle") {
        doodle.style.setProperty("--glow", "#19eaff");
    }
}

function applyBatteryMode(mode) {
    switch (mode) {
        case "charging":
            updateBatteryVisuals(1.0, true, "⚡ Charge");
            SoundFX.play("batteryCharge");
            showMoodBubble("Supercharged! ⚡");
            break;
        case "low":
            updateBatteryVisuals(0.15, false, "🪫 Low");
            SoundFX.play("batteryLow");
            showMoodBubble("Low Battery... 😴");
            break;
        case "normal":
            updateBatteryVisuals(0.85, false, "🔋 85%");
            SoundFX.play("happy");
            showMoodBubble("Optimal Power ✨");
            break;
        case "auto":
            if (realBatteryRef) {
                updateBatteryVisuals(realBatteryRef.level, realBatteryRef.charging, "Auto");
                showMoodBubble(`Live Battery: ${Math.round(realBatteryRef.level * 100)}%`);
            } else {
                applyBatteryMode("charging");
            }
            break;
    }
}

batteryWidget.addEventListener("click", (e) => {
    e.stopPropagation();
    SoundFX.init();
    currentBatteryModeIndex = (currentBatteryModeIndex + 1) % BATTERY_MODES.length;
    applyBatteryMode(BATTERY_MODES[currentBatteryModeIndex]);
});

async function initBattery() {
    try {
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            realBatteryRef = battery;

            function onBatteryChange() {
                if (BATTERY_MODES[currentBatteryModeIndex] === "auto") {
                    updateBatteryVisuals(battery.level, battery.charging, "Auto");
                }
            }

            battery.addEventListener("chargingchange", onBatteryChange);
            battery.addEventListener("levelchange", onBatteryChange);
            applyBatteryMode("auto");
            return;
        }
    } catch (err) {
        console.log("Battery API in sandbox mode, fallback to simulation.");
    }
    // Fallback simulation mode
    applyBatteryMode("charging");
}

/* =========================================================
   TOUCH & POINTER INTERACTIONS
   ========================================================= */

function triggerNormalTap() {
    doodle.classList.remove("tap");
    void doodle.offsetWidth;
    doodle.classList.add("tap");

    SoundFX.play("tap");

    // Wake up smoothly if currently sleeping
    if (state === "sleep") {
        playExpression("wake", "Waking up... ✦");
        return;
    }

    // Random cheerful response on tap
    const tapReactions = ["happy", "wink", "excited", "love", "proud"];
    const chosen = tapReactions[Math.floor(Math.random() * tapReactions.length)];
    playExpression(chosen);
}

doodle.addEventListener("pointerdown", (e) => {
    SoundFX.init();
    pointerDown = true;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    pointerStartTime = Date.now();

    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
        if (pointerDown) {
            taps = 0;
            playExpression("sleep", "Goodnight... Zzz");
        }
    }, 700);
});

doodle.addEventListener("pointerup", (e) => {
    if (!pointerDown) return;
    pointerDown = false;
    clearTimeout(longPressTimer);

    const dx = e.clientX - pointerStartX;
    const dy = e.clientY - pointerStartY;
    const dist = Math.hypot(dx, dy);
    const duration = Date.now() - pointerStartTime;

    // Swipe gestures
    if (dist > 50 && duration < 700) {
        if (Math.abs(dy) > Math.abs(dx)) {
            if (dy < 0) {
                playExpression("excited", "Up high! 🚀");
            } else {
                playExpression("sad", "Aww... 🥺");
            }
        } else {
            if (dx > 0) {
                playExpression("curious", "Looking right? 👀");
            } else {
                playExpression("confused", "Looking left? 🧐");
            }
        }
        return;
    }

    // Tap handling
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { taps = 0; }, 450);

    if (taps === 2) {
        playExpression("laughing", "Hehehe! 😆");
    } else if (taps === 3) {
        playExpression("curious", "Curious! 🧐");
    } else if (taps >= 4) {
        taps = 0;
        playExpression("angry", "Hey, stop poking! 💢");
    } else {
        triggerNormalTap();
    }
});

doodle.addEventListener("pointercancel", () => {
    pointerDown = false;
    clearTimeout(longPressTimer);
});

/* =========================================================
   BOTTOM MOOD DOCK SETUP
   ========================================================= */

function updateActiveMoodButton(activeId) {
    const buttons = moodDock.querySelectorAll(".mood-btn");
    buttons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.id === activeId);
    });
}

function initMoodDock() {
    moodDock.innerHTML = "";
    MOOD_LIST.forEach(mood => {
        const btn = document.createElement("button");
        btn.className = "mood-btn";
        btn.dataset.id = mood.id;
        btn.title = `Expression: ${mood.label}`;
        btn.innerHTML = `
            <span class="mood-icon">${mood.iconSvg ? mood.iconSvg : mood.icon}</span>
            <span class="mood-title">${mood.label}</span>
        `;
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            SoundFX.init();
            playExpression(mood.id);
        });
        moodDock.appendChild(btn);
    });
}

dockToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    SoundFX.init();
    moodDock.classList.toggle("collapsed");
    const isCollapsed = moodDock.classList.contains("collapsed");
    dockToggle.querySelector("#dockToggleLabel").textContent = isCollapsed ? "Show Expressions 🎭" : `Expressions (${MOOD_LIST.length})`;
    if (gestureHint) {
        gestureHint.style.opacity = isCollapsed ? "1" : "0.4";
    }
});

/* =========================================================
   POWERS MODAL & VOICE EMULATOR
   ========================================================= */

const powersBtn = document.getElementById("powersBtn");
const powersModal = document.getElementById("powersModal");
const closePowersModal = document.getElementById("closePowersModal");
const voiceTestInput = document.getElementById("voiceTestInput");
const testVoiceBtn = document.getElementById("testVoiceBtn");
const voiceTestOutput = document.getElementById("voiceTestOutput");

if (powersBtn && powersModal) {
    powersBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        SoundFX.init();
        powersModal.classList.add("open");
        powersModal.setAttribute("aria-hidden", "false");
        if (typeof populateVoiceSelector === "function") {
            populateVoiceSelector();
        }
    });
}

if (closePowersModal && powersModal) {
    closePowersModal.addEventListener("click", () => {
        powersModal.classList.remove("open");
        powersModal.setAttribute("aria-hidden", "true");
    });

    powersModal.addEventListener("click", (e) => {
        if (e.target === powersModal) {
            powersModal.classList.remove("open");
            powersModal.setAttribute("aria-hidden", "true");
        }
    });
}

/* =========================================================
   LIVE VOICE COMPANION & RECOGNITION ENGINE
   Continuous listening with auto-recovery on silence.
   Requires wake word: "Doodle" or "Doddle" to trigger commands.
   Responds with high-pitched, cute companion voice synthesis.
   ========================================================= */

const SpeechRecognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
let recognition = null;
let isMicActive = false;
let isRecognitionRunning = false;
let isSpeakingResponse = false;
let micRestartTimeout = null;

function updateMicUI(listening) {
    if (micToggle) {
        if (listening) {
            micToggle.classList.add("active");
            if (micLabel) micLabel.textContent = "Mic ON";
        } else {
            micToggle.classList.remove("active");
            if (micLabel) micLabel.textContent = "Mic OFF";
        }
    }

    if (modalMicToggle) {
        if (listening) {
            modalMicToggle.classList.add("active");
            if (modalMicText) modalMicText.textContent = "Stop Listening";
            if (modalMicIcon) modalMicIcon.textContent = "⏹️";
        } else {
            modalMicToggle.classList.remove("active");
            if (modalMicText) modalMicText.textContent = "Start Listening";
            if (modalMicIcon) modalMicIcon.textContent = "🎤";
        }
    }

    if (voiceStatusBadge) {
        if (listening) {
            voiceStatusBadge.textContent = "LISTENING LIVE";
            voiceStatusBadge.classList.add("listening");
        } else {
            voiceStatusBadge.textContent = "MIC PAUSED";
            voiceStatusBadge.classList.remove("listening");
        }
    }

    if (hearingDot) {
        if (listening) {
            hearingDot.classList.add("listening");
        } else {
            hearingDot.classList.remove("listening");
        }
    }

    if (hearingStatusText) {
        if (listening) {
            hearingStatusText.textContent = "Listening continuously... Say 'Doodle' followed by your command!";
        } else {
            hearingStatusText.textContent = "Microphone paused. Click 'Start Listening' to speak with Doodle.";
        }
    }
}

function doodleSpeakAndEmote(voiceText, bubbleText, expressionName) {
    if (expressionName) {
        playExpression(expressionName);
    }
    showMoodBubble(bubbleText || voiceText, 3800);

    // Pause recognition while speaking so Doodle doesn't hear itself
    if (isMicActive && recognition && isRecognitionRunning) {
        isSpeakingResponse = true;
        try {
            recognition.abort();
        } catch (e) {}
    }

    DoodleVoice.speak(
        voiceText,
        () => {
            // onStart: eye bounce/pulse talking animation
            if (doodle) {
                doodle.classList.add("talking");
            }
        },
        () => {
            // onEnd: safely resume continuous listening
            if (doodle) {
                doodle.classList.remove("talking");
            }
            if (isMicActive) {
                setTimeout(() => {
                    isSpeakingResponse = false;
                    restartMicSession();
                }, 350);
            } else {
                isSpeakingResponse = false;
            }
        }
    );
}

function parseVoiceInput(spokenText) {
    const clean = (spokenText || "").toLowerCase().trim();
    if (!clean) return null;

    // Wake word pattern matching start of phrase: "jarvis", "hey jarvis", "hi jarvis", "ok jarvis", etc.
    const wakeRegex = /^(?:hey\s+|hi\s+|ok\s+|okay\s+|yo\s+|hello\s+)?(?:jarvis|javis|jarves|travis|doodle|doddle)\b[,\s]*(.*)$/i;
    const match = clean.match(wakeRegex);

    if (!match) {
        return {
            hasWakeWord: false,
            isNameOnly: false,
            raw: clean,
            command: clean
        };
    }

    const remaining = (match[1] || "").trim();
    // Check if only the name was called (e.g. "Jarvis", "Hey Jarvis!", "Jarvis?")
    const isNameOnly = !remaining || ["?", "!", ".", ""].includes(remaining);

    return {
        hasWakeWord: true,
        isNameOnly: isNameOnly,
        raw: clean,
        command: remaining
    };
}

// Client-side smart fallback if backend network is unreachable
function smartClientFallback(queryText) {
    const clean = (queryText || "").trim();
    const lower = clean.toLowerCase();

    // Only name or wake word called
    if (!clean || /^(?:hey\s+|hi\s+|ok\s+|yo\s+|hello\s+)?(?:jarvis|javis|jarves)[?!.]*$/i.test(lower)) {
        const acks = [
            "Yes, I am here. How can I help you?",
            "At your service, sir. What do you need?",
            "Online and listening. What's on your mind?",
            "Standing by. How can I assist you?",
            "Yes, boss? Ready when you are."
        ];
        return {
            reply: acks[Math.floor(Math.random() * acks.length)],
            bubble: "At your service! ✨",
            mood: "look_up"
        };
    }

    // Stripped query
    const stripped = lower.replace(/^(?:hey\s+|hi\s+|ok\s+|yo\s+|hello\s+)?(?:jarvis|javis|jarves)\b[,\s]*/i, '').trim() || lower;

    // App launches
    const openMatch = stripped.match(/^(?:open|launch|start|go to|run|show me)\s+(.+)$/i);
    if (openMatch) {
        const app = openMatch[1].trim();
        const formatted = app.charAt(0).toUpperCase() + app.slice(1);
        let mood = "excited";
        if (/youtube/i.test(app)) mood = "boombox";
        else if (/spotify|music|song/i.test(app)) mood = "boombox";
        else if (/camera|photo/i.test(app)) mood = "wink";
        else if (/calc/i.test(app)) mood = "thinking";
        return {
            reply: `Opening ${formatted} right now for you.`,
            bubble: `Opening ${formatted}... 🚀`,
            mood: mood,
            app: formatted
        };
    }

    // Time & Date
    if (/time|what time|clock/i.test(stripped)) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
            reply: `The current time is ${timeStr}.`,
            bubble: `Time: ${timeStr} ⌚`,
            mood: "cool"
        };
    }

    if (/date|what day|today/i.test(stripped)) {
        const now = new Date();
        const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        return {
            reply: `Today is ${dateStr}.`,
            bubble: `${dateStr} 📅`,
            mood: "look_up"
        };
    }

    // Math calculation
    const mathMatch = stripped.match(/(?:what is|calculate|solve|what's)?\s*([0-9\s\+\-\*\/\.\(\)\^xX]+)\s*(?:\?|$)/i);
    if (mathMatch && mathMatch[1] && /[0-9]/.test(mathMatch[1]) && /[\+\-\*\/\^xX]/.test(mathMatch[1])) {
        try {
            const sanitized = mathMatch[1].replace(/x/gi, '*').replace(/\^/g, '**').replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
            const result = Function(`'use strict'; return (${sanitized})`)();
            if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                return {
                    reply: `That equals ${result}.`,
                    bubble: `= ${result} 🧮`,
                    mood: "thinking"
                };
            }
        } catch (e) {}
    }

    // Identity
    if (/who are you|what is your name|your name/i.test(stripped)) {
        return {
            reply: "I am Jarvis, your digital AI companion. Always online and ready to assist.",
            bubble: "I am Jarvis! 🤖",
            mood: "cool"
        };
    }

    // Jokes
    if (/joke|make me laugh|funny/i.test(stripped)) {
        const jokes = [
            "Why don't robots ever panic? Because they have nerves of steel!",
            "Why was the computer cold? It left its Windows open!",
            "There are 10 types of people: those who understand binary, and those who don't."
        ];
        return {
            reply: jokes[Math.floor(Math.random() * jokes.length)],
            bubble: "Haha! 😂",
            mood: "wink"
        };
    }

    // Moods
    if (/sleep|night|tired/i.test(stripped)) {
        return {
            reply: "Entering standby mode. Goodnight, sir.",
            bubble: "Standby... Zzz 💤",
            mood: "sleep"
        };
    }

    if (/party|dance|beat/i.test(stripped)) {
        return {
            reply: "Cranking up the party beats! Let's groove.",
            bubble: "Party Beats! 📻🎶",
            mood: "boombox"
        };
    }

    if (/wake|morning/i.test(stripped)) {
        return {
            reply: "Good morning! Jarvis is awake and fully operational.",
            bubble: "Jarvis is Awake! ☀️",
            mood: "happy"
        };
    }

    if (/love|cute|friend/i.test(stripped)) {
        return {
            reply: "Thank you! I am delighted to be your companion.",
            bubble: "Always here for you! 💖",
            mood: "love"
        };
    }

    return {
        reply: `I heard ${clean.slice(0, 30)}. I am Jarvis, here to help you.`,
        bubble: `Jarvis: "${clean.slice(0, 20)}"`,
        mood: "curious"
    };
}

async function askJarvisServer(queryText) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch("/api/jarvis/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: queryText }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("Status " + res.status);
        const data = await res.json();
        return data;
    } catch (err) {
        console.warn("Using smart client fallback:", err.message);
        return smartClientFallback(queryText);
    }
}

async function executeVoiceCommand(spokenText, isFromMic = false) {
    const parsed = parseVoiceInput(spokenText);
    if (!parsed) return;

    SoundFX.init();

    // 1. If ONLY Jarvis's name is called (e.g. "Jarvis!", "Hey Jarvis", "Jarvis?"):
    if (parsed.isNameOnly || ["hi", "hello", "hey", "what's up", "listen", "you there", "are you there"].includes(parsed.command)) {
        const acknowledgments = [
            "Yes, I am here. How can I help you?",
            "At your service, sir. What do you need?",
            "Online and listening. What's on your mind?",
            "Standing by. How can I assist you?",
            "Yes, boss? Ready when you are."
        ];
        const ack = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
        doodleSpeakAndEmote(ack, "At your service! ✨", "look_up");

        if (voiceTestOutput) {
            voiceTestOutput.innerHTML = `✨ <strong>Jarvis Ready:</strong> <span style="color:#19eaff">Wake name acknowledged ("${spokenText}")</span>`;
        }
        return;
    }

    // 2. Any other query or command -> Talk normally and smartly!
    // Strip wake word if present so the query is clean, or use raw if spoken directly
    const query = parsed.hasWakeWord ? (parsed.command || parsed.raw) : parsed.raw;

    // Show instant visual listening/thinking feedback
    showMoodBubble("Thinking... 💭", 1600);
    playExpression("thinking");

    if (voiceTestOutput) {
        voiceTestOutput.innerHTML = `⏳ <em>Jarvis is processing: "${query}"...</em>`;
    }

    // Fetch intelligent response from Jarvis AI backend (with smart client fallback)
    const result = await askJarvisServer(query);

    if (result && result.reply) {
        doodleSpeakAndEmote(
            result.reply,
            result.bubble || result.reply,
            result.mood || "happy"
        );

        if (voiceTestOutput) {
            if (result.app) {
                voiceTestOutput.innerHTML = `🚀 <strong>App Launched:</strong> <span style="color:#19eaff">${result.app}</span> &bull; <em>"${result.reply}"</em>`;
            } else {
                voiceTestOutput.innerHTML = `💬 <strong>Jarvis:</strong> <span style="color:#38ef7d">"${result.reply}"</span>`;
            }
        }
    }
}

function initSpeechRecognition() {
    if (!SpeechRecognition) {
        console.warn("SpeechRecognition not supported in this browser.");
        return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 3;

    rec.onstart = () => {
        isRecognitionRunning = true;
        updateMicUI(true);
    };

    rec.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText && liveTranscriptBox) {
            liveTranscriptBox.innerHTML = `<span>&ldquo;${currentText}&rdquo;</span>`;
        }

        // When a final phrase is recognized
        if (finalTranscript.trim()) {
            executeVoiceCommand(finalTranscript.trim(), true);
        }
    };

    rec.onerror = (event) => {
        // Non-fatal errors like 'no-speech' happen during momentary pauses.
        // Never terminate continuous listening on silence!
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            isMicActive = false;
            updateMicUI(false);
            showMoodBubble("Mic permission needed to hear you!");
        }
    };

    rec.onend = () => {
        isRecognitionRunning = false;
        // Robust continuous listening loop: auto-rearm
        if (isMicActive && !isSpeakingResponse) {
            clearTimeout(micRestartTimeout);
            micRestartTimeout = setTimeout(() => {
                restartMicSession();
            }, 200);
        }
    };

    return rec;
}

function restartMicSession() {
    if (!isMicActive || isSpeakingResponse || isRecognitionRunning) return;
    if (!recognition) {
        recognition = initSpeechRecognition();
    }
    if (recognition) {
        try {
            recognition.start();
        } catch (e) {
            // Ignore if already active or transitioning
        }
    }
}

function toggleMic(desiredState) {
    SoundFX.init();
    const newState = desiredState !== undefined ? desiredState : !isMicActive;

    if (!SpeechRecognition) {
        showMoodBubble("Web Speech not supported in this browser");
        return;
    }

    isMicActive = newState;
    clearTimeout(micRestartTimeout);

    if (isMicActive) {
        SoundFX.play("listen_start");
        updateMicUI(true);
        if (liveTranscriptBox) {
            liveTranscriptBox.innerHTML = `<span class="transcript-placeholder">Listening... Call "Jarvis" or ask anything!</span>`;
        }
        doodleSpeakAndEmote(
            "Jarvis is online and listening. How may I assist you, sir?",
            "Jarvis listening... ✨",
            "look_up"
        );
        restartMicSession();
    } else {
        SoundFX.play("listen_stop");
        updateMicUI(false);
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {}
        }
        showMoodBubble("Mic paused");
    }
}

if (micToggle) {
    micToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMic();
    });
}

if (modalMicToggle) {
    modalMicToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMic();
    });
}

if (testVoiceBtn && voiceTestInput) {
    testVoiceBtn.addEventListener("click", () => {
        const text = voiceTestInput.value.trim();
        if (text) {
            executeVoiceCommand(text, false);
        }
    });

    voiceTestInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const text = voiceTestInput.value.trim();
            if (text) {
                executeVoiceCommand(text, false);
            }
        }
    });
}

function populateVoiceSelector() {
    if (!voiceSelect) return;
    const voices = JarvisVoice.getVoices();
    if (!voices || !voices.length) {
        JarvisVoice.populateVoices();
    }
    const currentVoices = JarvisVoice.getVoices();
    if (!currentVoices || !currentVoices.length) return;

    const selectedVoice = JarvisVoice.getSelectedVoice();
    const currentSelectedURI = selectedVoice ? selectedVoice.voiceURI : "";

    voiceSelect.innerHTML = "";

    // Auto Best Male Option
    const autoOpt = document.createElement("option");
    autoOpt.value = "";
    autoOpt.textContent = `⭐ Auto Best Male (${selectedVoice ? selectedVoice.name : "Detected"})`;
    voiceSelect.appendChild(autoOpt);

    const maleGroup = document.createElement("optgroup");
    maleGroup.label = "👔 Recommended Male Voices";

    const otherGroup = document.createElement("optgroup");
    otherGroup.label = "🌐 Other System Voices";

    let maleCount = 0;
    currentVoices.forEach(v => {
        const isMale = JarvisVoice.isMaleVoice(v);
        const opt = document.createElement("option");
        opt.value = v.voiceURI;
        const prefix = isMale ? "👔 " : "";
        opt.textContent = `${prefix}${v.name} (${v.lang})`;

        if (isMale) {
            maleGroup.appendChild(opt);
            maleCount++;
        } else {
            otherGroup.appendChild(opt);
        }
    });

    if (maleCount > 0) {
        voiceSelect.appendChild(maleGroup);
    }
    voiceSelect.appendChild(otherGroup);

    if (currentSelectedURI) {
        voiceSelect.value = currentSelectedURI;
    } else {
        voiceSelect.value = "";
    }

    if (voiceSelectedLabel && selectedVoice) {
        voiceSelectedLabel.textContent = JarvisVoice.isMaleVoice(selectedVoice) ? "Male Active 👔" : "Selected";
    }
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        JarvisVoice.populateVoices();
        populateVoiceSelector();
    };
    setTimeout(() => {
        JarvisVoice.populateVoices();
        populateVoiceSelector();
    }, 400);
}

if (voiceSelect) {
    voiceSelect.addEventListener("change", () => {
        const uri = voiceSelect.value;
        JarvisVoice.setVoiceURI(uri);
        const current = JarvisVoice.getSelectedVoice();
        if (voiceSelectedLabel && current) {
            voiceSelectedLabel.textContent = JarvisVoice.isMaleVoice(current) ? "Male Active 👔" : "Selected";
        }
    });
}

if (voiceSpeedSlider && voiceSpeedVal) {
    voiceSpeedSlider.addEventListener("input", () => {
        const rate = parseFloat(voiceSpeedSlider.value);
        JarvisVoice.setRate(rate);
        let speedDesc = "(Natural)";
        if (rate >= 1.35) speedDesc = "(Brisk)";
        else if (rate > 1.1) speedDesc = "(Active)";
        else if (rate < 0.85) speedDesc = "(Slow)";
        voiceSpeedVal.textContent = `${rate.toFixed(2)}x ${speedDesc}`;
    });
}

if (voicePitchSlider && voicePitchVal) {
    voicePitchSlider.addEventListener("input", () => {
        const pitch = parseFloat(voicePitchSlider.value);
        JarvisVoice.setPitch(pitch);
        let toneDesc = "(Deep Male)";
        if (pitch < 0.8) toneDesc = "(Deep Baritone)";
        else if (pitch > 1.05) toneDesc = "(Bright Tone)";
        voicePitchVal.textContent = `${pitch.toFixed(2)}x ${toneDesc}`;
    });
}

if (previewVoiceBtn) {
    previewVoiceBtn.addEventListener("click", () => {
        doodleSpeakAndEmote(
            "Jarvis systems fully operational. Ready for your command, sir.",
            "Jarvis is Online! ⚡",
            "cool"
        );
    });
}

/* =========================================================
   STARTUP INITIALIZATION
   ========================================================= */

initMoodDock();
applyExpression("idle", false);
scheduleBlink();
resetIdle();
initBattery();

