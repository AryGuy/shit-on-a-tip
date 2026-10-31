/* =====================================================================
   shop.js
   Sections:
     1. Config
     2. Helpers (DOM, storage, audio, achievements, pricing, fades)
     3. Dialogue (typewriter, sprite, conversation menu)
     4. Music & mute
     5. Button sound effects
     6. Shop UI (notebook, tabs)
     7. Purchasing
     8. Effects (money, boombox easter egg)
     9. Init
   ===================================================================== */

/* ======================= 1. Config ======================= */

const SPRITE_COUNT     = 5;
const TYPEWRITER_DELAY = 25;
const BOOMBOX_CHANCE   = 0.2;
const CHARACTER_PRICE_NORMAL   = 500;
const CHARACTER_PRICE_INFLATED = 1500;
const HARD_MODE_PRICE_NORMAL   = 200;
const HARD_MODE_PRICE_INFLATED = 1000;
const PROTECTION_PRICE_NORMAL   = 300;
const PROTECTION_PRICE_INFLATED = 600;

const NOTICE_IMMEDIATELY = false;

const SHOP_TRACKS  = [
  'assets/songs/shop-theme.mp3',
  'assets/songs/StoreDay2.mp3',
  'assets/songs/StoreDay3.mp3',
  'assets/songs/StoreDay4.mp3',
];
const TAMPER_TRACK = 'assets/songs/Agartha.mp3';
const EURO_TRACKS  = [
  'assets/songs/TickKissMe.mp3',
  'assets/songs/LuckyTwiceLucky.mp3',
  'assets/songs/VRIL.mp3',
  'assets/songs/OnTheFloor.mp3',
  'assets/songs/HowDoYouDo.mp3',
  'assets/songs/idk.mp3',
  'assets/songs/AllTheThings.mp3',
];

const DEFAULT_BEAT = { bpm: 150, offset: 0 };
const EURO_BEATS = {
  'assets/songs/TickKissMe.mp3':      { bpm: 121, offset: 0 },
  'assets/songs/LuckyTwiceLucky.mp3': { bpm: 160, offset: 0 },
  'assets/songs/VRIL.mp3':            { bpm: 138, offset: 0 },
  'assets/songs/OnTheFloor.mp3':      { bpm: 116, offset: 0 },
  'assets/songs/HowDoYouDo.mp3':      { bpm: 150, offset: 0 },
  'assets/songs/idk.mp3':             { bpm: 150, offset: 0 },
  'assets/songs/AllTheThings.mp3':    { bpm: 113, offset: 0 },
};

// type: "item" | "upgrade" | "character" | "misc"
// (character cost is overridden by getItemCost(), see Helpers)
const ITEMS = {
  "Packaged Air":           { cost: 1,    type: "item" },
  "Tax Evasion":            { cost: 100,  type: "upgrade", key: "upgrade_TaxEvasion",   line: "ONE MUST IMAGINE TAX EVASION AS THE STARTING STEPS TO OVERTHROWING CAPITALISM" },
  "Money Printing Machine": { cost: 200,  type: "upgrade", key: "upgrade_MoneyMachine", line: "MONEY IS A SUPERFICIAL MAN-MADE CONCEPT" },
  "Kill The Government":    { cost: 1000, type: "upgrade", key: "upgrade_KillGov",      line: "QUICK HIDE THE BODY" },
  "Andy":                   { cost: 500,  type: "character" },
  "Sai":                    { cost: 500,  type: "character" },
  "Kj":                     { cost: 500,  type: "character" },
  "Win":                    { cost: 500,  type: "character" },
  "Dennis":                 { cost: 500,  type: "character" },
  "Kai":                 { cost: 500,  type: "character" },
  "Hard Mode":              { cost: 200,  type: "misc", key: "hardModeBought", line: "Well Good Fucking Luck" },
  "Golden Ticket":          { cost: 2500, type: "misc", key: "goldenTicketBought", line: "TIKY" },
  // One-use: stays "Equipped" until the game spends it, then it can be bought again.
  "Protection":             { cost: PROTECTION_PRICE_NORMAL, type: "misc", key: "protectionEquipped", ownedLabel: "✅ Equipped", line: "HAVE A GREAT NIGHT" },
};

const OWNED_LABEL = {
  upgrade:   "✅ Activated",
  character: "✅ Unlocked",
  misc:      "✅ Purchased",
};

const SPRITE_INSULTS = [
  "SCHLAWG",
  "I FEEL LIKE NAPOLEON",
  "BRO",
  "Stop.",
  "IF THIS GAME BREAKS YOU'RE RESPONSIBLE FOR IT",
];

const CHARACTER_PURCHASE_LINES = [
  "I do not support human trafficking.",
  "COME AGAIN RAHAHAH",
  "OFFICER I SWEAR, HE JUST ENDED UP THERE",
];

const BROKE_SEQUENCE = ["YOU", "ARE", "FUCKING", "BBBBBRRRRRRRRRRRRRRRRROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"];

const BROKE_FOLLOWUPS = [
  "boohoo check yo wallet next time dog",
  "HOP OFF SBG AND GO GET A JOB",
  "BROKE BROKE BR",
  "STRIP CLUB DOWN THE STRIP IS LOOKING FOR POLE DANCERS",
];


/* ======================= 2. Helpers ======================= */

const $ = (id) => document.getElementById(id);
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const store = {
  getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  isTrue(key) {
    return localStorage.getItem(key) === "true";
  },
};

function playSfx(target) {
  const el = typeof target === "string" ? $(target) : target;
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

function playOneShot(src) {
  new Audio(src).play().catch(() => {});
}

function unlockAchievement(key, title) {
  const achievements = store.getJSON("achievements", {});
  if (achievements[key]) return;

  achievements[key] = "true";
  store.setJSON("achievements", achievements);

  const popup = $("achievement-popup");
  if (popup) {
    popup.innerHTML = `🏆 Achievement Unlocked: ${title}`;
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 4000);
  }
  playSfx("achievement-sfx");
}

/* ---- Pricing / price notice ---- */

function hasPreIndividuals() {
  return !!store.getJSON("achievements", {}).preIndividuals;
}

function priceNoticeSeen() {
  return store.isTrue("priceNoticeSeen");
}

// Pre-Individuals unlocked, but the cutscene hasn't played yet.
function isPriceNoticePending() {
  return hasPreIndividuals() && !priceNoticeSeen();
}

// Items affected by the price notice.
function isPriceHiked(itemId, item) {
  return item.type === "character" || itemId === "Hard Mode" || itemId === "Protection";
}

function getItemCost(itemId, item) {
  if (item.type === "character") {
    return priceNoticeSeen() ? CHARACTER_PRICE_INFLATED : CHARACTER_PRICE_NORMAL;
  }
  if (itemId === "Hard Mode") {
    return priceNoticeSeen() ? HARD_MODE_PRICE_INFLATED : HARD_MODE_PRICE_NORMAL;
  }
  if (itemId === "Protection") {
    return priceNoticeSeen() ? PROTECTION_PRICE_INFLATED : PROTECTION_PRICE_NORMAL;
  }
  return item.cost;
}

function checkPreIndividualsAchievement() {
  const unlocked = store.getJSON("unlockedCharacters", []);
  if (unlocked.length >= 3) unlockAchievement("preIndividuals", "Pre-Individuals");
  refreshPrices();

  if (NOTICE_IMMEDIATELY && isPriceNoticePending()) {
    setTimeout(() => fadeTo("pricenotice.html"), 3000);
  }
}

function checkBoomboxAchievement() {
  unlockAchievement("boomboxEasterEgg", "#SAVEEUROPE");
}

/* ---- Screen fades ---- */

let leaving = false;

function fadeTo(url, ms = 800) {
  if (leaving) return;
  leaving = true;

  const veil = document.createElement("div");
  Object.assign(veil.style, {
    position: "fixed", inset: "0", background: "#000", opacity: "0",
    transition: `opacity ${ms}ms ease`, zIndex: "99999",
  });
  document.body.appendChild(veil);
  void veil.offsetWidth; // flush so the transition actually runs
  veil.style.opacity = "1";

  setTimeout(() => { window.location.href = url; }, ms);
}

function fadeInFromBlack(ms = 800) {
  const veil = document.createElement("div");
  Object.assign(veil.style, {
    position: "fixed", inset: "0", background: "#000", opacity: "1",
    transition: `opacity ${ms}ms ease`, zIndex: "99999", pointerEvents: "none",
  });
  document.body.appendChild(veil);
  requestAnimationFrame(() => { veil.style.opacity = "0"; });
  setTimeout(() => veil.remove(), ms + 50);
}


/* ======================= 3. Dialogue ======================= */

const dialogueEl = $("zhiynl-dialogue");
const sprite     = $("zhiynl-sprite");
const talkBtn    = $("talk-btn");
const convoBox   = $("conversation-box");

let typeWriterInterval;

function typeWriterEffect(text, element, delay = TYPEWRITER_DELAY, callback) {
  clearInterval(typeWriterInterval);
  let i = 0;
  element.textContent = "";
  typeWriterInterval = setInterval(() => {
    element.textContent += text[i] || "";
    i++;
    if (i >= text.length) {
      clearInterval(typeWriterInterval);
      if (callback) callback();
    }
  }, delay);
}

function typeLines(lines, element, { gap = 600, finalGap = gap, onDone } = {}) {
  let i = 0;
  const next = () => {
    if (i >= lines.length) {
      if (onDone) onDone();
      return;
    }
    typeWriterEffect(lines[i], element, TYPEWRITER_DELAY, () => {
      i++;
      setTimeout(next, i >= lines.length ? finalGap : gap);
    });
  };
  next();
}

function setRandomSprite() {
  if (!sprite) return;
  const n = Math.floor(Math.random() * SPRITE_COUNT) + 1;
  sprite.src = `assets/zhiynl-neutral${n}.png`;
}

sprite.addEventListener("click", () => {
  dialogueEl.textContent = pickRandom(SPRITE_INSULTS);
  sprite.classList.add("squish");
  setTimeout(() => sprite.classList.remove("squish"), 150);
  playSfx("insult-sfx");
});

talkBtn.addEventListener("click", () => {
  const isOpen = getComputedStyle(convoBox).display !== "none";
  convoBox.style.display = isOpen ? "none" : "block";
});

/* ---- Backyard intro: shop music dies, DontStop.m4a slowly fades in, Zhiynl walks off ---- */

const CARAVAN_VOL      = 0.35;  // matches MUSIC_VOL in dogkilling.html
const SHOP_FADE_OUT_MS = 1200;
const CARAVAN_FADE_MS  = 6000;
let caravanMusic = null;

function fadeVolume(audio, to, ms, onDone) {
  const from = audio.volume;
  const t0 = performance.now();
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(tick);
    else if (onDone) onDone();
  };
  requestAnimationFrame(tick);
}

function startCaravanCrossfade() {
  if (caravanMusic) return;

  // stop whatever is playing in the shop
  [shopMusic, window.euroMusic, $("boombox-music")].forEach((a) => {
    if (a && !a.paused) fadeVolume(a, 0, SHOP_FADE_OUT_MS, () => a.pause());
  });

  caravanMusic = new Audio("assets/songs/DontStop.m4a");
  caravanMusic.loop = true;
  caravanMusic.volume = 0;
  caravanMusic.muted = musicMuted;
  caravanMusic.play().then(() => {
    fadeVolume(caravanMusic, CARAVAN_VOL, CARAVAN_FADE_MS);
  }).catch(() => {});
}

function backyardWalkOff(url) {
  typeWriterEffect("U WAIT OUTSIDE TILL IM DONE KAI", dialogueEl);

  const dist = window.innerWidth + sprite.offsetWidth;
  const walk = sprite.animate(
    [{ translate: "0 0" }, { translate: `${dist}px 0` }],
    { duration: 2800, easing: "ease-in", fill: "forwards" }
  );
  sprite.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-12px)" }, { transform: "translateY(0)" }],
    { duration: 420, iterations: 7 }
  );

  walk.onfinish = () => {
    // let the level pick the song up where it is
    if (caravanMusic) sessionStorage.setItem("caravanResume", String(caravanMusic.currentTime));
    setTimeout(() => fadeTo(url), 500);
  };
}

document.querySelectorAll(".dialogue-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    const replies = btn.dataset.replies
      ? JSON.parse(btn.dataset.replies)
      : [btn.dataset.reply];

    convoBox.style.display = "none";
    const isBackyard = btn.id === "zhiynl-secret";
    if (isBackyard) startCaravanCrossfade();
    typeLines(replies, dialogueEl, {
      gap: 600,
      finalGap: 1000,
      onDone: () => {
        if (isBackyard) { backyardWalkOff(btn.dataset.goto); return; }
        if (btn.dataset.goto) { fadeTo(btn.dataset.goto); return; }
        convoBox.style.display = "block";
      },
    });
  });
});


/** Secret Zhiynl option: Golden Ticket + Pre-Individuals + playing as Kai, and not unlocked yet. */
function updateSecretOption() {
  const btn = $("zhiynl-secret");
  if (!btn) return;
  const show =
    store.isTrue("goldenTicketBought") &&
    hasPreIndividuals() &&
    sessionStorage.getItem("playerCharacter") === "Kai" &&
    !store.getJSON("unlockedCharacters", []).includes("Zhiynl");
  btn.style.display = show ? "" : "none";
}


/* ======================= 4. Music & mute ======================= */

const shopMusic  = $("shop-music");
const muteBtn    = $("mute-btn");
const fromTamper = sessionStorage.getItem("completedTamper") === "true";

let musicMuted = store.getJSON("musicMuted", false);

shopMusic.src = fromTamper ? TAMPER_TRACK : pickRandom(SHOP_TRACKS);
shopMusic.muted = musicMuted;
shopMusic.play().catch(() => {
  const clickToPlay = () => {
    shopMusic.play().catch((err) => console.warn("Audio still blocked:", err));
    document.removeEventListener("click", clickToPlay);
  };
  document.addEventListener("click", clickToPlay);
});

function renderMuteButton() {
  muteBtn.textContent = musicMuted ? "🔇" : "🔊";
}
renderMuteButton();

muteBtn.addEventListener("click", () => {
  musicMuted = !musicMuted;
  shopMusic.muted = musicMuted;
  if (window.euroMusic) window.euroMusic.muted = musicMuted;
  store.setJSON("musicMuted", musicMuted);
  renderMuteButton();
});

$("exit-btn").addEventListener("click", () => {
  window.location.href = "index.html";
});


/* ======================= 5. Button sound effects ======================= */

function attachButtonSFX(button) {
  if (button.hasAttribute("data-sfx")) return; // already wired
  button.addEventListener("pointerenter", () => playSfx("hover-sfx"));
  button.addEventListener("click",        () => playSfx("click-sfx"));
  button.setAttribute("data-sfx", "true");
}

document.querySelectorAll("button").forEach(attachButtonSFX);

new MutationObserver((mutations) => {
  for (const { addedNodes } of mutations) {
    addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches("button")) attachButtonSFX(node);
      node.querySelectorAll("button").forEach(attachButtonSFX);
    });
  }
}).observe(document.body, { childList: true, subtree: true });


/* ======================= 6. Shop UI ======================= */

const shopNotebook = $("shop-notebook");
shopNotebook.style.display = "none";

$("buy-btn").addEventListener("click", () => {
  const isVisible = shopNotebook.style.display !== "none";
  shopNotebook.style.display = isVisible ? "none" : "block";
});

const tabButtons   = document.querySelectorAll(".tab-btn");
const shopSections = document.querySelectorAll(".shop-section");

function activateTab(btn) {
  const section = $("tab-" + btn.dataset.tab);
  tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
  shopSections.forEach((s) => s.classList.toggle("active", s === section));
}

tabButtons.forEach((btn) => btn.addEventListener("click", () => activateTab(btn)));
if (tabButtons.length > 0) activateTab(tabButtons[0]);


/* ======================= 7. Purchasing ======================= */

function findBuyButton(itemId) {
  return (
    document.querySelector(`.buy-item[data-id="${itemId}"]`) ||
    Array.from(document.querySelectorAll(".buy-item"))
      .find((b) => b.textContent.startsWith(itemId))
  );
}

function markOwned(button, itemId, type) {
  if (!button) return;
  button.disabled = true;
  const label = (ITEMS[itemId] && ITEMS[itemId].ownedLabel) || OWNED_LABEL[type];
  button.textContent = `${itemId} - ${label}`;
  button.style.opacity = "0.5";
  button.style.cursor = "not-allowed";
}

function isOwned(itemId, item) {
  if (item.type === "character") {
    return store.getJSON("unlockedCharacters", []).includes(itemId);
  }
  if (item.key) return store.isTrue(item.key);
  return false; // plain consumables are never "owned"
}

/** Sync unowned hiked buttons (characters + Hard Mode + Protection): label + data-cost = current price. */
function refreshPrices() {
  document.querySelectorAll(".buy-item").forEach((btn) => {
    const itemId = btn.dataset.id;
    const item = ITEMS[itemId];
    if (!item || !isPriceHiked(itemId, item)) return;
    if (isOwned(itemId, item)) return; // leave owned buttons alone
    const cost = getItemCost(itemId, item);
    btn.dataset.cost = cost;
    btn.textContent = `${itemId} - ${cost} coins`;
  });
}

document.querySelectorAll(".buy-item").forEach((button) => {
  button.addEventListener("click", guardedBuy);
});

function guardedBuy(ev) {
  if (!ev.isTrusted) return;

  const button = ev.currentTarget;
  const itemId = (button.dataset.id || button.textContent.split(" - ")[0]).trim();
  const item = ITEMS[itemId];
  if (!item) return;

  // Price change is queued but the cutscene hasn't played yet:
  // block the purchase and send them to the notice instead.
  if (isPriceHiked(itemId, item) && isPriceNoticePending()) {
    fadeTo("pricenotice.html");
    return;
  }

  const cost = getItemCost(itemId, item);

  const domCost = parseInt(button.dataset.cost || "0", 10);
  if (domCost !== cost) { flashTamperUI(button); return; }

  if (!window.shopAPI || typeof window.shopAPI.spendCoins !== "function") return;
  if (!window.shopAPI.spendCoins(cost)) { handleInsufficientFunds(); return; }

  handlePurchaseSuccess(itemId, item);
}

function flashTamperUI(button) {
  button.classList.add("tamper-flag");
  setTimeout(() => button.classList.remove("tamper-flag"), 1200);
  window.location.href = "tamper.html";
}

function handleInsufficientFunds() {
  const shopContainer = $("shop-container");
  shopContainer.classList.add("shake");
  setTimeout(() => shopContainer.classList.remove("shake"), 400);

  const sfx = $("insufficient-sfx");
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch((err) => console.warn("Audio blocked:", err));
  }

  typeLines(BROKE_SEQUENCE, dialogueEl, {
    gap: 500,
    onDone: () => {
      setTimeout(() => {
        typeWriterEffect(pickRandom(BROKE_FOLLOWUPS), dialogueEl, TYPEWRITER_DELAY);
      }, 1000);
    },
  });
}

function handlePurchaseSuccess(itemId, item) {
  const button = findBuyButton(itemId);

  switch (item.type) {
    case "upgrade":
    case "misc":
      localStorage.setItem(item.key, "true");
      markOwned(button, itemId, item.type);
      playOneShot("assets/chaching.mp3");
      typeWriterEffect(item.line || `${itemId} bought boy`, dialogueEl, TYPEWRITER_DELAY);
      spawnMoneyFx();
      updateSecretOption();
      break;

    case "character": {
      const unlocked = store.getJSON("unlockedCharacters", []);
      if (!unlocked.includes(itemId)) {
        unlocked.push(itemId);
        store.setJSON("unlockedCharacters", unlocked);
      }
      markOwned(button, itemId, "character");
      checkPreIndividualsAchievement();
      playSfx("purchase-sfx");
      spawnMoneyFx();
      typeWriterEffect(pickRandom(CHARACTER_PURCHASE_LINES), dialogueEl, TYPEWRITER_DELAY);
      break;
    }

    default: // plain items (e.g. Packaged Air)
      if (!button) return;
      playOneShot("assets/chaching.mp3");
      typeWriterEffect(`Thanks for buy ${itemId} boy.`, dialogueEl, TYPEWRITER_DELAY);
      spawnMoneyFx();
  }
}

/** Re-apply "owned" state to buttons on page load. */
function restorePurchasedItems() {
  Object.entries(ITEMS).forEach(([itemId, item]) => {
    if (!OWNED_LABEL[item.type]) return;
    if (isOwned(itemId, item)) markOwned(findBuyButton(itemId), itemId, item.type);
  });
}


/* ======================= 8. Effects ======================= */

function spawnMoneyFx() {
  const container = $("fx-container");
  for (let i = 0; i < 12; i++) {
    const img = document.createElement("img");
    img.src = "assets/money-wings.gif";
    img.classList.add("money-fx");
    img.style.left = "50%";
    img.style.top = "50%";
    img.style.setProperty("--dx", (Math.random() - 0.5) * 1600 + "px");
    img.style.setProperty("--dy", (Math.random() - 0.5) * 1600 + "px");
    container.appendChild(img);
    setTimeout(() => img.remove(), 4500);
  }
}

function startBoomboxBeat(audioEl, boomboxEl, getTrack) {
  // Tuning knobs
  const SCALE_AMOUNT = 0.12;  // how much it grows on the beat
  const SHAKE_PX     = 7;     // shake distance on the beat
  const TILT_DEG     = 3;     // random tilt on the beat
  const SHARPNESS    = 3;     // higher = snappier hit, lower = floatier

  boomboxEl.style.transformOrigin = "center bottom";

  function frame() {
    requestAnimationFrame(frame);

    let hit = 0;
    if (!audioEl.paused && !audioEl.ended && audioEl.readyState >= 3) {
      const beat = EURO_BEATS[getTrack()] || DEFAULT_BEAT;
      const beatLen = 60 / beat.bpm;
      const t = audioEl.currentTime - beat.offset;
      if (t >= 0) {
        const phase = (t % beatLen) / beatLen;   // 0 = on the beat, →1 = just before next
        hit = Math.pow(1 - phase, SHARPNESS);
      }
    }

    boomboxEl.style.scale = 1 + hit * SCALE_AMOUNT;
    boomboxEl.style.translate = `${(Math.random() - 0.5) * 2 * SHAKE_PX * hit}px ${(Math.random() - 0.5) * SHAKE_PX * hit}px`;
    boomboxEl.style.rotate = `${(Math.random() - 0.5) * 2 * TILT_DEG * hit}deg`;
  }
  requestAnimationFrame(frame);
}

function maybeSpawnBoombox() {
  if (Math.random() >= BOOMBOX_CHANCE) return;

  const parent = $("fx-container") || document.body;

  const boombox = document.createElement("img");
  boombox.src = "assets/boombox.png";
  boombox.id = "euro-boombox";
  Object.assign(boombox.style, {
    position: "absolute",
    bottom: "30px",
    right: "40px",
    width: "296px",
    height: "auto",
    imageRendering: "pixelated",
    zIndex: "999",
  });
  parent.appendChild(boombox);

  // Silence the normal shop music
  shopMusic.pause();
  shopMusic.src = "";
  shopMusic.load();

  // Shuffled queue: every track plays once before any repeats
  let euroQueue = [];
  function nextEuroTrack(previous) {
    if (euroQueue.length === 0) {
      euroQueue = [...EURO_TRACKS].sort(() => Math.random() - 0.5);
      if (euroQueue.length > 1 && euroQueue[0] === previous) {
        euroQueue.push(euroQueue.shift());
      }
    }
    return euroQueue.shift();
  }

  let currentEuroTrack = nextEuroTrack();
  const euroMusic = new Audio(currentEuroTrack);
  euroMusic.loop = false;
  euroMusic.volume = 0.5;
  euroMusic.muted = store.getJSON("musicMuted", false);
  window.euroMusic = euroMusic;

  euroMusic.addEventListener("ended", () => {
    currentEuroTrack = nextEuroTrack(currentEuroTrack);
    euroMusic.src = currentEuroTrack;
    euroMusic.play().catch(() => {});
  });

  // "playing" fires when sound actually starts; the others fire when it stops/stalls
  euroMusic.addEventListener("playing", () => sprite.classList.add("dancing"));
  ["pause", "waiting", "ended", "emptied"].forEach((evt) =>
    euroMusic.addEventListener(evt, () => sprite.classList.remove("dancing"))
  );

  startBoomboxBeat(euroMusic, boombox, () => currentEuroTrack);

  euroMusic.play().catch(() => {
    document.addEventListener("click", () => euroMusic.play().catch(() => {}), { once: true });
  });

  checkBoomboxAchievement();
}


/* ======================= 9. Init ======================= */

window.addEventListener("load", setRandomSprite);

window.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("fromPriceNotice") === "true") {
    sessionStorage.removeItem("fromPriceNotice");
    fadeInFromBlack();
  }

  try {
    maybeSpawnBoombox();
  } catch (err) {
    console.error("Boombox failed:", err);
  }
  restorePurchasedItems();
  checkPreIndividualsAchievement();
  updateSecretOption();
});