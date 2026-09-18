/* =========================================================
   PIXEL DOODLE 8-BIT CHIPTUNE SOUND ENGINE
   Synthesizes retro game audio purely via Web Audio API.
   Zero external dependencies or sound assets needed.
   ========================================================= */

const SoundFX = (function() {
    let ctx = null;
    let isMuted = false;

    // Load saved mute preference
    try {
        const saved = localStorage.getItem("doodle_muted");
        if (saved !== null) {
            isMuted = saved === "true";
        }
    } catch (e) {
        // LocalStorage fallback
    }

    // Lazy initialization of AudioContext on first user interaction
    function getContext() {
        if (!ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                ctx = new AudioCtx();
            }
        }
        if (ctx && ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }
        return ctx;
    }

    // Helper to synthesize a note or frequency tone
    function tone(freq, type = "square", startTime = 0, duration = 0.1, gainVal = 0.15) {
        const ac = getContext();
        if (!ac || isMuted) return;

        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime + startTime);

        gain.gain.setValueAtTime(0.001, ac.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(gainVal, ac.currentTime + startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(ac.currentTime + startTime);
        osc.stop(ac.currentTime + startTime + duration + 0.05);
    }

    // Helper for pitch-sweeping tones (boings, chirps, lasers)
    function sweep(startFreq, endFreq, type = "sine", startTime = 0, duration = 0.15, gainVal = 0.18) {
        const ac = getContext();
        if (!ac || isMuted) return;

        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, ac.currentTime + startTime);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), ac.currentTime + startTime + duration);

        gain.gain.setValueAtTime(0.001, ac.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(gainVal, ac.currentTime + startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(ac.currentTime + startTime);
        osc.stop(ac.currentTime + startTime + duration + 0.05);
    }

    // White noise generator for sleepy puffs, squishes, or mechanical clicks
    function noise(startTime = 0, duration = 0.08, gainVal = 0.08) {
        const ac = getContext();
        if (!ac || isMuted) return;

        const bufferSize = ac.sampleRate * duration;
        const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ac.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = ac.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1200;

        const gain = ac.createGain();
        gain.gain.setValueAtTime(gainVal, ac.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startTime + duration);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);

        whiteNoise.start(ac.currentTime + startTime);
        whiteNoise.stop(ac.currentTime + startTime + duration);
    }

    // Play distinct 8-bit sound presets matching moods and interactions
    function play(soundName) {
        if (isMuted) return;
        getContext();

        switch (soundName) {
            case "tap":
                // Punchy 8-bit squish boing
                sweep(180, 520, "triangle", 0, 0.08, 0.18);
                break;

            case "blink":
                // Very subtle soft micro-tick
                tone(880, "sine", 0, 0.02, 0.03);
                break;

            case "happy":
                // Upbeat rising major 3rd chiptune arpeggio
                tone(523.25, "square", 0, 0.07, 0.12);    // C5
                tone(659.25, "square", 0.07, 0.07, 0.14); // E5
                tone(783.99, "square", 0.14, 0.12, 0.15); // G5
                break;

            case "excited":
                // Rapid hyper staccato cheer
                tone(659.25, "square", 0, 0.05, 0.12);     // E5
                tone(783.99, "square", 0.05, 0.05, 0.13);  // G5
                tone(987.77, "square", 0.10, 0.05, 0.14);  // B5
                tone(1318.51, "square", 0.15, 0.12, 0.15); // E6
                break;

            case "surprised":
                // High rising boing sweep
                sweep(340, 920, "sine", 0, 0.18, 0.18);
                tone(920, "triangle", 0.14, 0.08, 0.12);
                break;

            case "curious":
                // Inquisitive two-tone rising question
                tone(440, "triangle", 0, 0.09, 0.14);
                tone(660, "triangle", 0.10, 0.14, 0.16);
                break;

            case "confused":
                // Detuned wobbling slide down
                sweep(500, 310, "square", 0, 0.14, 0.12);
                tone(330, "sawtooth", 0.14, 0.14, 0.10);
                break;

            case "angry":
                // Gritty low buzzing growl
                tone(140, "sawtooth", 0, 0.12, 0.20);
                tone(110, "sawtooth", 0.08, 0.14, 0.22);
                tone(85, "sawtooth", 0.16, 0.16, 0.24);
                break;

            case "sad":
                // Melancholy falling minor triad slide
                tone(392, "triangle", 0, 0.14, 0.15);      // G4
                tone(311.13, "triangle", 0.12, 0.16, 0.14); // Eb4
                tone(261.63, "triangle", 0.26, 0.24, 0.12); // C4
                break;

            case "sleep":
            case "sleepy":
                // Gentle lullaby descending chime
                tone(523.25, "sine", 0, 0.18, 0.09);
                tone(392, "sine", 0.16, 0.22, 0.07);
                tone(261.63, "sine", 0.34, 0.35, 0.05);
                break;

            case "thinking":
                // Rhythmic computing clock ticks
                tone(800, "square", 0, 0.04, 0.08);
                tone(1000, "square", 0.12, 0.04, 0.08);
                tone(1200, "square", 0.24, 0.04, 0.08);
                break;

            case "laughing":
                // Staccato bouncing chuckle
                tone(587.33, "square", 0, 0.05, 0.12);
                tone(783.99, "square", 0.08, 0.06, 0.14);
                tone(587.33, "square", 0.16, 0.05, 0.12);
                tone(880, "square", 0.24, 0.08, 0.15);
                break;

            case "listening":
            case "listen_start":
                // Soft dual rising chime indicating listening
                tone(659.25, "sine", 0, 0.08, 0.12);
                tone(880, "sine", 0.07, 0.12, 0.14);
                break;

            case "listen_stop":
                // Gentle falling tone indicating mic paused
                tone(783.99, "sine", 0, 0.08, 0.10);
                tone(523.25, "sine", 0.07, 0.10, 0.08);
                break;

            case "cute_chirp":
            case "cute_perk":
                // Cheerful 4-note ascending companion pet chirp
                tone(1046.50, "sine", 0, 0.04, 0.12); // C6
                tone(1318.51, "sine", 0.035, 0.04, 0.14); // E6
                tone(1567.98, "sine", 0.07, 0.04, 0.15); // G6
                tone(2093.00, "sine", 0.105, 0.09, 0.16); // C7
                break;

            case "speaking":
                // Retro animal-crossing vowel blips
                tone(380, "triangle", 0, 0.04, 0.12);
                tone(520, "triangle", 0.05, 0.04, 0.12);
                tone(440, "triangle", 0.10, 0.04, 0.12);
                tone(620, "triangle", 0.15, 0.05, 0.12);
                break;

            case "attention":
                // Crisp dual bell chime
                tone(880, "sine", 0, 0.10, 0.16);
                tone(1318.51, "sine", 0.10, 0.18, 0.18);
                break;

            case "loading":
                // Digital progression tick
                tone(700, "triangle", 0, 0.05, 0.09);
                tone(840, "triangle", 0.07, 0.05, 0.09);
                break;

            case "dizzy":
            case "shake":
                // Cartoon dizzy wobbling spiral
                sweep(680, 220, "sawtooth", 0, 0.22, 0.15);
                sweep(220, 580, "triangle", 0.20, 0.20, 0.14);
                sweep(580, 180, "sawtooth", 0.38, 0.24, 0.15);
                break;

            case "love":
                // Romantic warm sparkle arpeggio
                tone(523.25, "triangle", 0, 0.10, 0.14);
                tone(659.25, "triangle", 0.08, 0.10, 0.15);
                tone(783.99, "triangle", 0.16, 0.12, 0.16);
                tone(1046.50, "sine", 0.24, 0.20, 0.18);
                break;

            case "wink":
                // Playful laser chirp
                sweep(880, 440, "sawtooth", 0, 0.08, 0.14);
                tone(660, "square", 0.07, 0.06, 0.12);
                break;

            case "cool":
                // Funky bass slide
                tone(220, "triangle", 0, 0.10, 0.18);
                sweep(220, 146.83, "triangle", 0.08, 0.16, 0.18);
                break;

            case "shocked":
            case "scared":
                // Rapid shivering tremor
                tone(800, "square", 0, 0.03, 0.14);
                tone(740, "square", 0.04, 0.03, 0.14);
                tone(820, "square", 0.08, 0.03, 0.14);
                tone(760, "square", 0.12, 0.04, 0.14);
                break;

            case "proud":
                // Victory fanfare triad
                tone(523.25, "square", 0, 0.08, 0.13);
                tone(659.25, "square", 0.08, 0.08, 0.14);
                tone(1046.50, "square", 0.16, 0.20, 0.16);
                break;

            case "specs":
                // Futuristic cybernetic spectacles equip chime
                tone(587.33, "triangle", 0, 0.06, 0.12);
                tone(880, "sine", 0.05, 0.08, 0.14);
                tone(1318.51, "square", 0.10, 0.16, 0.15);
                break;

            case "boombox":
                // Initial boombox power-on scratch and sub kick
                sweep(160, 35, "sine", 0, 0.18, 0.22);
                tone(523.25, "square", 0.08, 0.06, 0.15);
                tone(659.25, "square", 0.14, 0.08, 0.16);
                break;

            case "matrix":
                // Cyber hacker data stream blip
                tone(1200, "sawtooth", 0, 0.03, 0.10);
                tone(600, "square", 0.03, 0.03, 0.10);
                tone(1400, "sawtooth", 0.06, 0.03, 0.10);
                tone(800, "square", 0.09, 0.04, 0.10);
                break;

            case "batteryCharge":
                // High-tech electric powerup chime
                tone(440, "square", 0, 0.08, 0.12);
                tone(554.37, "square", 0.07, 0.08, 0.14);
                tone(659.25, "square", 0.14, 0.08, 0.15);
                tone(880, "triangle", 0.21, 0.18, 0.18);
                break;

            case "batteryLow":
                // Low power warning double beep
                tone(440, "sawtooth", 0, 0.10, 0.12);
                tone(330, "sawtooth", 0.14, 0.16, 0.14);
                break;

            default:
                tone(440, "square", 0, 0.06, 0.10);
                break;
        }
    }

    /* =========================================================
       8-BIT RETRO CHIPTUNE BOOMBOX SONG ENGINE
       Synthesizes a 4-bar looping arcade song with bass, lead & beats
       ========================================================= */

    let songTimer = null;
    let isBoomboxPlaying = false;
    let songStep = 0;

    // 16-step melody notes (frequencies in Hz)
    const LEAD_MELODY = [
        523.25, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25,
        587.33, 698.46, 880.00, 987.77, 1174.66, 987.77, 880.00, 698.46,
        659.25, 783.99, 987.77, 1046.50, 1318.51, 1046.50, 987.77, 783.99,
        698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51, 1046.50
    ];

    // Bassline notes
    const BASS_LINE = [
        130.81, 196.00, 130.81, 196.00, 164.81, 196.00, 130.81, 196.00,
        146.83, 220.00, 146.83, 220.00, 174.61, 220.00, 146.83, 220.00,
        164.81, 246.94, 164.81, 246.94, 196.00, 246.94, 164.81, 246.94,
        174.61, 261.63, 196.00, 293.66, 130.81, 196.00, 261.63, 196.00
    ];

    function playKick() {
        sweep(140, 38, "sine", 0, 0.09, 0.22);
    }

    function playSnare() {
        noise(0, 0.07, 0.13);
        tone(220, "triangle", 0, 0.05, 0.12);
    }

    function playHiHat() {
        noise(0, 0.025, 0.06);
    }

    function stepSong() {
        if (!isBoomboxPlaying) return;

        const ac = getContext();
        if (ac && !isMuted) {
            const step = songStep % 32;

            // Lead note
            const leadFreq = LEAD_MELODY[step];
            if (leadFreq) {
                tone(leadFreq, "square", 0, 0.09, 0.11);
            }

            // Bass note
            const bassFreq = BASS_LINE[step];
            if (bassFreq) {
                tone(bassFreq, "triangle", 0, 0.11, 0.16);
            }

            // Drum beats
            if (step % 8 === 0 || step % 8 === 6) {
                playKick();
            } else if (step % 8 === 4) {
                playSnare();
            }

            if (step % 2 === 0) {
                playHiHat();
            }
        }

        songStep = (songStep + 1) % 32;
        songTimer = setTimeout(stepSong, 115); // ~130 BPM 16th notes
    }

    function startBoomboxSong() {
        if (isBoomboxPlaying) return;
        getContext();
        isBoomboxPlaying = true;
        songStep = 0;
        stepSong();
    }

    function stopBoomboxSong() {
        isBoomboxPlaying = false;
        if (songTimer) {
            clearTimeout(songTimer);
            songTimer = null;
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        try {
            localStorage.setItem("doodle_muted", isMuted ? "true" : "false");
        } catch (e) {}
        return isMuted;
    }

    return {
        init: getContext,
        play: play,
        startBoomboxSong: startBoomboxSong,
        stopBoomboxSong: stopBoomboxSong,
        isBoomboxPlaying: () => isBoomboxPlaying,
        toggleMute: toggleMute,
        isMuted: () => isMuted
    };
})();

/* =========================================================
   JARVIS VOICE ASSISTANT SYNTHESIS ENGINE
   Clear, natural AI assistant persona with crystal-clear pronunciation.
   Calibrated natural tone (1.18x) and brisk conversational speed (1.40x).
   ========================================================= */

const JarvisVoice = (function() {
    let synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
    let voices = [];
    let isSpeaking = false;
    let preferredVoiceURI = "";
    let voiceRate = 1.40;   // 1.40x conversational speed as requested
    let voicePitch = 0.88;  // Natural, sophisticated male pitch

    function populateVoices() {
        if (!synth) return;
        try {
            voices = synth.getVoices() || [];
        } catch (e) {
            voices = [];
        }
    }

    if (synth) {
        populateVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => {
                populateVoices();
            };
        }
    }

    function isFemaleVoice(v) {
        if (!v) return false;
        const name = (v.name || "").toLowerCase();
        const uri = (v.voiceURI || "").toLowerCase();
        const combined = `${name} ${uri}`.toLowerCase();

        // If explicitly tagged male, it is NOT female
        if (/\b(male|guy|man|boy)\b/i.test(name)) return false;

        // Explicit female tags
        if (/\b(female|woman|girl|lady)\b/i.test(combined)) return true;

        // "Google US English" is female in Chrome!
        if (name === "google us english" || uri.includes("google us english") || name.startsWith("google us english")) {
            return true;
        }
        if (name.includes("uk english female") || name.includes("us english female")) {
            return true;
        }

        const femaleNames = [
            "samantha", "victoria", "karen", "zira", "moira", "tessa", "fiona", "susan",
            "kathy", "linda", "heather", "alice", "ava", "serena", "yuri", "helena", "zuzana",
            "anna", "elena", "stephanie", "sarah", "julie", "jenny", "aria", "ana", "hazel",
            "catherine", "veena", "neerja", "swara", "ioana", "amelie", "marlene", "vicki",
            "kyoko", "sin-ji", "ting-ting", "yuna", "paulina", "monica", "luciana", "agnes", "melina"
        ];
        return femaleNames.some(fn => combined.includes(fn));
    }

    function isMaleVoice(v) {
        if (!v) return false;
        if (isFemaleVoice(v)) return false;
        const name = (v.name || "").toLowerCase();
        const uri = (v.voiceURI || "").toLowerCase();
        const combined = `${name} ${uri}`;

        if (/\b(male|guy|man|boy)\b/i.test(combined)) return true;

        const maleNames = [
            "daniel", "david", "guy", "alex", "fred", "ralph", "tom", "george", "oliver",
            "arthur", "thomas", "ryan", "christopher", "eric", "ravi", "james", "richard",
            "mark", "rishi", "prabhat", "lee", "nathan", "aaron", "gordon", "sean", "liam"
        ];
        return maleNames.some(mn => combined.includes(mn));
    }

    function selectJarvisVoice() {
        if (!voices.length && synth) {
            populateVoices();
        }
        if (!voices.length) return null;

        if (preferredVoiceURI) {
            const manual = voices.find(v => v.voiceURI === preferredVoiceURI || v.name === preferredVoiceURI);
            if (manual) return manual;
        }

        // 1. High priority: British & US Male voices (ideal for Jarvis persona)
        const malePatterns = [
            /Google.*UK.*English.*Male/i,
            /Google.*US.*English.*Male/i,
            /Daniel/i,             // British Jarvis voice on Mac/iOS
            /Microsoft.*Guy/i,     // Natural warm male voice on Windows/Edge
            /Microsoft.*David/i,   // Windows standard male
            /Microsoft.*George/i,  // Windows UK male
            /Microsoft.*Mark/i,
            /Microsoft.*Ryan/i,
            /Microsoft.*Christopher/i,
            /Microsoft.*Eric/i,
            /Microsoft.*Ravi/i,
            /Oliver/i,
            /George/i,
            /Arthur/i,
            /Thomas/i,
            /Alex/i,               // Standard Apple male
            /Fred/i,
            /\bMale\b/i            // Any voice explicitly tagged Male
        ];

        for (const pattern of malePatterns) {
            const match = voices.find(v => (pattern.test(v.name) || pattern.test(v.voiceURI)) && !isFemaleVoice(v));
            if (match) return match;
        }

        // 2. Any voice identified as male with English locale
        const anyMaleEnglish = voices.find(v => isMaleVoice(v) && /^en/i.test(v.lang));
        if (anyMaleEnglish) return anyMaleEnglish;

        // 3. Any voice identified as male
        const anyMale = voices.find(v => isMaleVoice(v));
        if (anyMale) return anyMale;

        // 4. Any English voice that is NOT female
        const nonFemaleEnglish = voices.find(v => /^en/i.test(v.lang) && !isFemaleVoice(v));
        if (nonFemaleEnglish) return nonFemaleEnglish;

        // 5. Any voice that is NOT female
        const nonFemaleAny = voices.find(v => !isFemaleVoice(v));
        if (nonFemaleAny) return nonFemaleAny;

        return voices[0] || null;
    }

    function speak(text, onStart, onEnd) {
        if (!text) return;

        // Play subtle perk chirp before talking
        SoundFX.play("cute_chirp");

        if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
            if (onStart) onStart();
            setTimeout(() => {
                if (onEnd) onEnd();
            }, 1000);
            return;
        }

        try {
            // Unstick Chrome speech synthesis if paused
            if (synth.paused) {
                synth.resume();
            }
            synth.cancel();

            // Safe micro-delay prevents Chrome utterance cancellation bug
            setTimeout(() => {
                try {
                    const utterance = new SpeechSynthesisUtterance(text);

                    const voice = selectJarvisVoice();
                    if (voice) {
                        utterance.voice = voice;
                        utterance.lang = voice.lang || "en-US";
                    } else {
                        utterance.lang = "en-US";
                    }

                    // If the available voice is detected as female/generic, shift pitch down to a masculine formant
                    let effectivePitch = voicePitch;
                    if (voice && isFemaleVoice(voice)) {
                        effectivePitch = Math.min(voicePitch, 0.74);
                    }

                    // Sophisticated natural male assistant pitch
                    utterance.pitch = Math.min(Math.max(effectivePitch, 0.5), 1.3);
                    // Brisk, crisp conversational rate (1.40x default)
                    utterance.rate = Math.min(Math.max(voiceRate, 0.5), 2.0);
                    utterance.volume = SoundFX.isMuted() ? 0 : 0.95;

                    utterance.onstart = () => {
                        isSpeaking = true;
                        if (onStart) onStart();
                    };

                    utterance.onend = () => {
                        isSpeaking = false;
                        if (onEnd) onEnd();
                    };

                    utterance.onerror = (e) => {
                        console.warn("Speech synthesis notice:", e);
                        isSpeaking = false;
                        if (onEnd) onEnd();
                    };

                    synth.speak(utterance);
                } catch (innerErr) {
                    console.warn("Speech speak call failed:", innerErr);
                    isSpeaking = false;
                    if (onEnd) onEnd();
                }
            }, 25);

        } catch (err) {
            console.warn("Unable to trigger speech synthesis:", err);
            isSpeaking = false;
            if (onEnd) onEnd();
        }
    }

    function cancel() {
        if (synth) {
            try {
                synth.cancel();
            } catch (e) {}
        }
        isSpeaking = false;
    }

    function setRate(newRate) {
        const val = parseFloat(newRate);
        if (!isNaN(val) && val >= 0.5 && val <= 1.8) {
            voiceRate = val;
        }
    }

    function setPitch(newPitch) {
        const val = parseFloat(newPitch);
        if (!isNaN(val) && val >= 0.5 && val <= 1.5) {
            voicePitch = val;
        }
    }

    function setVoiceURI(uri) {
        preferredVoiceURI = uri || "";
    }

    function getSettings() {
        const selected = selectJarvisVoice();
        return {
            rate: voiceRate,
            pitch: voicePitch,
            selectedVoice: selected?.name || "System Default",
            selectedVoiceURI: selected?.voiceURI || "",
            isMale: selected ? isMaleVoice(selected) : false,
            availableVoices: voices
        };
    }

    return {
        speak: speak,
        cancel: cancel,
        setRate: setRate,
        setPitch: setPitch,
        setVoiceURI: setVoiceURI,
        getSettings: getSettings,
        getVoices: () => voices,
        populateVoices: populateVoices,
        getSelectedVoice: selectJarvisVoice,
        isMaleVoice: isMaleVoice,
        isFemaleVoice: isFemaleVoice,
        isSpeaking: () => isSpeaking
    };
})();

// Provide both JarvisVoice and backward-compatible DoodleVoice
const DoodleVoice = JarvisVoice;
if (typeof window !== "undefined") {
    window.JarvisVoice = JarvisVoice;
    window.DoodleVoice = JarvisVoice;
}

