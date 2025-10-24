// ==== GAME SCRIPT ====
// Make sure <script src="coinCore.js"></script> is loaded before this

/* ======================================================
   =============== INITIAL GAME DATA =====================
====================================================== */
const profiles = [
  { name: "Zewonie", isSTD: false }, { name: "Dennis", isSTD: false },
  { name: "Iqnore", isSTD: false },  { name: "Hieu", isSTD: false },
  { name: "Edd", isSTD: false },     { name: "Win", isSTD: false },
  { name: "Kai", isSTD: false },     { name: "Ary", isSTD: false },
  { name: "Matt", isSTD: false },    { name: "Mido", isSTD: false },
  { name: "Sai", isSTD: false },     { name: "Zhiynl", isSTD: false },
  { name: "Andy", isSTD: false },    { name: "Lucy", isSTD: true },
  { name: "Sans", isSTD: true }
];

const currentChar = sessionStorage.getItem("playerCharacter");

const deathSounds = {
  Andy: "assets/death_andy.mp3",
  Sai: "assets/death_sai.mp3",
  Kj: "assets/death_kj.mp3"
};
const defaultDeathSound = "assets/sfx/death_default.mp3";

const achievementList = {
  clappedDennis: { name: "I'M HYPERFOLDING IT", description: "Clap Dennis 10 times in one game" },
  clappedAndy: { name: "Put On The Cowsuit Bro", description: "Clap Andy 10 times in one game" },
  clappedKai: { name: "Big Black Japanese Man", description: "Clap Kai 10 times in one game" },
  clappedSai: { name: "Amogus Sex Plushie", description: "Clap Sai 10 times in one game" },
  clappedMatt: { name: "Femboy Feet", description: "Clap Matt 10 times in one game" },
  clappedZewonie: { name: "Quite Possibly My Biggest 'Hear Me Out'", description: "Clap Kj 10 times in one game" },
  clappedIqnore: { name: "I'm Saving This Shit To My Gallery", description: "Clap Iqnore 10 times in one game" },
  clappedZhiynl: { name: "DRINK THE PEE NOW NOWWWWW", description: "Clap Zhiynl 10 times in one game" },
  clappedAry: { name: "FEMALE COUNTERPART SUPREMACY", description: "Clap Ary 10 times in one game" },
  clappedEdd: { name: "His Mother Is Still Better", description: "Clap Edd 10 times in one game" },
  clappedWin: { name: "First One To Fall Asleep In The Sleepover", description: "Clap Win 10 times in one game" },
  clappedHieu: { name: "Only Ethical Gooning 😡", description: "Clap Hieu 10 times in one game" },
  clappedMido: { name: "Necrophiliac", description: "Clap Mido 10 times in one game" },
  clappedSansZero: { name: "Pre Nut Clarity", description: "Clap Sans at 0 score" },
  clappedLucyZero: { name: "You Alright Bro?", description: "Clap Lucy at 0 score" }
};

/* ======================================================
   =============== GAME STATE VARIABLES =================
====================================================== */
const hardModeActive = sessionStorage.getItem("hardModeActive") === "true";
if (hardModeActive) {
  const ambience = document.getElementById("fnaf-ambience");
  ambience.volume = 0.5;
  ambience.play().catch(() => {});
}

let leftProfile, rightProfile, selectedSlot = null, hasClapped = false;
let score = 0;
let maxReveals = hardModeActive ? 1 : 3;
let revealUses = maxReveals;

let achievements = JSON.parse(localStorage.getItem("achievements") || "{}");
let clapCounts = {};
const chosenTargets = JSON.parse(sessionStorage.getItem("chosenTargets") || "[]");

/* ======================================================
   =============== DOM ELEMENTS =========================
====================================================== */
const scoreDisplay = document.getElementById("score");
const leftDiv = document.getElementById("left-slot");
const rightDiv = document.getElementById("right-slot");
const clapBtn = document.getElementById("clap-btn");
const revealBtn = document.getElementById("reveal-btn");
const revealCountDisplay = document.getElementById("reveal-count");
const popup = document.getElementById("achievement-popup");

const clapSound = document.getElementById("clap-sound");
const alertSound = document.getElementById("alert-sound");
const achievementSound = document.getElementById("achievement-sound");
const clickSound = document.getElementById("button-click");
const revealClickSound = document.getElementById("reveal-click");

document.getElementById("targets-display").textContent = chosenTargets.join(", ");

/* ======================================================
   =============== HELPER FUNCTIONS =====================
====================================================== */
function playSound(snd) {
  if (!snd) return;
  try {
    snd.pause();
    snd.currentTime = 0;
    snd.play().catch(() => {});
  } catch (e) {
    console.warn("playSound failed:", e);
  }
}

/**
 * Applies a screen shake effect.
 * @param {boolean} isHeavy - True for intense shake, false for light shake.
 */
function shakeScreen(isHeavy) {
    const body = document.body;
    const shakeClass = isHeavy ? "screen-shake-heavy" : "screen-shake-light";
    
    // Remove both just in case, then add the desired one
    body.classList.remove("screen-shake-light", "screen-shake-heavy");
    body.classList.add(shakeClass);

    // Remove the class after the animation is done (200ms)
    setTimeout(() => {
        body.classList.remove(shakeClass);
    }, 200); 
}

function playDeathSound() {
  const path = deathSounds[currentChar] || defaultDeathSound;
  const deathAudio = new Audio(path);
  deathAudio.volume = 0.8;
  deathAudio.play().catch(() => {});
  return deathAudio;
}

function highlightSlot(slot) {
  leftDiv.classList.toggle("selected", slot === "left");
  rightDiv.classList.toggle("selected", slot === "right");
}

function updateRevealCount() {
  revealCountDisplay.textContent = `Reveals left: ${revealUses}`;
  revealBtn.disabled = revealUses <= 0 || !selectedSlot;
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
  const currentHigh = localStorage.getItem("highScore") || 0;
  if (score > currentHigh) localStorage.setItem("highScore", score);
}

function unlockAchievement(id) {
  if (achievements[id]) return;
  achievements[id] = "new";
  localStorage.setItem("achievements", JSON.stringify(achievements));

  popup.innerHTML = `<strong>🎉 ${achievementList[id].name}</strong><br>${achievementList[id].description}`;
  popup.classList.add("show");

  playSound(achievementSound);
  setTimeout(() => popup.classList.remove("show"), 4000);
}

function getRandomProfile() {
  const stdChance = hardModeActive ? 0.4 : 0.10;
  return Math.random() < stdChance
    ? (Math.random() < 0.5 ? { name: "Lucy", isSTD: true } : { name: "Sans", isSTD: true })
    : profiles.filter(p => !p.isSTD)[Math.floor(Math.random() * 13)];
}

function resetRound() {
  do {
    leftProfile = getRandomProfile();
    rightProfile = getRandomProfile();
  } while (leftProfile.isSTD && rightProfile.isSTD);

  leftDiv.textContent = "🗣❓";
  rightDiv.textContent = "🗣❓";
  selectedSlot = null;
  clapBtn.disabled = true;
  hasClapped = false;
  highlightSlot(null);
  updateRevealCount();
}

/* ======================================================
   =============== GAME OVER + COINS =====================
====================================================== */
function gameOver() {
  stopTimer();

  // Add coins
  shopAPI.addCoins(score);

  // Prepare redirect
  const redirectNow = () => {
    sessionStorage.setItem("lastScore", score);
    setTimeout(() => window.location.href = "gameover.html", 600);
  };

  // Check if there is a character-specific death sound
  const deathPath = deathSounds[currentChar];
  if (deathPath) {
    const deathAudio = new Audio(deathPath);
    deathAudio.volume = 0.8;
    deathAudio.play().catch(() => {});
    // Redirect after death sound ends (fallback after 1.5s)
    deathAudio.addEventListener("ended", redirectNow);
    setTimeout(redirectNow, 1500);
  } else {
    // No character death sound → just play alert immediately
    try { alertSound.play(); } catch {}
    redirectNow();
  }
}

/* ======================================================
   =============== STOPWATCH =============================
====================================================== */
const timerDisplay = document.getElementById("timer-display");
let startTime = Date.now();
let fastForwardMultiplier = 1;
let timerInterval = setInterval(updateTimer, 1000);

function updateTimer() {
  const elapsed = Date.now() - startTime;
  const totalSeconds = Math.floor((elapsed / 1000) * fastForwardMultiplier);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function landStopwatchRandomly() {
  const elapsed = Date.now() - startTime;
  const minOffset = 5;
  const maxOffset = 25;
  const randomSeconds = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
  startTime = Date.now() - elapsed - randomSeconds * 1000;
  updateTimer();
}

/* ======================= Forfeit Button ======================= */
window.addEventListener("DOMContentLoaded", () => {
  const forfeitBtn = document.getElementById("forfeit-btn");
  const clickSfx = document.getElementById('click-sfx');

  if (!forfeitBtn) return;

  forfeitBtn.addEventListener("click", () => {
    if (clickSfx) {
      clickSfx.currentTime = 0;
      clickSfx.play().catch(() => {});
    }

    // trigger your game's official game over logic
    if (typeof gameOver === "function") {
      gameOver();
    } else {
      // fallback
      window.location.href = "gameover.html";
    }
  });
});

/* ======================================================
   =============== EVENT HANDLERS ========================
====================================================== */
// Slot selection
document.getElementById("choose-left").addEventListener("click", () => {
  playSound(clickSound);
  selectedSlot = "left";
  clapBtn.disabled = false;
  highlightSlot("left");
  updateRevealCount();
});

document.getElementById("choose-right").addEventListener("click", () => {
  playSound(clickSound);
  selectedSlot = "right";
  clapBtn.disabled = false;
  highlightSlot("right");
  updateRevealCount();
});

// Track which slots have been revealed in the current round
let revealedSlots = { left: false, right: false };

// Reveal button logic
revealBtn.addEventListener("click", () => {
    if (!selectedSlot || revealUses <= 0) return;
    if (revealedSlots[selectedSlot]) return; // can't reveal same slot twice

    playSound(revealClickSound);

    if (currentChar === "Sai") {
        doSaiGlance();
    } else {
        const chosen = selectedSlot === "left" ? leftProfile : rightProfile;
        const chosenDiv = selectedSlot === "left" ? leftDiv : rightDiv;

        // ================= NEXT CARD WARNING =================
        if (passives.nextCardWarning && selectedSlot === passives.warnedSlot) {
            chosen.isSTD = true;
            passives.nextCardWarning = false;
            passives.warnedSlot = null;
        }

        // Reveal the chosen slot normally
        chosenDiv.textContent = chosen.name;
        revealUses--;
        revealedSlots[selectedSlot] = true; // mark slot as revealed
        updateRevealCount();
    }
});

function doSaiGlance() {
    if (!selectedSlot) return;

    // Immediately reveal both cards
    leftDiv.textContent = leftProfile.name;
    rightDiv.textContent = rightProfile.name;

    // If no STD cards, just decrement reveals
    if (!leftProfile.isSTD && !rightProfile.isSTD) {
        revealUses--;
        updateRevealCount();
        revealedSlots.left = true;
        revealedSlots.right = true;
        return;
    }

    revealBtn.disabled = true;

    // Play gofast sound
    const goFastSound = document.getElementById('gofast-sfx');
    if (goFastSound) {
        goFastSound.currentTime = 0;
        goFastSound.play().catch(() => {});
    }

    // Animate stopwatch fast-forward
    animateStopwatchFast(3000, 50);

    setTimeout(() => {
        const cycleDuration = 100;
        const cycleCount = 10;
        let currentCycle = 0;
        const interval = setInterval(() => {
            const randomLeft = profiles[Math.floor(Math.random() * profiles.length)];
            const randomRight = profiles[Math.floor(Math.random() * profiles.length)];
            leftDiv.textContent = randomLeft.name;
            rightDiv.textContent = randomRight.name;

            // Flash effect
            [leftDiv, rightDiv].forEach(div => {
                div.classList.add("card-flash");
                setTimeout(() => div.classList.remove("card-flash"), cycleDuration - 10);
            });

            currentCycle++;
            if (currentCycle >= cycleCount) {
                clearInterval(interval);

                // Replace STD cards with safe chosen targets
                const chosen = JSON.parse(sessionStorage.getItem("chosenTargets") || "[]");
                let safeTargets = [...chosen];

                const leftIndex = Math.floor(Math.random() * safeTargets.length);
                const leftName = safeTargets.splice(leftIndex, 1)[0];
                leftProfile = profiles.find(p => p.name === leftName);

                const rightIndex = Math.floor(Math.random() * safeTargets.length);
                const rightName = safeTargets.splice(rightIndex, 1)[0];
                rightProfile = profiles.find(p => p.name === rightName);

                leftDiv.textContent = leftProfile.name;
                rightDiv.textContent = rightProfile.name;

                landStopwatchRandomly();
                revealBtn.disabled = false;

                // Mark both slots revealed and decrement uses
                revealedSlots.left = true;
                revealedSlots.right = true;
                revealUses--;
                updateRevealCount();
            }
        }, cycleDuration);
    }, 700);
}

// Stopwatch fast-forward animation
let stopwatchFastAnim = null;
function animateStopwatchFast(duration = 1000, speed = 50) {
    if (!timerDisplay) return;

    let fakeSeconds = 0;
    const interval = 50;
    const totalFrames = duration / interval;

    stopwatchFastAnim = setInterval(() => {
        fakeSeconds += speed;
        const totalSeconds = Math.floor(fakeSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    }, interval);

    setTimeout(() => {
        clearInterval(stopwatchFastAnim);
        stopwatchFastAnim = null;
        updateTimer();
    }, duration);
}

// Clap logic
clapBtn.addEventListener("click", () => {
    if (hasClapped) return;
    hasClapped = true;
    playSound(clapSound);

    const chosen = selectedSlot === "left" ? leftProfile : rightProfile;
    const chosenDiv = selectedSlot === "left" ? leftDiv : rightDiv;
    const otherDiv = selectedSlot === "left" ? rightDiv : leftDiv;
    const otherProfile = selectedSlot === "left" ? rightProfile : leftProfile;

    // Determine shake intensity
    const isTarget = chosenTargets.includes(chosen.name);
    shakeScreen(isTarget);

    // Reveal clicked slot immediately
    chosenDiv.textContent = chosen.name;

    if ((chosen.name === "Lucy" || chosen.name === "Sans") && score === 0) {
        unlockAchievement(chosen.name === "Lucy" ? "clappedLucyZero" : "clappedSansZero");
    }

    if (chosen.isSTD) {
        if (currentChar !== "Andy" || chosen.name !== "Sans") {
            if ((chosen.name === "Lucy" || chosen.name === "Sans") && score === 0)
                sessionStorage.setItem("badEnding", "true");
            else sessionStorage.removeItem("badEnding");

            gameOver();
            return;
        }
    }

    if (currentChar === "Andy" && chosen.name === "Sans") {
        score += 5;
    } else {
        score += chosenTargets.includes(chosen.name) ? 2 : 1;
    }
    updateScore();

    clapCounts[chosen.name] = (clapCounts[chosen.name] || 0) + 1;
    if (clapCounts[chosen.name] >= 10) {
        const achievementId = "clapped" + chosen.name.replace(/[^a-zA-Z0-9]/g, '');
        if (achievementList[achievementId]) unlockAchievement(achievementId);
    }

    // Reveal the other slot after 0.5s with lower opacity
    setTimeout(() => {
        otherDiv.textContent = otherProfile.name;
        otherDiv.style.opacity = 0.5;
    } );

    // Reset round after 0.6s
    setTimeout(() => {
        resetRound();
        revealedSlots = { left: false, right: false };
        // Restore opacity for next round
        leftDiv.style.opacity = 1;
        rightDiv.style.opacity = 1;
    }, 600);
});


/* ======================================================
   =============== INITIALIZATION =======================
====================================================== */
updateScore();
resetRound();

// GLANCE PASSIVE FOR SAI 
if (currentChar === "Sai") {
  // Double reveal yo
  maxReveals *= 2;
  revealUses = maxReveals;
  revealBtn.textContent = "Glance";

  // Flash effect only for Sai
  revealBtn.classList.add("my-glance-effect");
  setTimeout(() => revealBtn.classList.remove("my-glance-effect"), 600);

  // Play glance sound only for Sai
  setTimeout(() => {
    const glanceSfx = document.getElementById("glance-sfx");
    if (glanceSfx) {
      glanceSfx.currentTime = 0;
      glanceSfx.play().catch(() => {});
    }
  }, 300);
}

if (currentChar === "Kj") {
  setInterval(() => passives.Kj(), 10000 + Math.random() * 10000);
}