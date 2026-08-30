/* =========================================================
   PIXEL DOODLE V2.1
   BEHAVIOR ENGINE
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const doodle =
    document.getElementById("doodle");

const leftEye =
    document.getElementById("eyeLeft");

const rightEye =
    document.getElementById("eyeRight");


/* =========================================================
   STATE
   ========================================================= */

let state = "idle";

let idleTimer = null;

let blinkTimer = null;

let tapTimer = null;

let longPressTimer = null;

let animationTimers = [];


/* =========================================================
   GESTURE STATE
   ========================================================= */

let taps = 0;

let pointerDown = false;

let pointerStartX = 0;

let pointerStartY = 0;

let pointerStartTime = 0;


/* =========================================================
   SHAKE
   ========================================================= */

let lastAccX;

let lastAccY;

let lastAccZ;

let shakeCount = 0;

let shakeTimer = null;


/* =========================================================
   CLEAR ANIMATION TIMERS
   ========================================================= */

function clearExpressionTimers() {

    animationTimers.forEach(
        timer => clearTimeout(timer)
    );

    animationTimers = [];
}


/* =========================================================
   APPLY EXPRESSION
   ========================================================= */

function applyExpression(name) {

    const expression =
        EXPRESSIONS[name];

    if (!expression) {

        console.warn(
            "Unknown expression:",
            name
        );

        return;
    }


    /*
       Remove temporary expression
       animation classes.
    */

    doodle.classList.remove(

        "blink",
        "happy",
        "excited",
        "surprised",
        "curious",
        "confused",
        "angry",
        "sad",
        "sleep",
        "thinking",
        "laughing",
        "listening",
        "speaking",
        "attention",
        "loading"

    );


    /*
       Special CSS animations.
    */

    if (name !== "idle") {

        doodle.classList.add(name);
    }


    /*
       Shared or individual eye geometry.
    */

    const left =
        expression.left ||
        expression;

    const right =
        expression.right ||
        expression;


    applyEyeGeometry(
        leftEye,
        left,
        true
    );

    applyEyeGeometry(
        rightEye,
        right,
        false
    );
}


/* =========================================================
   APPLY EYE GEOMETRY
   ========================================================= */

function applyEyeGeometry(
    eye,
    config,
    isLeft
) {

    if (config.width !== undefined) {

        eye.style.width =
            config.width + "px";
    }


    if (config.height !== undefined) {

        eye.style.height =
            config.height + "px";
    }


    if (config.radius !== undefined) {

        eye.style.borderRadius =

            typeof config.radius === "number"

                ? config.radius + "px"

                : config.radius;
    }


    if (config.transform !== undefined) {

        eye.style.transform =
            config.transform;
    }


    /*
       Individual opacity.
    */

    if (
        config.opacity !== undefined
    ) {

        eye.style.opacity =
            config.opacity;

        return;
    }


    /*
       Shared expression opacity.
    */

    if (isLeft) {

        if (
            config.leftOpacity !== undefined
        ) {

            eye.style.opacity =
                config.leftOpacity;
        }

    } else {

        if (
            config.rightOpacity !== undefined
        ) {

            eye.style.opacity =
                config.rightOpacity;
        }
    }
}


/* =========================================================
   SET STATE
   ========================================================= */

function setState(newState) {

    clearExpressionTimers();

    state =
        newState;

    applyExpression(
        newState
    );


    if (

        newState !== "sleep" &&

        newState !== "dizzy"

    ) {

        resetIdle();
    }
}


/* =========================================================
   PLAY FRAME SEQUENCE
   ========================================================= */

function playFrames(
    frames,
    finalState = "idle"
) {

    if (
        !frames ||
        !frames.length
    ) {

        return;
    }


    clearExpressionTimers();


    frames.forEach(
        frame => {

            const timer =
                setTimeout(() => {

                    applyExpression(
                        frame.name
                    );

                }, frame.ms);


            animationTimers.push(
                timer
            );
        }
    );


    const lastFrame =
        frames[
            frames.length - 1
        ];


    const finalTimer =
        setTimeout(() => {

            state =
                finalState;

            applyExpression(
                finalState
            );


            if (
                finalState !== "sleep"
            ) {

                resetIdle();
            }

        }, lastFrame.ms + 30);


    animationTimers.push(
        finalTimer
    );
}


/* =========================================================
   PLAY EXPRESSION
   ========================================================= */

function playExpression(name) {

    const frames =
        EXPRESSION_FRAMES[name];


    if (frames) {

        playFrames(
            frames,
            "idle"
        );

        return;
    }


    if (
        EXPRESSIONS[name]
    ) {

        setState(name);
    }
}


/* =========================================================
   IDLE TIMER
   ========================================================= */

function resetIdle() {

    clearTimeout(
        idleTimer
    );


    if (

        state !== "sleep" &&

        state !== "dizzy"

    ) {

        idleTimer =
            setTimeout(() => {

                setState(
                    "sleep"
                );

            }, 10000);
    }
}


/* =========================================================
   BLINK
   ========================================================= */

function blink() {

    if (

        state === "sleep" ||

        state === "angry" ||

        state === "dizzy"

    ) {

        return;
    }


    applyExpression(
        "blink"
    );


    setTimeout(() => {

        if (
            state !== "dizzy"
        ) {

            applyExpression(
                state
            );
        }

    }, 130);
}


/* =========================================================
   RANDOM BLINK
   ========================================================= */

function scheduleBlink() {

    clearTimeout(
        blinkTimer
    );


    blinkTimer =
        setTimeout(() => {

            blink();

            scheduleBlink();

        }, 2500 + Math.random() * 3500);
}


/* =========================================================
   WAKE
   ========================================================= */

function wake() {

    if (
        state !== "sleep"
    ) {

        return;
    }


    clearExpressionTimers();


    state =
        "idle";


    playFrames(
        EXPRESSION_FRAMES.wake,
        "idle"
    );


    resetIdle();
}


/* =========================================================
   NORMAL TAP
   ========================================================= */

function normalTap() {

    doodle.classList.remove(
        "tap"
    );


    void doodle.offsetWidth;


    doodle.classList.add(
        "tap"
    );


    setTimeout(() => {

        doodle.classList.remove(
            "tap"
        );

    }, 180);
}


/* =========================================================
   POINTER DOWN
   ========================================================= */

doodle.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();


        pointerDown = true;

        pointerStartX =
            event.clientX;

        pointerStartY =
            event.clientY;

        pointerStartTime =
            Date.now();


        wake();


        /*
           Long press.
        */

        clearTimeout(
            longPressTimer
        );


        longPressTimer =
            setTimeout(() => {

                if (
                    pointerDown
                ) {

                    taps = 0;

                    playExpression(
                        "thinking"
                    );
                }

            }, 650);
    }
);


/* =========================================================
   POINTER UP
   ========================================================= */

doodle.addEventListener(
    "pointerup",
    event => {

        event.preventDefault();


        pointerDown = false;


        clearTimeout(
            longPressTimer
        );


        const dx =
            event.clientX -
            pointerStartX;


        const dy =
            event.clientY -
            pointerStartY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const duration =
            Date.now() -
            pointerStartTime;


        /*
           Swipe detection.

           Must move enough to be
           considered a swipe.
        */

        if (
            distance > 50 &&
            duration < 700
        ) {

            /*
               Vertical swipe.
            */

            if (
                Math.abs(dy) >
                Math.abs(dx)
            ) {

                if (dy < 0) {

                    playExpression(
                        "excited"
                    );

                } else {

                    playExpression(
                        "sad"
                    );
                }

            }

            /*
               Horizontal swipe.
            */

            else {

                if (dx > 0) {

                    playExpression(
                        "surprised"
                    );

                } else {

                    playExpression(
                        "confused"
                    );
                }
            }


            return;
        }


        /*
           Long press does not
           count as a tap.
        */

        if (
            duration >= 600
        ) {

            return;
        }


        /*
           TAP COUNT
        */

        taps++;


        clearTimeout(
            tapTimer
        );


        tapTimer =
            setTimeout(() => {

                taps = 0;

            }, 600);


        /*
           Five taps = angry.
        */

        if (
            taps >= 5
        ) {

            taps = 0;


            playExpression(
                "angry"
            );


            if (
                navigator.vibrate
            ) {

                navigator.vibrate(
                    [
                        80,
                        40,
                        80,
                        40,
                        140
                    ]
                );
            }


            return;
        }


        /*
           Four taps = sad.
        */

        if (
            taps === 4
        ) {

            playExpression(
                "sad"
            );

            return;
        }


        /*
           Three taps = curious.
        */

        if (
            taps === 3
        ) {

            playExpression(
                "curious"
            );

            return;
        }


        /*
           Two taps = happy.
        */

        if (
            taps === 2
        ) {

            playExpression(
                "happy"
            );

            return;
        }


        /*
           One tap.
        */

        normalTap();

    }
);


/* =========================================================
   POINTER CANCEL
   ========================================================= */

doodle.addEventListener(
    "pointercancel",
    () => {

        pointerDown = false;

        clearTimeout(
            longPressTimer
        );
    }
);


/* =========================================================
   DIZZY
   ========================================================= */

function getDizzy() {

    if (
        state === "dizzy"
    ) {

        return;
    }


    clearExpressionTimers();

    clearTimeout(
        idleTimer
    );


    state =
        "dizzy";


    doodle.classList.remove(

        "blink",
        "happy",
        "excited",
        "surprised",
        "curious",
        "confused",
        "angry",
        "sad",
        "sleep",
        "thinking",
        "laughing",
        "listening",
        "speaking",
        "attention",
        "loading"

    );


    doodle.classList.add(
        "dizzy"
    );


    /*
       Reset geometry to normal first.
       CSS then transforms the eyes
       into the dizzy appearance.
    */

    applyExpression(
        "idle"
    );


    /*
       Re-add dizzy because applyExpression
       clears the class.
    */

    doodle.classList.add(
        "dizzy"
    );


    if (
        navigator.vibrate
    ) {

        navigator.vibrate(
            [
                50,
                50,
                50,
                50,
                80
            ]
        );
    }


    setTimeout(() => {

        doodle.classList.remove(
            "dizzy"
        );


        state =
            "idle";


        applyExpression(
            "idle"
        );


        resetIdle();

    }, 4000);
}


/* =========================================================
   DEVICE SHAKE
   ========================================================= */

window.addEventListener(
    "devicemotion",
    event => {

        if (
            state === "dizzy"
        ) {

            return;
        }


        const acceleration =
            event.accelerationIncludingGravity;


        if (
            !acceleration ||
            acceleration.x == null
        ) {

            return;
        }


        if (
            lastAccX !== undefined
        ) {

            const delta =

                Math.abs(
                    acceleration.x -
                    lastAccX
                )

                +

                Math.abs(
                    acceleration.y -
                    lastAccY
                )

                +

                Math.abs(
                    acceleration.z -
                    lastAccZ
                );


            if (
                delta > 25
            ) {

                shakeCount++;


                clearTimeout(
                    shakeTimer
                );


                shakeTimer =
                    setTimeout(() => {

                        shakeCount = 0;

                    }, 800);


                if (
                    shakeCount >= 5
                ) {

                    shakeCount = 0;

                    getDizzy();
                }
            }
        }


        lastAccX =
            acceleration.x;

        lastAccY =
            acceleration.y;

        lastAccZ =
            acceleration.z;

    }
);


/* =========================================================
   BATTERY
   ========================================================= */

async function initBattery() {

    try {

        if (
            !navigator.getBattery
        ) {

            return;
        }


        const battery =
            await navigator.getBattery();


        function updateBattery() {

            doodle.classList.toggle(
                "charging",
                battery.charging
            );


            doodle.classList.toggle(
                "tired",
                battery.level <= 0.2 &&
                !battery.charging
            );
        }


        updateBattery();


        battery.addEventListener(
            "chargingchange",
            updateBattery
        );


        battery.addEventListener(
            "levelchange",
            updateBattery
        );

    }

    catch (error) {

        console.log(
            "Battery API unavailable."
        );
    }
}


/* =========================================================
   PROGRAMMATIC EXPRESSION API
   ========================================================= */

/*
   These are intentionally global.

   Future Android / AI / voice code
   can call them directly.
*/


window.doodleExpression =
    function(name) {

        if (
            EXPRESSION_FRAMES[name]
        ) {

            playExpression(
                name
            );

            return;
        }


        if (
            EXPRESSIONS[name]
        ) {

            setState(
                name
            );
        }
    };


/*
   Useful aliases for future
   Android integration.
*/

window.doodleListen =
    function() {

        setState(
            "listening"
        );
    };


window.doodleSpeak =
    function() {

        setState(
            "speaking"
        );
    };


window.doodleThink =
    function() {

        playExpression(
            "thinking"
        );
    };


window.doodleLoading =
    function() {

        setState(
            "loading"
        );
    };


window.doodleAttention =
    function() {

        playExpression(
            "attention"
        );
    };


window.doodleDizzy =
    function() {

        getDizzy();
    };


/* =========================================================
   START
   ========================================================= */

applyExpression(
    "idle"
);

scheduleBlink();

resetIdle();

initBattery();
