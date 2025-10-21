 // ====GAME SCRIPT====
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

  // which character the player selected on the selection screen
  const currentChar = sessionStorage.getItem("playerCharacter");

  // Unique death sounds (extend as needed)
  const deathSounds = {
    Andy: "assets/death_andy.mp3",
    Sai: "assets/death_sai.mp3",
    // add other characters here...
  };

  // fallback if character-specific doesn't exist
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
// check Hard Mode first
const hardModeActive = sessionStorage.getItem("hardModeActive") === "true";
console.log(`Hard Mode is ${hardModeActive ? "ON" : "OFF"}`);

    // Hard Mode Ambience
    if (hardModeActive) {
  const ambience = document.getElementById("fnaf-ambience");
  ambience.volume = 0.5; // adjust if needed
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

  // single, canonical playSound for HTMLAudioElement objects
  function playSound(snd) {
    if (!snd) return;
    try {
      snd.pause();
      snd.currentTime = 0;
      const p = snd.play();
      if (p !== undefined) p.catch(() => {}); // ignore autoplay errors
    } catch (e) {
      // swallow any errors to avoid breaking gameplay
      console.warn("playSound failed:", e);
    }
  }

  // play a character-specific death sound (returns the Audio instance for further handling)
  function playDeathSound() {
    const path = deathSounds[currentChar] || defaultDeathSound;
    const deathAudio = new Audio(path);
    deathAudio.volume = 0.8;
    // attempt to play, ignore promise rejection
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

    achievementSound.pause();
    achievementSound.currentTime = 0;
    achievementSound.playbackRate = Math.random() * 1.5 + 0.25;
    achievementSound.play();

    setTimeout(() => popup.classList.remove("show"), 4000);
  }

function getRandomProfile() {
  const stdChance = hardModeActive ? 0.4 : 0.10; // 40% for Hard Mode, 10% normal
  return Math.random() < stdChance
    ? (Math.random() < 0.5
        ? { name: "Lucy", isSTD: true }
        : { name: "Sans", isSTD: true })
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

  // NEW: improved gameOver that plays death sound, waits for it, then redirects (with fallback)
  function gameOver() {
  const hasCharacter = !!currentChar;
  let finished = false;

  const redirectNow = () => {
    if (finished) return;
    finished = true;
    try { alertSound.play(); } catch (e) {}
    sessionStorage.setItem("lastScore", score);
    setTimeout(() => window.location.href = "gameover.html", 600);
  };

  if (!hasCharacter) {
    // No character selected — skip death sound
    redirectNow();
    return;
  }

  // Character selected — play death sound first
  const deathAudio = playDeathSound();

  if (deathAudio && typeof deathAudio.addEventListener === "function") {
    deathAudio.addEventListener("ended", redirectNow);
    setTimeout(redirectNow, 1500); // fallback
  } else {
    setTimeout(redirectNow, 1200);
  }
}

// ====================== STOPWATCH ======================
const timerDisplay = document.getElementById("timer-display");
let startTime = Date.now();
let fastForwardMultiplier = 1; // normal speed

let timerInterval = setInterval(updateTimer, 1000);

function updateTimer() {
  const elapsed = Date.now() - startTime;
  const totalSeconds = Math.floor((elapsed / 1000) * fastForwardMultiplier);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

// Call this to stop the stopwatch
function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Call this to fast-forward
function setFastForward(multiplier, duration) {
  fastForwardMultiplier = multiplier;
  if (duration) {
    setTimeout(() => {
      fastForwardMultiplier = 1; // back to normal speed
    }, duration);
  }
}
function landStopwatchRandomly() {
  const elapsed = Date.now() - startTime; // current ms
  const minOffset = 5;   // min extra seconds
  const maxOffset = 25;  // max extra seconds
  const randomSeconds = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;

  // Compute new startTime so the timer displays a “jumped” value
  startTime = Date.now() - elapsed - randomSeconds * 1000;
  updateTimer(); // immediately update display
}

  /* ======================================================
     =============== EVENT HANDLERS =======================
  ====================================================== */
  // Slot Selection
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

   // Reveal slot
  revealBtn.addEventListener("click", () => {
  if (!selectedSlot || revealUses <= 0) return;

  playSound(revealClickSound);

  if (currentChar === "Sai") {
    doSaiGlance(); // your animated glance function
  } else {
    const chosen = selectedSlot === "left" ? leftProfile : rightProfile;
    (selectedSlot === "left" ? leftDiv : rightDiv).textContent = chosen.name;
    revealUses--;
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
  animateStopwatchFast(3000, 50); // duration = 3000ms, speed = 50s per frame

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

        // Make stopwatch land at a random time
        landStopwatchRandomly();

        revealBtn.disabled = false;
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
  const interval = 50; // ms per frame
  const totalFrames = duration / interval;

  stopwatchFastAnim = setInterval(() => {
    fakeSeconds += speed; // how many seconds to jump per frame
    const totalSeconds = Math.floor(fakeSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }, interval);

  setTimeout(() => {
    clearInterval(stopwatchFastAnim);
    stopwatchFastAnim = null;
    updateTimer(); // revert to real elapsed time
  }, duration);
}

  // Clap Action
  clapBtn.addEventListener("click", () => {
    if (hasClapped) return;
    hasClapped = true;

    playSound(clapSound);
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 200);

    const chosen = selectedSlot === "left" ? leftProfile : rightProfile;
    (selectedSlot === "left" ? leftDiv : rightDiv).textContent = chosen.name;

    setTimeout(() => {
      (selectedSlot === "left" ? rightDiv : leftDiv).textContent =
        selectedSlot === "left" ? rightProfile.name : leftProfile.name;
    }, 100);

    // Zero-score special
    if ((chosen.name === "Lucy" || chosen.name === "Sans") && score === 0) {
      const specialKey = chosen.name === "Lucy" ? "clappedLucyZero" : "clappedSansZero";
      if (!achievements[specialKey]) unlockAchievement(specialKey);
    }

// STD ends game
if (chosen.isSTD) {
  if (currentChar === "Andy" && chosen.name === "Sans") {
    // Andy protects Sans → no game over
  } else {
    // all other STD triggers end game
    if ((chosen.name === "Lucy" || chosen.name === "Sans") && score === 0)
      sessionStorage.setItem("badEnding", "true");
    else sessionStorage.removeItem("badEnding");

    stopTimer(); // stop the stopwatch here
    gameOver();
    return;
  }
}


    // Normal success
if (currentChar === "Andy" && (chosen.name === "Sans")) {
    score += 5; // Andy passive bonus
} else {
    score += chosenTargets.includes(chosen.name) ? 2 : 1;
}
    clapCounts[chosen.name] = (clapCounts[chosen.name] || 0) + 1;
    const key = "clapped" + chosen.name;
    if (clapCounts[chosen.name] === 10 && achievementList[key]) unlockAchievement(key);

    updateScore();
    setTimeout(() => resetRound(), 600);
  });

  /* ======================================================
     =============== INITIALIZATION =======================
  ====================================================== */
  updateScore();
  resetRound();

// GLANCE PASSIVE FOR SAI
if (currentChar === "Sai") {
  // double the reveals and update button immediately
  maxReveals *= 2;
  revealUses = maxReveals;
  revealBtn.textContent = "Glance";

  // flash animation
  revealBtn.classList.add("my-glance-effect");
  setTimeout(() => revealBtn.classList.remove("my-glance-effect"), 600);

  updateRevealCount(); // refresh UI

  // play sound after 0.3 seconds
  setTimeout(() => {
    const glanceSfx = document.getElementById("glance-sfx");
    glanceSfx.currentTime = 0;
    glanceSfx.play().catch(() => {});
  }, 300);
}

