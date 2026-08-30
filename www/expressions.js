/* =========================================================
   PIXEL DOODLE V2.1
   EXPRESSION DATABASE
   ========================================================= */


/* =========================================================
   BASIC EXPRESSIONS
   ========================================================= */

const EXPRESSIONS = {

    idle: {
        width: 34,
        height: 42,
        radius: 9,
        leftTransform: "",
        rightTransform: "",
        leftOpacity: 1,
        rightOpacity: 1
    },


    blink: {
        width: 34,
        height: 5,
        radius: 4,
        leftTransform: "",
        rightTransform: "",
        leftOpacity: 1,
        rightOpacity: 1
    },


    happy: {
        width: 34,
        height: 17,
        radius: "12px 12px 5px 5px",

        leftTransform:
            "translateY(7px)",

        rightTransform:
            "translateY(7px)",

        leftOpacity: 1,
        rightOpacity: 1
    },


    excited: {
        width: 37,
        height: 46,
        radius: 11,

        leftTransform:
            "translateY(-2px)",

        rightTransform:
            "translateY(-2px)",

        leftOpacity: 1,
        rightOpacity: 1
    },


    surprised: {
        width: 39,
        height: 48,
        radius: 13,

        leftTransform: "",
        rightTransform: "",

        leftOpacity: 1,
        rightOpacity: 1
    },


    curious: {

        left: {
            width: 39,
            height: 43,
            radius: 12,

            transform:
                "translateY(-2px)"
        },

        right: {
            width: 29,
            height: 38,
            radius: 10,

            transform:
                "translateY(3px)"
        }
    },


    confused: {

        left: {
            width: 34,
            height: 38,
            radius: 9,

            transform:
                "rotate(-8deg)"
        },

        right: {
            width: 34,
            height: 31,
            radius: 9,

            transform:
                "rotate(8deg)"
        }
    },


    angry: {
        width: 34,
        height: 17,
        radius: 4,

        leftTransform:
            "rotate(12deg)",

        rightTransform:
            "rotate(-12deg)",

        leftOpacity: 1,
        rightOpacity: 1
    },


    sad: {

        left: {
            width: 34,
            height: 20,

            radius:
                "5px 5px 14px 14px",

            transform:
                "translateY(4px)"
        },

        right: {
            width: 34,
            height: 20,

            radius:
                "5px 5px 14px 14px",

            transform:
                "translateY(4px)"
        }
    },


    sleep: {
        width: 34,
        height: 4,
        radius: 2,

        leftTransform: "",
        rightTransform: "",

        leftOpacity: 0.8,
        rightOpacity: 0.8
    },


    thinking: {

        left: {
            width: 34,
            height: 30,
            radius: 9,

            transform:
                "translateY(2px)"
        },

        right: {
            width: 29,
            height: 42,
            radius: 9,

            transform:
                "translateY(-2px)"
        }
    },


    laughing: {
        width: 34,
        height: 13,

        radius:
            "15px 15px 4px 4px",

        leftTransform:
            "translateY(8px)",

        rightTransform:
            "translateY(8px)",

        leftOpacity: 1,
        rightOpacity: 1
    },


    listening: {
        width: 35,
        height: 44,
        radius: 10,

        leftTransform:
            "translateY(-1px)",

        rightTransform:
            "translateY(-1px)",

        leftOpacity: 1,
        rightOpacity: 1
    },


    speaking: {
        width: 34,
        height: 40,
        radius: 9,

        leftTransform: "",
        rightTransform: "",

        leftOpacity: 1,
        rightOpacity: 1
    },


    attention: {
        width: 36,
        height: 44,
        radius: 10,

        leftTransform: "",
        rightTransform: "",

        leftOpacity: 1,
        rightOpacity: 1
    },


    loading: {
        width: 34,
        height: 42,
        radius: 9,

        leftTransform:
            "scaleY(0.8)",

        rightTransform:
            "scaleY(0.8)",

        leftOpacity: 1,
        rightOpacity: 1
    }
};


/* =========================================================
   FRAME-BASED EXPRESSIONS
   ========================================================= */

const EXPRESSION_FRAMES = {


    /* -----------------------------------------------------
       WAKE
       ----------------------------------------------------- */

    wake: [

        {
            name: "sleep",
            ms: 0
        },

        {
            name: "blink",
            ms: 90
        },

        {
            name: "surprised",
            ms: 180
        },

        {
            name: "idle",
            ms: 330
        }
    ],


    /* -----------------------------------------------------
       HAPPY
       ----------------------------------------------------- */

    happy: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "happy",
            ms: 80
        },

        {
            name: "happy",
            ms: 1150
        },

        {
            name: "idle",
            ms: 1350
        }
    ],


    /* -----------------------------------------------------
       EXCITED
       ----------------------------------------------------- */

    excited: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "excited",
            ms: 90
        },

        {
            name: "surprised",
            ms: 500
        },

        {
            name: "excited",
            ms: 650
        },

        {
            name: "excited",
            ms: 950
        },

        {
            name: "idle",
            ms: 1150
        }
    ],


    /* -----------------------------------------------------
       SURPRISED
       ----------------------------------------------------- */

    surprised: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "surprised",
            ms: 100
        },

        {
            name: "surprised",
            ms: 850
        },

        {
            name: "idle",
            ms: 1050
        }
    ],


    /* -----------------------------------------------------
       CURIOUS
       ----------------------------------------------------- */

    curious: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "curious",
            ms: 120
        },

        {
            name: "curious",
            ms: 1300
        },

        {
            name: "idle",
            ms: 1500
        }
    ],


    /* -----------------------------------------------------
       CONFUSED
       ----------------------------------------------------- */

    confused: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "confused",
            ms: 100
        },

        {
            name: "confused",
            ms: 1200
        },

        {
            name: "idle",
            ms: 1400
        }
    ],


    /* -----------------------------------------------------
       ANGRY
       ----------------------------------------------------- */

    angry: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "angry",
            ms: 80
        },

        {
            name: "angry",
            ms: 1500
        },

        {
            name: "idle",
            ms: 1750
        }
    ],


    /* -----------------------------------------------------
       SAD
       ----------------------------------------------------- */

    sad: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "sad",
            ms: 120
        },

        {
            name: "sad",
            ms: 1500
        },

        {
            name: "idle",
            ms: 1750
        }
    ],


    /* -----------------------------------------------------
       THINKING
       ----------------------------------------------------- */

    thinking: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "thinking",
            ms: 120
        },

        {
            name: "thinking",
            ms: 1700
        },

        {
            name: "curious",
            ms: 1850
        },

        {
            name: "idle",
            ms: 2100
        }
    ],


    /* -----------------------------------------------------
       LAUGHING
       ----------------------------------------------------- */

    laughing: [

        {
            name: "happy",
            ms: 0
        },

        {
            name: "laughing",
            ms: 100
        },

        {
            name: "happy",
            ms: 280
        },

        {
            name: "laughing",
            ms: 450
        },

        {
            name: "happy",
            ms: 650
        },

        {
            name: "idle",
            ms: 900
        }
    ],


    /* -----------------------------------------------------
       LISTENING
       ----------------------------------------------------- */

    listening: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "listening",
            ms: 120
        },

        {
            name: "listening",
            ms: 1800
        },

        {
            name: "idle",
            ms: 2000
        }
    ],


    /* -----------------------------------------------------
       ATTENTION
       ----------------------------------------------------- */

    attention: [

        {
            name: "idle",
            ms: 0
        },

        {
            name: "attention",
            ms: 100
        },

        {
            name: "attention",
            ms: 1200
        },

        {
            name: "idle",
            ms: 1400
        }
    ]
};
