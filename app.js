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
   STARTUP INITIALIZATION
   ========================================================= */

initMoodDock();
applyExpression("idle", false);
scheduleBlink();
resetIdle();
initBattery();
