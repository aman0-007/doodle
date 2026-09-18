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
    try {
        preferredVoiceURI = localStorage.getItem("jarvis_voice_uri") || "";
        // Purge old cached robotic voice URIs (e.g. SAPI5 David Desktop or espeak)
        if (preferredVoiceURI && (/david/i.test(preferredVoiceURI) || /desktop/i.test(preferredVoiceURI) || /espeak/i.test(preferredVoiceURI))) {
            localStorage.removeItem("jarvis_voice_uri");
            preferredVoiceURI = "";
        }
    } catch (e) {}

    // Studio-clear natural human settings: strictly 1.0x native pitch to eliminate time-domain resampler distortion
    let voiceRate = 1.0;
    let voicePitch = 1.0;

    const VOICE_PRESETS = {
        clear_british: { key: "clear_british", label: "Jarvis Classic (Clear British)", rate: 1.0, pitch: 1.0 },
        natural_male: { key: "natural_male", label: "Natural Conversational (US Male)", rate: 1.0, pitch: 1.0 },
        articulate_pro: { key: "articulate_pro", label: "Clear Executive Male", rate: 1.04, pitch: 1.0 },
        warm_calm: { key: "warm_calm", label: "Warm & Crisp Male", rate: 0.96, pitch: 1.0 }
    };

    // Clean text before sending to speech synthesis to eliminate robotic reading of emojis, markdown, and symbols
    function cleanSpokenText(raw) {
        if (!raw) return "";
        let t = String(raw);
        // Remove markdown formatting like **bold**, *italic*, # headings, `code`, ~strike~
        t = t.replace(/[*_#`~>]/g, " ");
        // Remove emojis and non-standard unicode symbols which browsers read aloud as "grinning face"
        t = t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, " ");
        // Remove URLs
        t = t.replace(/https?:\/\/\S+/gi, "");
        // Remove system tags
        t = t.replace(/\[(?:mood|open|action|suggest):[^\]]+\]/gi, "");
        // Expand symbols to spoken words
        t = t.replace(/&/g, " and ")
             .replace(/%/g, " percent ")
             .replace(/=/g, " equals ")
             .replace(/\+/g, " plus ")
             .replace(/@/g, " at ");
        // Normalize whitespace and punctuation
        t = t.replace(/\s+/g, " ").trim();
        return t;
    }

    function populateVoices() {
        if (!synth) return;
        try {
            const list = synth.getVoices() || [];
            if (list.length) {
                voices = list;
            }
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
        // Polling retry ensures voices load in asynchronous Chromium / WebKit environments
        let pollCount = 0;
        const voicePollTimer = setInterval(() => {
            populateVoices();
            pollCount++;
            if (voices.length > 0 || pollCount > 30) {
                clearInterval(voicePollTimer);
            }
        }, 120);
    }

    // Exclude old novelty / robotic cyborg voices that sound metallic or distorted
    function isRoboticVoice(v) {
        if (!v) return false;
        const combined = `${v.name || ""} ${v.voiceURI || ""}`.toLowerCase();
        const roboticKeywords = [
            "david desktop", "desktop", "sapi", "espeak", "mbrola", "klatt",
            "fred", "whisper", "zarvox", "trinoids", "cellos", "bad news",
            "bells", "boing", "bubbles", "deranged", "hysterical", "pipe organ",
            "albert", "junior", "ralph", "sin-ji", "fester", "wobble", "robot",
            "sam", "croak", "eddie"
        ];
        return roboticKeywords.some(rk => combined.includes(rk));
    }

    // Comprehensive rejection filter for all female voices and aliases
    function isFemaleVoice(v) {
        if (!v) return false;
        const name = (v.name || "").toLowerCase();
        const uri = (v.voiceURI || "").toLowerCase();
        const combined = `${name} ${uri}`.toLowerCase();

        // If explicitly tagged male, it is NOT female
        if (/\b(male|guy|man|boy)\b/i.test(name) || uri.includes("#male")) return false;

        // Explicit female tags in name or URI
        if (/\b(female|woman|girl|lady)\b/i.test(combined) || uri.includes("#female")) return true;

        // "Google US English" is female in Chrome!
        if (name === "google us english" || uri.includes("google us english") || name.startsWith("google us english")) {
            return true;
        }
        if (name.includes("uk english female") || name.includes("us english female") || name.includes("australian english female")) {
            return true;
        }

        const femaleKeywords = [
            "samantha", "victoria", "karen", "zira", "moira", "tessa", "fiona", "susan",
            "kathy", "linda", "heather", "alice", "ava", "serena", "yuri", "helena", "zuzana",
            "anna", "elena", "stephanie", "sarah", "julie", "jenny", "aria", "ana", "hazel",
            "catherine", "veena", "neerja", "swara", "ioana", "amelie", "marlene", "vicki",
            "kyoko", "sin-ji", "ting-ting", "yuna", "paulina", "monica", "luciana", "agnes",
            "melina", "cortana", "siri", "nora", "heera", "sangeeta", "ayumi", "haruka", "hina",
            "xiaoxiao", "yaoyao", "en-us-x-sfg#female", "en-us-x-tpf"
        ];
        return femaleKeywords.some(fn => combined.includes(fn));
    }

    // Comprehensive identification for clear male voices
    function isMaleVoice(v) {
        if (!v) return false;
        if (isRoboticVoice(v)) return false;
        if (isFemaleVoice(v)) return false;
        const name = (v.name || "").toLowerCase();
        const uri = (v.voiceURI || "").toLowerCase();
        const combined = `${name} ${uri}`;

        if (/\b(male|guy|man|boy)\b/i.test(combined) || uri.includes("#male")) return true;

        const maleKeywords = [
            "daniel", "guy", "ryan", "george", "alex", "oliver",
            "arthur", "thomas", "christopher", "eric", "ravi", "james", "richard",
            "mark", "rishi", "prabhat", "lee", "nathan", "aaron", "gordon", "sean", "liam",
            "brian", "michael", "john", "paul", "steven", "charles", "robert", "edward",
            "william", "matthew", "anthony", "joshua", "andrew", "kevin", "jason", "jeff",
            "justin", "tim", "steve", "frank"
        ];
        return maleKeywords.some(mn => combined.includes(mn));
    }

    function selectJarvisVoice() {
        if (!voices.length && synth) {
            populateVoices();
        }
        if (!voices.length) return null;

        // User explicit choice from UI (ensure it's not a robotic voice)
        if (preferredVoiceURI) {
            const manual = voices.find(v => (v.voiceURI === preferredVoiceURI || v.name === preferredVoiceURI) && !isRoboticVoice(v));
            if (manual) return manual;
        }

        // 1. Highest tier: Modern High-Definition Natural Neural Male voices
        const naturalStudioMalePatterns = [
            /Microsoft.*Guy.*Online.*Natural/i,
            /Microsoft.*Ryan.*Online.*Natural/i,
            /Microsoft.*Christopher.*Online.*Natural/i,
            /Microsoft.*Eric.*Online.*Natural/i,
            /Microsoft.*Brian.*Online.*Natural/i,
            /Microsoft.*George.*Online.*Natural/i,
            /Google.*UK.*English.*Male/i,
            /Daniel.*Enhanced/i,
            /Daniel/i,             // British classic Jarvis voice
            /Oliver.*Enhanced/i,
            /Oliver/i,
            /Evan.*Enhanced/i,
            /Nathan.*Enhanced/i,
            /Alex/i,               // Crystal-clear standard Apple voice
            /Arthur/i,
            /Thomas/i,
            /\bNatural.*Male\b/i,
            /\bOnline.*Natural\b/i
        ];

        for (const pattern of naturalStudioMalePatterns) {
            const match = voices.find(v => (pattern.test(v.name) || pattern.test(v.voiceURI)) && !isFemaleVoice(v) && !isRoboticVoice(v));
            if (match) return match;
        }

        // 2. Any English voice identified as clear male
        const anyMaleEnglish = voices.find(v => isMaleVoice(v) && /^en/i.test(v.lang) && !isRoboticVoice(v));
        if (anyMaleEnglish) return anyMaleEnglish;

        // 3. Any voice identified as male
        const anyMale = voices.find(v => isMaleVoice(v) && !isRoboticVoice(v));
        if (anyMale) return anyMale;

        // 4. Any English voice that is NOT female and NOT robotic
        const nonFemaleEnglish = voices.find(v => /^en/i.test(v.lang) && !isFemaleVoice(v) && !isRoboticVoice(v));
        if (nonFemaleEnglish) return nonFemaleEnglish;

        return voices.find(v => !isRoboticVoice(v)) || voices[0] || null;
    }

    // Studio Neural Audio playback engine (Web Audio API 24kHz PCM linear decoding)
    let studioAudioCtx = null;
    let currentAudioSource = null;

    function stopCurrentAudio() {
        if (currentAudioSource) {
            try { currentAudioSource.stop(); } catch (e) {}
            currentAudioSource = null;
        }
        if (synth) {
            try { synth.cancel(); } catch (e) {}
        }
        isSpeaking = false;
    }

    function playPCM24k(base64Data, onStart, onEnd) {
        try {
            stopCurrentAudio();
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtxClass) return false;

            if (!studioAudioCtx || studioAudioCtx.state === "closed") {
                studioAudioCtx = new AudioCtxClass({ sampleRate: 24000 });
            }
            if (studioAudioCtx.state === "suspended") {
                studioAudioCtx.resume();
            }

            const binary = atob(base64Data);
            const len = binary.length;
            const numSamples = Math.floor(len / 2);
            const buffer = studioAudioCtx.createBuffer(1, numSamples, 24000);
            const channelData = buffer.getChannelData(0);

            const view = new DataView(new ArrayBuffer(len));
            for (let i = 0; i < len; i++) {
                view.setUint8(i, binary.charCodeAt(i));
            }
            for (let i = 0; i < numSamples; i++) {
                channelData[i] = view.getInt16(i * 2, true) / 32768.0;
            }

            const source = studioAudioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(studioAudioCtx.destination);
            currentAudioSource = source;
            isSpeaking = true;

            source.onended = () => {
                if (currentAudioSource === source) {
                    currentAudioSource = null;
                    isSpeaking = false;
                }
                if (onEnd) onEnd();
            };

            if (onStart) onStart();
            source.start(0);
            return true;
        } catch (err) {
            console.warn("PCM audio playback fallback notice:", err);
            return false;
        }
    }

    // High-clarity Web Speech synthesis
    function speakWebSpeech(cleanedText, onStart, onEnd) {
        if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
            if (onStart) onStart();
            setTimeout(() => { if (onEnd) onEnd(); }, 1000);
            return;
        }

        try {
            if (synth.paused) synth.resume();
            synth.cancel();

            setTimeout(() => {
                try {
                    const utterance = new SpeechSynthesisUtterance(cleanedText);
                    const voice = selectJarvisVoice();

                    if (voice) {
                        utterance.voice = voice;
                        utterance.lang = voice.lang || "en-US";
                    } else {
                        utterance.lang = "en-US";
                    }

                    // Strict 1.00 pitch to avoid any pitch-shift resampler artifact
                    utterance.pitch = 1.0;
                    // Natural unhurried conversational cadence
                    utterance.rate = Math.min(Math.max(voiceRate, 0.90), 1.15);
                    utterance.volume = SoundFX.isMuted() ? 0 : 1.0;

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

    function speak(text, onStart, onEnd, audioBase64 = null) {
        if (!text && !audioBase64) return;

        // Play subtle perk chirp before talking
        SoundFX.play("cute_chirp");

        // 1. If Studio HD audio is supplied, play the crystal-clear 24kHz neural stream
        if (audioBase64) {
            const played = playPCM24k(audioBase64, onStart, onEnd);
            if (played) return;
        }

        // 2. High-clarity sanitized Web Speech
        const cleaned = cleanSpokenText(text);
        if (!cleaned) {
            if (onEnd) onEnd();
            return;
        }

        speakWebSpeech(cleaned, onStart, onEnd);
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
        if (!isNaN(val) && val >= 0.5 && val <= 1.9) {
            voiceRate = val;
        }
    }

    function setPitch(newPitch) {
        const val = parseFloat(newPitch);
        if (!isNaN(val) && val >= 0.5 && val <= 1.3) {
            voicePitch = val;
        }
    }

    function setVoiceURI(uri) {
        preferredVoiceURI = uri || "";
        try {
            if (uri) {
                localStorage.setItem("jarvis_voice_uri", uri);
            } else {
                localStorage.removeItem("jarvis_voice_uri");
            }
        } catch (e) {}
    }

    function applyPreset(presetKey) {
        const p = VOICE_PRESETS[presetKey];
        if (p) {
            setRate(p.rate);
            setPitch(p.pitch);
            return p;
        }
        return null;
    }

    function getSettings() {
        const selected = selectJarvisVoice();
        return {
            rate: voiceRate,
            pitch: voicePitch,
            selectedVoice: selected?.name || "System Default",
            selectedVoiceURI: selected?.voiceURI || "",
            isMale: selected ? isMaleVoice(selected) : false,
            availableVoices: voices,
            presets: VOICE_PRESETS
        };
    }

    return {
        speak: speak,
        cancel: cancel,
        setRate: setRate,
        setPitch: setPitch,
        setVoiceURI: setVoiceURI,
        applyPreset: applyPreset,
        getPresets: () => VOICE_PRESETS,
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

