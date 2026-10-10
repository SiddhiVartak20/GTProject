/* =========================================================
   NEON CLASH
   Battle of Minds
   ========================================================= */


/* ================= GAME STATE ================= */

let gameMode = "ai";

let currentLevel = 1;

let score1 = 0;

let score2 = 0;

let health1 = 100;

let health2 = 100;

let timeLeft = 30;

let timerInterval = null;

let gameRunning = false;

let paused = false;

let targetTimeout = null;

let aiTimeout = null;

let currentPattern = [];

let playerPattern = [];

let patternRound = 0;

let doublePoints = false;

let shieldActive = false;


/* ================= DOM ================= */

const homeScreen = document.getElementById("homeScreen");

const levelScreen = document.getElementById("levelScreen");

const gameScreen = document.getElementById("gameScreen");

const resultOverlay = document.getElementById("resultOverlay");

const pauseOverlay = document.getElementById("pauseOverlay");

const target = document.getElementById("target");

const battleTarget = document.getElementById("battleTarget");

const timerElement = document.getElementById("timer");

const score1Element = document.getElementById("score1");

const score2Element = document.getElementById("score2");

const health1Element = document.getElementById("health1");

const health2Element = document.getElementById("health2");

const player2Name = document.getElementById("player2Name");

const levelName = document.getElementById("levelName");

const patternMessage = document.getElementById("patternMessage");


/* ================= AUDIO ================= */

const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

let audioContext;


function playSound(frequency = 500, duration = 0.1) {

    try {

        if (!audioContext) {
            audioContext = new AudioContextClass();
        }

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        oscillator.frequency.value = frequency;

        oscillator.type = "sine";

        gain.gain.value = 0.05;

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {

        console.log("Audio unavailable");

    }

}


/* ================= MODE ================= */

function selectMode(mode) {

    gameMode = mode;

    if (mode === "ai") {

        player2Name.textContent = "AI";

    } else {

        player2Name.textContent = "PLAYER 2";

    }

    showScreen(levelScreen);

}


/* ================= SCREEN ================= */

function showScreen(screen) {

    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("active"));

    screen.classList.add("active");

}


function goHome() {

    stopGame();

    resultOverlay.classList.remove("show");

    pauseOverlay.classList.remove("show");

    showScreen(homeScreen);

}


/* ================= START GAME ================= */

function startGame(level) {

    currentLevel = level;

    resetGame();

    showScreen(gameScreen);

    levelName.textContent =
        `LEVEL ${level} - ${getLevelName(level)}`;

    document.getElementById("level1Area")
        .classList.add("hidden");

    document.getElementById("level2Area")
        .classList.add("hidden");

    document.getElementById("level3Area")
        .classList.add("hidden");


    if (level === 1) {

        document.getElementById("level1Area")
            .classList.remove("hidden");

        startLevel1();

    }


    if (level === 2) {

        document.getElementById("level2Area")
            .classList.remove("hidden");

        startLevel2();

    }


    if (level === 3) {

        document.getElementById("level3Area")
            .classList.remove("hidden");

        startLevel3();

    }

}


function getLevelName(level) {

    if (level === 1) return "QUICK REFLEX";

    if (level === 2) return "PATTERN HUNT";

    return "NEON BATTLE";

}


/* ================= RESET ================= */

function resetGame() {

    clearInterval(timerInterval);

    clearTimeout(targetTimeout);

    clearTimeout(aiTimeout);

    score1 = 0;

    score2 = 0;

    health1 = 100;

    health2 = 100;

    timeLeft = 30;

    gameRunning = true;

    paused = false;

    doublePoints = false;

    shieldActive = false;

    patternRound = 0;

    currentPattern = [];

    playerPattern = [];

    updateUI();

}


/* ================= STOP ================= */

function stopGame() {

    gameRunning = false;

    clearInterval(timerInterval);

    clearTimeout(targetTimeout);

    clearTimeout(aiTimeout);

}


/* ================= UI ================= */

function updateUI() {

    score1Element.textContent = score1;

    score2Element.textContent = score2;

    health1Element.style.width =
        Math.max(0, health1) + "%";

    health2Element.style.width =
        Math.max(0, health2) + "%";

    timerElement.textContent = timeLeft;

}


/* ================= TIMER ================= */

function startTimer() {

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        if (!gameRunning || paused) return;

        timeLeft--;

        updateUI();

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            finishGame();

        }

    }, 1000);

}


/* =========================================================
   LEVEL 1 - QUICK REFLEX
   ========================================================= */

function startLevel1() {

    timeLeft = 30;

    updateUI();

    moveTarget();

    startTimer();

    if (gameMode === "ai") {

        scheduleAILevel1();

    }

}


/* Move target */

function moveTarget() {

    if (!gameRunning || paused) return;

    const arena =
        document.getElementById("reflexArena");

    const maxX =
        arena.clientWidth - target.offsetWidth;

    const maxY =
        arena.clientHeight - target.offsetHeight;

    const x =
        Math.random() * Math.max(0, maxX);

    const y =
        Math.random() * Math.max(0, maxY);

    target.style.left = `${x}px`;

    target.style.top = `${y}px`;

}


/* Player clicks target */

target.addEventListener("click", function () {

    if (!gameRunning || paused) return;

    score1 += doublePoints ? 20 : 10;

    target.style.animation = "hit .2s";

    setTimeout(() => {

        target.style.animation = "";

    }, 200);

    playSound(800, .08);

    updateUI();

    moveTarget();

    if (gameMode === "ai") {

        scheduleAILevel1();

    }

});


/* AI */

function scheduleAILevel1() {

    clearTimeout(aiTimeout);

    const difficulty =
        Math.max(350, 1200 - (30 - timeLeft) * 20);

    aiTimeout = setTimeout(() => {

        if (!gameRunning || paused) return;

        score2 += 10;

        playSound(500, .05);

        moveTarget();

        updateUI();

        scheduleAILevel1();

    }, difficulty + Math.random() * 500);

}


/* =========================================================
   LEVEL 2 - PATTERN HUNT
   ========================================================= */

const colors = [
    "red",
    "blue",
    "green",
    "yellow"
];


function startLevel2() {

    timeLeft = 40;

    updateUI();

    patternMessage.textContent =
        "Get ready...";

    startTimer();

    setTimeout(() => {

        nextPatternRound();

    }, 1000);

}


function nextPatternRound() {

    if (!gameRunning || paused) return;

    patternRound++;

    playerPattern = [];

    currentPattern = [];

    const patternLength =
        Math.min(3 + patternRound, 8);


    for (let i = 0; i < patternLength; i++) {

        currentPattern.push(
            colors[Math.floor(Math.random() * colors.length)]
        );

    }


    showPattern();

}


async function showPattern() {

    patternMessage.textContent =
        `Round ${patternRound}: Watch the pattern`;

    disablePatternButtons(true);


    for (const color of currentPattern) {

        await sleep(500);

        flashColor(color);

        await sleep(300);

    }


    patternMessage.textContent =
        "Your turn!";

    disablePatternButtons(false);


    if (gameMode === "ai") {

        scheduleAIPattern();

    }

}


function flashColor(color) {

    const button =
        document.querySelector(
            `.color-btn.${color}`
        );

    if (!button) return;

    button.classList.add("active");

    playSound(500 + Math.random() * 400, .1);

    setTimeout(() => {

        button.classList.remove("active");

    }, 300);

}


function disablePatternButtons(disabled) {

    document.querySelectorAll(".color-btn")
        .forEach(button => {

            button.disabled = disabled;

        });

}


document.querySelectorAll(".color-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            if (!gameRunning || paused) return;

            const selected =
                button.dataset.color;

            playerPattern.push(selected);

            flashColor(selected);

            const index =
                playerPattern.length - 1;


            if (
                playerPattern[index] !==
                currentPattern[index]
            ) {

                health1 -= 15;

                patternMessage.textContent =
                    "❌ Wrong pattern!";

                playSound(180, .2);

                updateUI();

                playerPattern = [];

                disablePatternButtons(true);

                setTimeout(() => {

                    if (health1 <= 0) {

                        finishGame();

                        return;

                    }

                    nextPatternRound();

                }, 800);

                return;

            }


            if (
                playerPattern.length ===
                currentPattern.length
            ) {

                const points =
                    currentPattern.length * 10;

                score1 +=
                    doublePoints ? points * 2 : points;

                patternMessage.textContent =
                    `✅ Correct! +${points}`;

                playSound(900, .12);

                updateUI();

                disablePatternButtons(true);

                setTimeout(() => {

                    nextPatternRound();

                }, 900);

            }

        });

    });


function scheduleAIPattern() {

    clearTimeout(aiTimeout);

    aiTimeout = setTimeout(() => {

        if (!gameRunning || paused) return;

        /*
            AI success probability improves
            as the game progresses.
        */

        let successChance =
            0.65 + patternRound * 0.04;

        successChance =
            Math.min(successChance, 0.9);


        if (Math.random() < successChance) {

            score2 += currentPattern.length * 10;

        } else {

            health2 -= 10;

        }

        updateUI();

        if (health2 <= 0) {

            finishGame();

        }

    }, 1200 + Math.random() * 800);

}


/* =========================================================
   LEVEL 3 - NEON BATTLE
   ========================================================= */

function startLevel3() {

    timeLeft = 45;

    updateUI();

    moveBattleTarget();

    startTimer();

    if (gameMode === "ai") {

        scheduleAILevel3();

    }

}


function moveBattleTarget() {

    if (!gameRunning || paused) return;

    const arena =
        document.getElementById("battleArena");

    const maxX =
        arena.clientWidth -
        battleTarget.offsetWidth;

    const maxY =
        arena.clientHeight -
        battleTarget.offsetHeight;

    battleTarget.style.left =
        Math.random() * Math.max(0, maxX) + "px";

    battleTarget.style.top =
        Math.random() * Math.max(0, maxY) + "px";

}


battleTarget.addEventListener("click", () => {

    if (!gameRunning || paused) return;

    let points = 15;

    if (doublePoints) {

        points *= 2;

    }

    score1 += points;

    health2 -= 5;

    playSound(1000, .08);

    updateUI();

    moveBattleTarget();

    if (health2 <= 0) {

        finishGame();

        return;

    }

    if (gameMode === "ai") {

        scheduleAILevel3();

    }

});


function scheduleAILevel3() {

    clearTimeout(aiTimeout);

    const reactionTime =
        Math.max(
            250,
            1000 - (45 - timeLeft) * 15
        );


    aiTimeout = setTimeout(() => {

        if (!gameRunning || paused) return;

        let points = 10;

        if (Math.random() < 0.2) {

            points = 20;

        }

        score2 += points;

        health1 -= 4;

        playSound(400, .05);

        updateUI();

        moveBattleTarget();

        if (health1 <= 0) {

            finishGame();

            return;

        }

        scheduleAILevel3();

    }, reactionTime + Math.random() * 300);

}


/* =========================================================
   POWER UPS
   ========================================================= */

function activatePower(type) {

    if (!gameRunning || paused) return;


    if (type === "double") {

        doublePoints = true;

        patternMessage.textContent =
            "⚡ DOUBLE POINTS ACTIVE!";

        setTimeout(() => {

            doublePoints = false;

        }, 5000);

    }


    if (type === "shield") {

        shieldActive = true;

        health1 += 15;

        health1 = Math.min(100, health1);

        updateUI();

        setTimeout(() => {

            shieldActive = false;

        }, 5000);

    }


    if (type === "speed") {

        moveBattleTarget();

        moveBattleTarget();

        playSound(1200, .1);

    }

}


/* =========================================================
   PAUSE
   ========================================================= */

function pauseGame() {

    if (!gameRunning) return;

    paused = true;

    pauseOverlay.classList.add("show");

}


function resumeGame() {

    paused = false;

    pauseOverlay.classList.remove("show");

}


/* =========================================================
   RESTART
   ========================================================= */

function restartCurrentGame() {

    resultOverlay.classList.remove("show");

    pauseOverlay.classList.remove("show");

    startGame(currentLevel);

}


/* =========================================================
   FINISH
   ========================================================= */

function finishGame() {

    if (!gameRunning) return;

    gameRunning = false;

    clearInterval(timerInterval);

    clearTimeout(targetTimeout);

    clearTimeout(aiTimeout);


    let winner;

    if (score1 > score2) {

        winner = "PLAYER 1 WINS!";

        document.getElementById("resultIcon")
            .textContent = "🏆";

    }

    else if (score2 > score1) {

        winner =
            gameMode === "ai"
                ? "AI WINS!"
                : "PLAYER 2 WINS!";

        document.getElementById("resultIcon")
            .textContent = "🤖";

    }

    else {

        winner = "IT'S A DRAW!";

        document.getElementById("resultIcon")
            .textContent = "🤝";

    }


    document.getElementById("resultTitle")
        .textContent = winner;


    document.getElementById("finalScore1")
        .textContent = score1;


    document.getElementById("finalScore2")
        .textContent = score2;


    document.getElementById("finalPlayer2")
        .textContent =
        gameMode === "ai"
            ? "AI"
            : "PLAYER 2";


    document.getElementById("resultMessage")
        .textContent =
        `Level ${currentLevel} completed!`;


    resultOverlay.classList.add("show");

    playSound(
        score1 >= score2 ? 1000 : 250,
        .4
    );

}


/* =========================================================
   UTILITY
   ========================================================= */

function sleep(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        if (gameRunning) {

            if (paused) {

                resumeGame();

            } else {

                pauseGame();

            }

        }

    }

});


/* =========================================================
   INITIALIZATION
   ========================================================= */

updateUI();