(() => {
"use strict";

const profiles = [
  { name: "Zewonie", isSTD: false },
  { name: "Dennis", isSTD: false },
  { name: "Iqnore", isSTD: false },
  { name: "Hieu", isSTD: false },
  { name: "Edd", isSTD: false },
  { name: "Win", isSTD: false },
  { name: "Kai", isSTD: false },
  { name: "Ary", isSTD: false },
  { name: "Matt", isSTD: false },
  { name: "Mido", isSTD: false },
  { name: "Sai", isSTD: false },
  { name: "Zhiynl", isSTD: false },
  { name: "Andy", isSTD: false },
  { name: "Lucy", isSTD: true },
  { name: "Sans", isSTD: true }
];

const grant = (window.shopAPI && shopAPI.claimGrant) ? shopAPI.claimGrant() : null;
let unlockedChars = [];
try { unlockedChars = JSON.parse(localStorage.getItem("unlockedCharacters") || "[]"); } catch {}
const storedChar = sessionStorage.getItem("playerCharacter");
const currentChar = unlockedChars.includes(storedChar) ? storedChar : null;
const SFX = "assets/soundfx/";

// Reveal++ card: a special card (no score, no streak) that gives reveals when clapped
const REVEAL_PLUS_CHANCE = 0.10;   // chance a (non-STD) card is a Reveal++ card
const REVEAL_PLUS_GAIN   = 1;      // reveals gained on clap (passives can adjust via adjustRevealGain)

// Timer multiplier: surviving longer pays more.  coins = score x timer mult x shop mult
const TIMER_MULT_SECONDS_PER_STEP = 120;  // +1.0x for every 2:00 on the timer
const TIMER_MULT_MAX   = 10;              // cap, so idling can't farm an infinite multiplier
const REVEAL_TIME_BONUS = 2;              // seconds added to the timer per reveal
const TIMER_TICK_MS    = 100;

// Streak tiers: [streak needed, score multiplier], passives can add more (see Kai)
const BASE_STREAK_TIERS = [[20, 5], [10, 4], [5, 3], [3, 2]];
const STREAK_BOOST_GRACE_MS = 5000;       // a streak set by a passive event lasts this long before it needs a clap
const ANY_LANE = "*";                     // streakSide value meaning "the next clap continues the streak on any lane"
const deathSounds = {
  Andy: SFX + "death_andy.mp3",
  Sai: SFX + "death_sai.mp3",
  Kj: SFX + "death_kj.mp3",
  Kai: SFX + "kai_death.mp3",
  Zhiynl: SFX + "zhiynl_death.mp3",
  Win: SFX + "death_win.mp3",
  Dennis: SFX + "death_dennis.mp3"
};

const defaultDeathSound = SFX + "alert.mp3";
const achievementList = {
  clappedDennis: {
    name: "I'M HYPERFOLDING IT",
    description: "Clap Dennis 10 times in one game"
  },
  clappedAndy: {
    name: "Put On The Cowsuit Bro",
    description: "Clap Andy 10 times in one game"
  },
  clappedKai: {
    name: "Big Black Japanese Man",
    description: "Clap Kai 10 times in one game"
  },
  clappedSai: {
    name: "Amogus Sex Plushie",
    description: "Clap Sai 10 times in one game"
  },
  clappedMatt: {
    name: "Femboy Feet",
    description: "Clap Matt 10 times in one game"
  },
  clappedZewonie: {
    name: "Quite Possibly My Biggest 'Hear Me Out'",
    description: "Clap Kj 10 times in one game"
  },
  clappedIqnore: {
    name: "I'm Saving This Shit To My Gallery",
    description: "Clap Iqnore 10 times in one game"
  },
  clappedZhiynl: {
    name: "DRINK THE PEE NOW NOWWWWW",
    description: "Clap Zhiynl 10 times in one game"
  },
  clappedAry: {
    name: "FEMALE COUNTERPART SUPREMACY",
    description: "Clap Ary 10 times in one game"
  },
  clappedEdd: {
    name: "His Mother Is Still Better",
    description: "Clap Edd 10 times in one game"
  },
  clappedWin: {
    name: "First One To Fall Asleep In The Sleepover",
    description: "Clap Win 10 times in one game"
  },
  clappedHieu: {
    name: "Only Ethical Gooning 😡",
    description: "Clap Hieu 10 times in one game"
  },
  clappedMido: {
    name: "Necrophiliac",
    description: "Clap Mido 10 times in one game"
  },
  clappedSansZero: {
    name: "Pre Nut Clarity",
    description: "Clap Sans at 0 score"
  },
  clappedLucyZero: {
    name: "You Alright Bro?",
    description: "Clap Lucy at 0 score"
  },
  tunnelVision: {
    name: "Tunnel Vision",
    description: "Game over from clapping Lucy or Sans even after revealing their card"
  },
  momentum: {
    name: "Momentum",
    description: "Reach 20x streak"
  },
  horrorMovie: {
    name: "Horror Movie",
    description: "Reach 100 score in hard mode"
  },
  // id must stay "clappedSans": the 10-clap check builds "clapped" + card name
  clappedSans: {
    name: "Stinking, Disgusting, Walking Hazard",
    description: "Clap Sans 10 times in one game"
  }
};

const hardModeActive =
  sessionStorage.getItem("hardModeActive") === "true";

if (hardModeActive) {
  const ambience = document.getElementById("fnaf-ambience");
  ambience.volume = 0.5;
  ambience.play().catch(() => {});
}

let selectedSlot = null;
let hasClapped = false;
let score = 0;
let runEnded = false;
const highAtStart = Number(localStorage.getItem("highScore")) || 0;
let maxReveals = hardModeActive ? 1 : 3;
let revealUses = maxReveals;
let achievements = JSON.parse(
  localStorage.getItem("achievements") || "{}"
);

let clapCounts = {};
let streakSide = null;
let streakCount = 0;
let streakPopupTimeout = null;
let streakTimeout = null;
let streakBoosted = false;   // streak was set by a passive event, so it doesn't count toward Momentum

const streakPopup = document.getElementById("streak-popup");
window.addEventListener('load', () => {
  const overlay = document.getElementById('fade-in-overlay');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.classList.add('done');
    setTimeout(() => overlay.remove(), 600);
  }));
});

function getStreakTiers() {
  const extra = hook("extraStreakTiers");
  const tiers = Array.isArray(extra) ? BASE_STREAK_TIERS.concat(extra) : BASE_STREAK_TIERS;
  return tiers.slice().sort((a, b) => b[0] - a[0]);   // highest first
}

function getStreakMultiplier(count) {
  const tier = getStreakTiers().find(([need]) => count >= need);
  return tier ? tier[1] : 1;
}

// streak multiplier after the passive has had its say (e.g. Kai's boost)
function currentStreakMultiplier(count, c = null) {
  const mult = getStreakMultiplier(count);
  const boosted = hook("adjustStreakMultiplier", c, mult);
  return Number.isFinite(boosted) ? boosted : mult;
}

function refreshStreakTimeout(ms = 2000) {
  if (streakTimeout) clearTimeout(streakTimeout);

  streakTimeout = setTimeout(() => {
    streakSide = null;
    streakCount = 0;
    streakBoosted = false;
  }, ms);
}

// Jump the streak to the highest tier. The next clap keeps it going on either lane.
function setStreakToMax() {
  if (runEnded) return;
  streakCount = Math.max(streakCount, getStreakTiers()[0][0]);
  streakSide = ANY_LANE;
  streakBoosted = true;
  refreshStreakTimeout(STREAK_BOOST_GRACE_MS);
  showStreakPopup(streakCount, currentStreakMultiplier(streakCount));
}

const kaiStreakSound = new Audio(SFX + "kaistreakcrunch.mp3");
kaiStreakSound.preload = "auto";

function showStreakPopup(count, multiplier) {
  const popup = document.getElementById("streak-popup");
  const isKai = currentChar === "Kai";
  const sound = isKai ? kaiStreakSound : document.getElementById("streak-crunch-sound");

  if (!popup) {
    console.error("Missing #streak-popup in game.html");
    return;
  }

  popup.classList.toggle("kai-streak", isKai);

  popup.innerHTML = `
    <div>x${count}</div>
    <div style="font-size:12px; margin-top:12px;">
      SCORE x${multiplier}
    </div>
  `;

  popup.style.cssText += `
    position: fixed;
    top: 40%;
    left: auto;
    right: 5%;
    z-index: 999999;
    display: block;
    visibility: visible;
    opacity: 1;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(1.5);
    color: "#eeeeee",
    font-family: 'Press Start 2P', monospace;
    font-size: 42px;
    text-align: center;
    white-space: nowrap;
    textShadow: "0 0 6px rgba(255,255,255,0.45)",  `;

  if (streakPopupTimeout) clearTimeout(streakPopupTimeout);

  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(console.warn);
  }

  streakPopupTimeout = setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translateY(-65%) scale(1.8)";
  }, 1000);
}

const validNames = profiles.filter(p => !p.isSTD).map(p => p.name);
let chosenTargets = [];
try {
  const t = JSON.parse(sessionStorage.getItem("chosenTargets") || "[]");
  if (Array.isArray(t)) {
    chosenTargets = [...new Set(t)].filter(n => validNames.includes(n)).slice(0, 3);
  }
} catch {}

const scoreDisplay = document.getElementById("score");
const leftDiv = document.getElementById("left-slot");
const rightDiv = document.getElementById("right-slot");
const slots = {
  left:  { div: leftDiv,  profile: null },
  right: { div: rightDiv, profile: null }
};
const clapBtn = document.getElementById("clap-btn");
const revealBtn = document.getElementById("reveal-btn");
const revealCountDisplay = document.getElementById("reveal-count");
const popup = document.getElementById("achievement-popup");

const clapSound = document.getElementById("clap-sound");
const alertSound = document.getElementById("alert-sound");
const achievementSound = document.getElementById("achievement-sound");
const clickSound = document.getElementById("button-click");
const revealClickSound = document.getElementById("reveal-click");

document.getElementById("targets-display").textContent =
  chosenTargets.join(", ");

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

function shakeScreen(isHeavy) {
  const body = document.body;
  const shakeClass = isHeavy
    ? "screen-shake-heavy"
    : "screen-shake-light";

  body.classList.remove(
    "screen-shake-light",
    "screen-shake-heavy"
  );

  body.classList.add(shakeClass);

  setTimeout(() => {
    body.classList.remove(shakeClass);
  }, 200);
}

// ===== Protection (shop item): negates one game over, then is used up =====
const PROTECTION_KEY = "protectionEquipped";

function showProtectionVignette() {
  const v = document.createElement("div");
  v.className = "protection-vignette";
  document.body.appendChild(v);
  void v.offsetWidth;                       // flush so the fade-in runs
  v.classList.add("active");
  setTimeout(() => v.classList.remove("active"), 450);
  setTimeout(() => v.remove(), 1200);
}

// Returns true if a Protection was equipped (and has now been spent).
function consumeProtection() {
  if (localStorage.getItem(PROTECTION_KEY) !== "true") return false;
  localStorage.removeItem(PROTECTION_KEY);

  const pop = new Audio(SFX + "cpop.mp3");
  pop.play().catch(() => {});
  showProtectionVignette();
  shakeScreen(false);                       // light shake
  return true;
}

function playDeathSound() {
  const path = deathSounds[currentChar] || defaultDeathSound;
  const deathAudio = new Audio(path);

  deathAudio.volume = 0.8;
  deathAudio.play().catch(() => {});

  return deathAudio;
}

function getProfile(slot) {
  return slots[slot].profile;
}

function getDiv(slot) {
  return slots[slot].div;
}

function activeSlots() {
  return Object.keys(slots);
}

function highlightSlot(slot) {
  activeSlots().forEach(name => {
    slots[name].div.classList.toggle("selected", name === slot);
  });
}

function selectSlot(e, slot) {
  if (!e.isTrusted || runEnded) return;
  playSound(clickSound);

  selectedSlot = slot;
  clapBtn.disabled = false;

  highlightSlot(slot);
  updateRevealCount();
  hook("onSelect", slot);
}

function updateRevealCount() {
  revealCountDisplay.textContent = `Reveals left: ${revealUses}`;
  revealBtn.disabled = revealUses <= 0 || !selectedSlot;
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;

  const currentHigh = localStorage.getItem("highScore") || 0;

  if (score > currentHigh) {
    localStorage.setItem("highScore", score);
  }

  if (hardModeActive && score >= 100) {
    unlockAchievement("horrorMovie");
  }
}

function unlockAchievement(id) {
  if (achievements[id]) return;

  achievements[id] = "new";

  localStorage.setItem(
    "achievements",
    JSON.stringify(achievements)
  );

  popup.innerHTML =
    `<strong>🎉 ${achievementList[id].name}</strong><br>` +
    `${achievementList[id].description}`;

  popup.classList.add("show");

  playSound(achievementSound);

  setTimeout(() => popup.classList.remove("show"), 4000);
}

// Shows a card face: image cards (like Zhiynl's ammo) get an <img>, everything else gets text
function showCard(div, profile) {
  if (profile.image) {
    div.textContent = "";
    const img = document.createElement("img");
    img.src = profile.image;
    img.alt = profile.name;
    img.className = "card-image";
    div.appendChild(img);
  } else {
    div.textContent = profile.name;
  }
}

function getRandomProfile(allowSpecial = true) {
  let stdChance = hardModeActive ? 0.4 : 0.10;
  const adjustedStd = hook("adjustSTDChance", stdChance);   // passives can raise/lower Lucy/Sans odds
  if (Number.isFinite(adjustedStd)) stdChance = Math.max(0, Math.min(1, adjustedStd));

  if (Math.random() < stdChance) {
    return Math.random() < 0.5
      ? { name: "Lucy", isSTD: true }
      : { name: "Sans", isSTD: true };
  }

  if (allowSpecial) {
    if (Math.random() < REVEAL_PLUS_CHANCE) {
      return { name: "Reveal++", isSTD: false, special: true, isRevealPlus: true };
    }

    // Passives can slip in their own special cards (e.g. Zhiynl's ammo)
    const special = hook("rollSpecialCard");
    if (special) return special;
  }

  // Passives can nudge normal cards toward the player's chosen targets (fine shyts)
  const targetBoost = hook("targetSpawnBoost");
  if (Number.isFinite(targetBoost) && targetBoost > 0 && chosenTargets.length && Math.random() < targetBoost) {
    const name = chosenTargets[Math.floor(Math.random() * chosenTargets.length)];
    const target = profiles.find(p => p.name === name);
    if (target) return target;
  }

  const pool = profiles.filter(p => !p.isSTD);
  return pool[Math.floor(Math.random() * pool.length)];
}

function resetRound() {
  do {
    let specialUsed = false;   // special cards (ammo) can only show up in one slot per round
    activeSlots().forEach(name => {
      const p = getRandomProfile(!specialUsed);
      if (p.special) specialUsed = true;
      slots[name].profile = p;
    });
  } while (slots.left.profile.isSTD && slots.right.profile.isSTD);

  activeSlots().forEach(name => {
    slots[name].div.textContent = "🗣❓";
  });

  selectedSlot = null;
  clapBtn.disabled = true;
  hasClapped = false;

  highlightSlot(null);
  updateRevealCount();
  hook("onRoundStart");
}

// force = true skips Protection (used by Forfeit, which is a deliberate quit)
function gameOver(force = false) {
  if (runEnded) return;
  if (!force && consumeProtection()) return;
  runEnded = true;
  stopTimer();

  const shopMult  = window.shopAPI ? shopAPI.getMultiplier() : 1;
  const timerMult = getTimerMultiplier();
  // coins = score x timer multiplier x shop multiplier (the grant applies the shop multiplier itself)
  const coinsEarned = grant ? grant.add(Math.floor(score * timerMult)) : 0;
  const mult = Math.round(shopMult * timerMult * 100) / 100;   // combined, so score x mult ~ coins on the game over screen

  const redirectNow = () => {
    sessionStorage.setItem("lastScore", score);
    sessionStorage.setItem("lastCoins", coinsEarned);
    sessionStorage.setItem("lastMult", mult);
    sessionStorage.setItem("lastShopMult", shopMult);
    sessionStorage.setItem("lastTimerMult", timerMult);
    sessionStorage.setItem("lastTime", Math.floor(timerSeconds));
    sessionStorage.setItem("lastRecord", score > highAtStart ? "1" : "0");

    setTimeout(() => {
      window.location.href = "gameover.html";
    }, 600);
  };

  const deathPath = deathSounds[currentChar];

  if (deathPath) {
    const deathAudio = new Audio(deathPath);
    deathAudio.volume = 0.8;
    deathAudio.play().catch(() => {});

    deathAudio.addEventListener("ended", redirectNow);
    setTimeout(redirectNow, 1500);
  } else {
    try {
      alertSound.play();
    } catch {}

    redirectNow();
  }
}

const timerDisplay = document.getElementById("timer-display");
const timerMultDisplay = document.getElementById("timer-mult");

let timerSeconds = 0;            // seconds on the timer: runs at the passive's speed, plus bonuses
let lastTick = performance.now();
let timerFxActive = false;       // Sai's fast-forward animation owns the clock text while true
let timerInterval = setInterval(tickTimer, TIMER_TICK_MS);

// passives can speed the timer up (Sai, Kai)
function getTimeSpeed() {
  const speed = hook("adjustTimeSpeed", 1);
  return Number.isFinite(speed) && speed > 0 ? speed : 1;
}

function getTimerMultiplier(seconds = timerSeconds) {
  const raw = 1 + seconds / TIMER_MULT_SECONDS_PER_STEP;
  return Math.min(TIMER_MULT_MAX, Math.floor(raw * 100) / 100);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimer() {
  if (timerMultDisplay) timerMultDisplay.textContent = `TIME x${getTimerMultiplier().toFixed(2)}`;
  if (timerFxActive) return;
  timerDisplay.textContent = formatTime(Math.floor(timerSeconds));
}

function tickTimer() {
  const now = performance.now();
  const dt = Math.min((now - lastTick) / 1000, 1);   // a throttled background tab can't bank extra time
  lastTick = now;
  if (runEnded) return;
  timerSeconds += dt * getTimeSpeed();
  updateTimer();
}

function addTime(seconds) {
  if (runEnded || !Number.isFinite(seconds) || seconds <= 0) return;
  timerSeconds += seconds;
  updateTimer();
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Sai's Glance: the stopwatch jumps ahead 5-25s (real time, so it counts toward the multiplier)
function landStopwatchRandomly() {
  addTime(Math.floor(Math.random() * 21) + 5);
}

window.addEventListener("DOMContentLoaded", () => {
  const forfeitBtn = document.getElementById("forfeit-btn");
  const clickSfx = document.getElementById("click-sfx");

  if (!forfeitBtn) return;

  forfeitBtn.addEventListener("click", () => {
    if (clickSfx) {
      clickSfx.currentTime = 0;
      clickSfx.play().catch(() => {});
    }

    if (typeof gameOver === "function") {
      gameOver(true);
    } else {
      window.location.href = "gameover.html";
    }
  });
});

document.getElementById("choose-left").addEventListener("click", (e) => selectSlot(e, "left"));
document.getElementById("choose-right").addEventListener("click", (e) => selectSlot(e, "right"));

let revealedSlots = {};
let revealedAs = {};   // slot -> name of the card the player actually saw when revealing it

revealBtn.addEventListener("click", (e) => {
  if (!e.isTrusted || runEnded) return;
  if (!selectedSlot || revealUses <= 0) return;
  if (revealedSlots[selectedSlot]) return;

  playSound(revealClickSound);
  addTime(REVEAL_TIME_BONUS);   // every reveal (including Sai's Glance) adds time
  if (hook("onReveal", selectedSlot)) return;

  const chosen = getProfile(selectedSlot);
  hook("beforeReveal", selectedSlot, chosen);

  showCard(getDiv(selectedSlot), chosen);

  revealUses--;
  revealedSlots[selectedSlot] = true;
  revealedAs[selectedSlot] = chosen.name;

  updateRevealCount();
});

let stopwatchFastAnim = null;

// purely visual: the clock text spins up for a moment, then snaps back to the real time
function animateStopwatchFast(duration = 1000, speed = 50) {
  if (!timerDisplay) return;
  if (stopwatchFastAnim) clearInterval(stopwatchFastAnim);

  timerFxActive = true;
  let fakeSeconds = 0;

  stopwatchFastAnim = setInterval(() => {
    fakeSeconds += speed;
    timerDisplay.textContent = formatTime(Math.floor(fakeSeconds));
  }, 50);

  setTimeout(() => {
    clearInterval(stopwatchFastAnim);
    stopwatchFastAnim = null;
    timerFxActive = false;
    updateTimer();
  }, duration);
}

clapBtn.addEventListener("click", (e) => {
  if (!e.isTrusted || runEnded || hasClapped || !selectedSlot) return;

  hasClapped = true;
  hook("onClapStart");
  playSound(clapSound);

  const clappedSlot = selectedSlot;
  const chosen = getProfile(clappedSlot);
  const chosenDiv = getDiv(clappedSlot);

  const isTarget = chosenTargets.includes(chosen.name);
  shakeScreen(isTarget);

  // did the player already see this exact card before clapping it?
  const sawCardFirst = revealedAs[clappedSlot] === chosen.name;

  showCard(chosenDiv, chosen);

  if (
    (chosen.name === "Lucy" || chosen.name === "Sans") &&
    score === 0
  ) {
    unlockAchievement(
      chosen.name === "Lucy"
        ? "clappedLucyZero"
        : "clappedSansZero"
    );
  }

  const c = { slot: clappedSlot, profile: chosen, isTarget };

  // Special cards (ammo, Reveal++ etc): no score, no streak, just their own effect
  if (chosen.special) {
    if (chosen.isRevealPlus) {
      let gain = REVEAL_PLUS_GAIN;
      const adjustedGain = hook("adjustRevealGain", c, gain);
      if (Number.isFinite(adjustedGain)) gain = adjustedGain;
      g.addReveals(gain);
    }

    hook("onSpecialClap", c);
    finishRound(clappedSlot);
    return;
  }

  if (chosen.isSTD) {
    const verdict = hook("onSTDClap", c);

    if (verdict === "absorb") {          
      finishRound(clappedSlot);
      return;
    }

    if (verdict !== "survive") {
      // Protection eats the hit before any death side effects (achievements, bad ending)
      if (consumeProtection()) {
        finishRound(clappedSlot);
        return;
      }

      if (sawCardFirst && (chosen.name === "Lucy" || chosen.name === "Sans")) {
        unlockAchievement("tunnelVision");
      }

      if (
        (chosen.name === "Lucy" || chosen.name === "Sans") &&
        score === 0
      ) {
        sessionStorage.setItem("badEnding", "true");
      } else {
        sessionStorage.removeItem("badEnding");
      }

      gameOver();
      return;
    }
  }

  if (streakSide === clappedSlot || streakSide === ANY_LANE) {
    streakCount++;
    streakSide = clappedSlot;
  } else {
    streakSide = clappedSlot;
    streakCount = 1;
    streakBoosted = false;
  }

  refreshStreakTimeout();

  if (streakCount >= 20 && !streakBoosted) unlockAchievement("momentum");

  let basePoints = isTarget ? 2 : 1;
  const adjusted = hook("adjustPoints", c, basePoints);
  if (Number.isFinite(adjusted)) basePoints = adjusted;

  const streakMultiplier = currentStreakMultiplier(streakCount, c);
  score += basePoints * streakMultiplier;

  hook("afterClap", c);

  if (getStreakTiers().some(([need]) => need === streakCount)) {
    showStreakPopup(streakCount, streakMultiplier);
  }

  updateScore();

  clapCounts[chosen.name] = (clapCounts[chosen.name] || 0) + 1;

  if (clapCounts[chosen.name] >= 10) {
    const achievementId =
      "clapped" +
      chosen.name.replace(/[^a-zA-Z0-9]/g, "");

    if (achievementList[achievementId]) {
      unlockAchievement(achievementId);
    }
  }

  finishRound(clappedSlot);
});

function finishRound(clappedSlot) {
  setTimeout(() => {
    activeSlots()
      .filter(slot => slot !== clappedSlot)
      .forEach(slot => {
        const div = getDiv(slot);
        showCard(div, getProfile(slot));
        div.style.opacity = 0.5;
      });
  });

  setTimeout(() => {
    resetRound();

    revealedSlots = {
      left: false,
      right: false,
      third: false
    };
    revealedAs = {};

    activeSlots().forEach(slot => {
      getDiv(slot).style.opacity = 1;
    });
  }, 600);
}

// Face of a slot: the card if the player has revealed it, otherwise the hidden card
function refreshFace(slot) {
  if (revealedSlots[slot]) showCard(slots[slot].div, slots[slot].profile);
  else slots[slot].div.textContent = "🗣❓";
}

const SWAP_ANIM_MS = 280;

// Quick visual: the two cards slide across to each other's lane in opposite arcs
function animateSwap(a, b) {
  const da = slots[a].div, db = slots[b].div;
  if (typeof da.animate !== "function") return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ra = da.getBoundingClientRect(), rb = db.getBoundingClientRect();
  const dx = rb.left - ra.left, dy = rb.top - ra.top;
  const opts = { duration: SWAP_ANIM_MS, easing: "cubic-bezier(.3,.7,.3,1)" };

  // each div's NEW content starts where it just came from, then glides home
  const arc = (fromX, fromY, lift) => [
    { transform: `translate(${fromX}px, ${fromY}px) scale(1)` },
    { transform: `translate(${fromX / 2}px, ${fromY / 2 + lift}px) scale(1.08)`, offset: 0.5 },
    { transform: "translate(0, 0) scale(1)" }
  ];

  da.style.zIndex = 2; db.style.zIndex = 1;
  da.animate(arc(dx, dy, -18), opts);
  db.animate(arc(-dx, -dy, 18), opts).finished
    ?.then(() => { da.style.zIndex = ""; db.style.zIndex = ""; })
    .catch(() => { da.style.zIndex = ""; db.style.zIndex = ""; });
}

// Swap two lanes: the cards AND what the player knows about them (revealed state)
// travel together. The player's selected LANE stays selected (it doesn't follow the card).
function swapSlots(a, b) {
  if (!slots[a] || !slots[b] || a === b) return;
  animateSwap(a, b);

  [slots[a].profile, slots[b].profile] = [slots[b].profile, slots[a].profile];

  const revA = !!revealedSlots[a], revB = !!revealedSlots[b];
  revealedSlots[a] = revB;
  revealedSlots[b] = revA;

  const asA = revealedAs[a], asB = revealedAs[b];
  delete revealedAs[a];
  delete revealedAs[b];
  if (asB !== undefined) revealedAs[a] = asB;
  if (asA !== undefined) revealedAs[b] = asA;

  refreshFace(a);
  refreshFace(b);

  highlightSlot(selectedSlot);
  updateRevealCount();
}

const passive = characterPassives[currentChar] || {};

function hook(name, ...args) {
  return passive[name] ? passive[name](g, ...args) : undefined;
}

const g = {
  profiles,
  chosenTargets,
  slots,
  revealBtn,

  selectSlot,
  swapSlots,
  getSelected()   { return selectedSlot; },
  isRoundLocked() { return runEnded || hasClapped; },
  isRunEnded()    { return runEnded; },
  addSlot(name, div) { slots[name] = { div, profile: null }; },
  setProfile(name, profile) { slots[name].profile = profile; },
  markRevealed(...names) { names.forEach(n => { revealedSlots[n] = true; }); },

  addScore(n) {
    score = Math.max(0, score + n);
    updateScore();
  },
  addReveals(n) {
    revealUses = Math.max(0, revealUses + n);
    updateRevealCount();
  },
  multiplyReveals(k) {
    maxReveals *= k;
    revealUses = maxReveals;
    updateRevealCount();
  },

  animateStopwatchFast,
  landStopwatchRandomly,
  addTime,
  getStreak() { return streakCount; },
  setStreakToMax,
  shake: shakeScreen,
  gameOver
};

hook("onInit");

updateScore();
resetRound();

})();