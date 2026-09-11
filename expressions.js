/* =========================================================
   PIXEL DOODLE V2.5 - EXPRESSION DATABASE
   Comprehensive, bug-free, animated geometry & mood palette
   ========================================================= */

const EXPRESSIONS = {
    // Normal / resting eyes
    idle: {
        width: 34,
        height: 42,
        radius: "9px",
        leftTransform: "none",
        rightTransform: "none",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#19eaff",
        sound: null
    },

    // Rapid blink slit
    blink: {
        width: 34,
        height: 4,
        radius: "2px",
        leftTransform: "translateY(16px)",
        rightTransform: "translateY(16px)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#19eaff",
        sound: "blink"
    },

    // Cheerful upturned curved crescents
    happy: {
        width: 36,
        height: 20,
        radius: "18px 18px 5px 5px",
        leftTransform: "translateY(8px)",
        rightTransform: "translateY(8px)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#19eaff",
        sound: "happy"
    },

    // Tall energized wide pupils
    excited: {
        width: 38,
        height: 46,
        radius: "12px",
        leftTransform: "translateY(-4px) scale(1.04)",
        rightTransform: "translateY(-4px) scale(1.04)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#26ffdf",
        sound: "excited"
    },

    // Wide dilated circular pupils
    surprised: {
        width: 44,
        height: 44,
        radius: "50%",
        leftTransform: "scale(1.05)",
        rightTransform: "scale(1.05)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#00f0ff",
        sound: "surprised"
    },

    // One eye raised inquisitive, one eye narrowed
    curious: {
        left: {
            width: 40,
            height: 44,
            radius: "12px",
            transform: "translateY(-5px) rotate(-4deg)",
            opacity: 1
        },
        right: {
            width: 30,
            height: 36,
            radius: "9px",
            transform: "translateY(3px) rotate(4deg)",
            opacity: 1
        },
        glow: "#38bdf8",
        sound: "curious"
    },

    // Asymmetric tilted cocked eyes
    confused: {
        left: {
            width: 35,
            height: 38,
            radius: "10px",
            transform: "rotate(-12deg) translateY(-2px)",
            opacity: 1
        },
        right: {
            width: 33,
            height: 30,
            radius: "8px",
            transform: "rotate(12deg) translateY(4px)",
            opacity: 1
        },
        glow: "#ffd219",
        sound: "confused"
    },

    // Sharp downward angled slashes with menacing red glow
    angry: {
        left: {
            width: 36,
            height: 18,
            radius: "4px 10px 4px 10px",
            transform: "rotate(16deg) translateY(6px)",
            opacity: 1
        },
        right: {
            width: 36,
            height: 18,
            radius: "10px 4px 10px 4px",
            transform: "rotate(-16deg) translateY(6px)",
            opacity: 1
        },
        glow: "#ff3344",
        sound: "angry"
    },

    // Downturned droopy tearful eyes with soft sorrowful blue
    sad: {
        left: {
            width: 34,
            height: 22,
            radius: "5px 5px 16px 16px",
            transform: "translateY(8px) rotate(-6deg)",
            opacity: 0.95
        },
        right: {
            width: 34,
            height: 22,
            radius: "5px 5px 16px 16px",
            transform: "translateY(8px) rotate(6deg)",
            opacity: 0.95
        },
        glow: "#3b82f6",
        sound: "sad"
    },

    // Peaceful sleeping horizontal bars
    sleep: {
        width: 34,
        height: 5,
        radius: "3px",
        leftTransform: "translateY(12px)",
        rightTransform: "translateY(12px)",
        leftOpacity: 0.65,
        rightOpacity: 0.65,
        glow: "#6ee7b7",
        sound: "sleep"
    },

    // Half-closed drooping eyelids for tired / low battery
    sleepy: {
        left: {
            width: 34,
            height: 20,
            radius: "4px 4px 12px 12px",
            transform: "translateY(10px)",
            opacity: 0.6
        },
        right: {
            width: 34,
            height: 20,
            radius: "4px 4px 12px 12px",
            transform: "translateY(10px)",
            opacity: 0.6
        },
        glow: "#fbbf24",
        sound: "sleepy"
    },

    // Eyes looking up into the corner thoughtfully
    thinking: {
        left: {
            width: 32,
            height: 32,
            radius: "9px",
            transform: "translate(-3px, -10px) rotate(-5deg)",
            opacity: 1
        },
        right: {
            width: 32,
            height: 32,
            radius: "9px",
            transform: "translate(3px, -10px) rotate(5deg)",
            opacity: 1
        },
        glow: "#c084fc",
        sound: "thinking"
    },

    // Squeezed laughing curved slits
    laughing: {
        width: 36,
        height: 14,
        radius: "16px 16px 3px 3px",
        leftTransform: "translateY(8px) rotate(4deg)",
        rightTransform: "translateY(8px) rotate(-4deg)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#facc15",
        sound: "laughing"
    },

    // Focused attentive wide pupils
    listening: {
        width: 36,
        height: 44,
        radius: "12px",
        leftTransform: "scale(1.02)",
        rightTransform: "scale(1.02)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#38bdf8",
        sound: "listening"
    },

    // Animated talking speech shape
    speaking: {
        width: 34,
        height: 38,
        radius: "10px",
        leftTransform: "none",
        rightTransform: "none",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#a78bfa",
        sound: "speaking"
    },

    // Alert perked-up tall pupils
    attention: {
        width: 38,
        height: 46,
        radius: "12px",
        leftTransform: "translateY(-3px)",
        rightTransform: "translateY(-3px)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#f43f5e",
        sound: "attention"
    },

    // Warm glowing pink love eyes (clean doodle aesthetic)
    love: {
        width: 38,
        height: 42,
        radius: "12px",
        leftTransform: "rotate(-3deg) translateY(-2px)",
        rightTransform: "rotate(3deg) translateY(-2px)",
        leftOpacity: 1,
        rightOpacity: 1,
        background: "#ff4d8d",
        border: "none",
        boxShadow: "0 0 16px #ff4d8d, 0 0 32px #ff4d8d",
        glow: "#ff4d8d",
        sound: "love"
    },

    // High-tech space specs spectacles (Zero emoji, default eye size)
    specs: {
        width: 38,
        height: 44,
        radius: "12px",
        leftTransform: "none",
        rightTransform: "none",
        leftOpacity: 1,
        rightOpacity: 1,
        background: "#19eaff",
        border: "none",
        boxShadow: "0 0 10px #19eaff, 0 0 24px #19eaff",
        glow: "#19eaff",
        sound: "specs"
    },

    // 8-Bit Retro Boombox Groove
    boombox: {
        width: 38,
        height: 22,
        radius: "18px 18px 4px 4px",
        leftTransform: "translateY(5px)",
        rightTransform: "translateY(5px)",
        leftOpacity: 1,
        rightOpacity: 1,
        background: "#f43f5e",
        border: "none",
        boxShadow: "0 0 10px #f43f5e, 0 0 24px #f43f5e",
        glow: "#f43f5e",
        sound: "boombox"
    },

    // Playful wink: left eye cheerful slit, right eye wide
    wink: {
        left: {
            width: 36,
            height: 16,
            radius: "14px 14px 4px 4px",
            transform: "translateY(8px)",
            opacity: 1
        },
        right: {
            width: 38,
            height: 44,
            radius: "11px",
            transform: "translateY(-2px)",
            opacity: 1
        },
        glow: "#06b6d4",
        sound: "wink"
    },

    // Cool pixel shades
    cool: {
        width: 38,
        height: 24,
        radius: "3px 3px 12px 12px",
        leftTransform: "translateY(4px)",
        rightTransform: "translateY(4px)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#06b6d4",
        sound: "cool"
    },

    // Shocked trembling wide circles
    shocked: {
        width: 46,
        height: 46,
        radius: "50%",
        leftTransform: "scale(1.12)",
        rightTransform: "scale(1.12)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#fbbf24",
        sound: "shocked"
    },

    // Scared tiny pinpoint pupils huddled together
    scared: {
        left: {
            width: 20,
            height: 20,
            radius: "50%",
            transform: "translateX(8px) translateY(2px)",
            opacity: 0.9
        },
        right: {
            width: 20,
            height: 20,
            radius: "50%",
            transform: "translateX(-8px) translateY(2px)",
            opacity: 0.9
        },
        glow: "#a855f7",
        sound: "scared"
    },

    // Golden star sparkle proud eyes
    proud: {
        width: 36,
        height: 40,
        radius: "14px 4px 14px 4px",
        leftTransform: "rotate(10deg) translateY(-2px)",
        rightTransform: "rotate(-10deg) translateY(-2px)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#f59e0b",
        sound: "proud"
    },

    // Cyberpunk green matrix digital slits
    matrix: {
        width: 34,
        height: 38,
        radius: "2px",
        leftTransform: "scaleY(0.95)",
        rightTransform: "scaleY(0.95)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#22c55e",
        sound: "matrix"
    },

    // Scanning loading bar
    loading: {
        width: 36,
        height: 10,
        radius: "5px",
        leftTransform: "scaleX(0.85)",
        rightTransform: "scaleX(0.85)",
        leftOpacity: 1,
        rightOpacity: 1,
        glow: "#2dd4bf",
        sound: "loading"
    }
};

/* =========================================================
   FRAME-BASED ANIMATED SEQUENCES
   ========================================================= */

const EXPRESSION_FRAMES = {
    happy: [
        { name: "idle", ms: 0 },
        { name: "happy", ms: 60 },
        { name: "happy", ms: 1400 },
        { name: "idle", ms: 1650 }
    ],

    excited: [
        { name: "idle", ms: 0 },
        { name: "excited", ms: 60 },
        { name: "surprised", ms: 450 },
        { name: "excited", ms: 700 },
        { name: "excited", ms: 1300 },
        { name: "idle", ms: 1550 }
    ],

    surprised: [
        { name: "idle", ms: 0 },
        { name: "surprised", ms: 50 },
        { name: "surprised", ms: 1100 },
        { name: "idle", ms: 1350 }
    ],

    curious: [
        { name: "idle", ms: 0 },
        { name: "curious", ms: 60 },
        { name: "curious", ms: 1400 },
        { name: "idle", ms: 1650 }
    ],

    confused: [
        { name: "idle", ms: 0 },
        { name: "confused", ms: 60 },
        { name: "confused", ms: 1400 },
        { name: "idle", ms: 1650 }
    ],

    angry: [
        { name: "idle", ms: 0 },
        { name: "angry", ms: 60 },
        { name: "angry", ms: 1600 },
        { name: "idle", ms: 1850 }
    ],

    sad: [
        { name: "idle", ms: 0 },
        { name: "sad", ms: 60 },
        { name: "sad", ms: 1600 },
        { name: "idle", ms: 1850 }
    ],

    thinking: [
        { name: "idle", ms: 0 },
        { name: "thinking", ms: 60 },
        { name: "thinking", ms: 1700 },
        { name: "curious", ms: 1900 },
        { name: "idle", ms: 2150 }
    ],

    laughing: [
        { name: "happy", ms: 0 },
        { name: "laughing", ms: 80 },
        { name: "happy", ms: 300 },
        { name: "laughing", ms: 500 },
        { name: "happy", ms: 750 },
        { name: "idle", ms: 1100 }
    ],

    listening: [
        { name: "idle", ms: 0 },
        { name: "listening", ms: 60 },
        { name: "listening", ms: 1600 },
        { name: "idle", ms: 1850 }
    ],

    speaking: [
        { name: "speaking", ms: 0 },
        { name: "excited", ms: 250 },
        { name: "speaking", ms: 500 },
        { name: "excited", ms: 750 },
        { name: "speaking", ms: 1000 },
        { name: "idle", ms: 1300 }
    ],

    attention: [
        { name: "idle", ms: 0 },
        { name: "attention", ms: 60 },
        { name: "attention", ms: 1300 },
        { name: "idle", ms: 1550 }
    ],

    love: [
        { name: "idle", ms: 0 },
        { name: "love", ms: 60 },
        { name: "love", ms: 3800 },
        { name: "happy", ms: 4100 },
        { name: "idle", ms: 4400 }
    ],

    specs: [
        { name: "idle", ms: 0 },
        { name: "specs", ms: 60 },
        { name: "specs", ms: 4200 },
        { name: "happy", ms: 4500 },
        { name: "idle", ms: 4800 }
    ],

    boombox: [
        { name: "idle", ms: 0 },
        { name: "boombox", ms: 60 }
    ],

    wink: [
        { name: "idle", ms: 0 },
        { name: "wink", ms: 60 },
        { name: "wink", ms: 1200 },
        { name: "idle", ms: 1450 }
    ],

    cool: [
        { name: "idle", ms: 0 },
        { name: "cool", ms: 60 },
        { name: "cool", ms: 1500 },
        { name: "idle", ms: 1750 }
    ],

    shocked: [
        { name: "idle", ms: 0 },
        { name: "shocked", ms: 50 },
        { name: "shocked", ms: 1300 },
        { name: "idle", ms: 1550 }
    ],

    scared: [
        { name: "idle", ms: 0 },
        { name: "scared", ms: 50 },
        { name: "scared", ms: 1400 },
        { name: "idle", ms: 1650 }
    ],

    proud: [
        { name: "idle", ms: 0 },
        { name: "proud", ms: 60 },
        { name: "proud", ms: 1400 },
        { name: "idle", ms: 1650 }
    ],

    matrix: [
        { name: "idle", ms: 0 },
        { name: "matrix", ms: 60 },
        { name: "matrix", ms: 1500 },
        { name: "idle", ms: 1750 }
    ],

    wake: [
        { name: "sleep", ms: 0 },
        { name: "blink", ms: 120 },
        { name: "surprised", ms: 250 },
        { name: "idle", ms: 500 }
    ]
};

// UI metadata for mood selectors
const MOOD_LIST = [
    { id: "happy", label: "Happy", icon: "😊", color: "#19eaff" },
    { id: "excited", label: "Excited", icon: "🤩", color: "#26ffdf" },
    { id: "love", label: "Love", icon: "💖", color: "#ff4d8d" },
    {
        id: "specs",
        label: "Specs",
        iconSvg: '<svg viewBox="0 0 24 16" width="22" height="14" fill="none" stroke="#19eaff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="8" height="9" rx="2.5"/><rect x="14" y="3" width="8" height="9" rx="2.5"/><line x1="10" y1="7.5" x2="14" y2="7.5"/><line x1="2" y1="6" x2="0" y2="6"/><line x1="22" y1="6" x2="24" y2="6"/></svg>',
        color: "#19eaff"
    },
    {
        id: "boombox",
        label: "Boombox",
        iconSvg: '<svg viewBox="0 0 24 18" width="22" height="16" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="12" rx="2.5"/><circle cx="7" cy="11" r="2.5"/><circle cx="17" cy="11" r="2.5"/><line x1="10" y1="11" x2="14" y2="11"/><path d="M8 5V2.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V5"/></svg>',
        icon: "📻",
        color: "#f43f5e"
    },
    { id: "wink", label: "Wink", icon: "😉", color: "#06b6d4" },
    { id: "cool", label: "Cool", icon: "😎", color: "#06b6d4" },
    { id: "curious", label: "Curious", icon: "🧐", color: "#38bdf8" },
    { id: "confused", label: "Confused", icon: "🤨", color: "#ffd219" },
    { id: "thinking", label: "Thinking", icon: "🤔", color: "#c084fc" },
    { id: "surprised", label: "Surprised", icon: "😮", color: "#00f0ff" },
    { id: "laughing", label: "Laughing", icon: "😆", color: "#facc15" },
    { id: "angry", label: "Angry", icon: "😠", color: "#ff3344" },
    { id: "sad", label: "Sad", icon: "🥺", color: "#3b82f6" },
    {
        id: "sleep",
        label: "Sleep",
        iconSvg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#6ee7b7" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h8L4 16h8"/><path d="M15 11h6l-6 7h6"/></svg>',
        color: "#6ee7b7"
    },
    { id: "shocked", label: "Shocked", icon: "⚡", color: "#fbbf24" },
    { id: "scared", label: "Scared", icon: "😨", color: "#a855f7" },
    { id: "proud", label: "Proud", icon: "✨", color: "#f59e0b" },
    { id: "matrix", label: "Matrix", icon: "👾", color: "#22c55e" }
];
