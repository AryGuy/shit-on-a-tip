// ===== DATA RESET: bump DATA_VERSION to wipe every player's saved data once =====
// Same wipe as the RESET DATA button on the main menu. Runs before anything else in this file.
(() => {
  const DATA_VERSION = "2";

  try {
    if (localStorage.getItem("dataVersion") === DATA_VERSION) return;

    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("dataVersion", DATA_VERSION);   // remember they've been wiped
  } catch {}
})();

// SUPERMAX COIN PRISON RAHAHAHAHAHAHAHAHAHAHUHFAIUGHAIUEGIUHAIUGEHAG
(() => {
  "use strict";

  const KEY = "cData_v3";
  const OLD_KEY = "cData_v2";
  const DECOY_KEY = "coins";          
  const DEVICE_KEY = "dId";
  const SECRET_A = "q7#Lm2!vR9-sheet-4Zk";
  const SECRET_B = "x8@Pw5^tN1-tip-Hb3";
  const MAX_COINS = 10_000_000;
  const MAX_SINGLE_GRANT = 100_000;    
  const ALLOW_V2_MIGRATION = true;    

  function hash(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  function deviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      const bytes = new Uint8Array(9);
      crypto.getRandomValues(bytes);
      id = Array.from(bytes, b => b.toString(36).padStart(2, "0")).join("");
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }

  const sign = (tag, payload) =>
    hash(`${SECRET_A}:${deviceId()}:${tag}:${payload}:${SECRET_B}`).toString(36);

  function packCoins(n) {
    return btoa(`${n}.${sign("coins", n)}`);
  }

  function writeCoins(n) {
    const safe = Math.min(MAX_COINS, Math.max(0, Math.floor(Number(n) || 0)));
    localStorage.setItem(KEY, packCoins(safe));
    localStorage.setItem(DECOY_KEY, safe);
  }

  function tampered() {
    console.warn("Coin data failed its integrity check — wallet reset.");
    writeCoins(0);
    return 0;
  }

  function readCoins() {
    const raw = localStorage.getItem(KEY);

    if (!raw) {
      const old = localStorage.getItem(OLD_KEY);
      if (ALLOW_V2_MIGRATION && old) {
        let n = 0;
        try { n = parseInt(atob(old), 10) ^ 0x9a3f; } catch {}
        localStorage.removeItem(OLD_KEY);
        if (Number.isSafeInteger(n) && n > 0 && n <= MAX_COINS) {
          writeCoins(n);
          return n;
        }
      }
      return 0;
    }

    try {
      const [v, sig] = atob(raw).split(".");
      const n = Number(v);
      if (!Number.isSafeInteger(n) || n < 0 || n > MAX_COINS || sig !== sign("coins", n)) {
        return tampered();
      }
      return n;
    } catch {
      return tampered();
    }
  }

  function updateDisplay() {
    const el = document.getElementById("coin-count");
    if (el) el.textContent = readCoins();
  }

  function getMultiplier() {
  if (localStorage.getItem("upgrade_KillGov") === "true")      return 10;
  if (localStorage.getItem("upgrade_MoneyMachine") === "true") return 5;
  if (localStorage.getItem("upgrade_TaxEvasion") === "true")   return 2;
  return 1;
}

  function spendCoins(amount) {
    if (!Number.isInteger(amount) || amount <= 0) return false; 
    const current = readCoins();
    if (current < amount) return false;
    writeCoins(current - amount);
    updateDisplay();
    return true;
  }

  let claimWindowOpen = true;
  let claimed = false;
  document.addEventListener("DOMContentLoaded", () => { claimWindowOpen = false; });
  if (document.readyState !== "loading") claimWindowOpen = false;

  function makeGrant() {
    return Object.freeze({
      add(amount, flat = false) {
        if (!Number.isFinite(amount) || amount <= 0) return 0;
        const base = Math.min(Math.floor(amount), MAX_SINGLE_GRANT);
        const added = Math.floor(base * (flat ? 1 : getMultiplier()));
        const before = readCoins();
        writeCoins(before + added);
        updateDisplay();
        return Math.min(MAX_COINS, before + added) - before;
      },
      store(name, value) {
        const json = JSON.stringify(value);
        localStorage.setItem("sec_" + name, btoa(`${encodeURIComponent(json)}.${sign(name, json)}`));
      },
      load(name) {
        const raw = localStorage.getItem("sec_" + name);
        if (!raw) return { state: "missing", value: null };
        try {
          const [enc, sig] = atob(raw).split(".");
          const json = decodeURIComponent(enc);
          if (sig !== sign(name, json)) return { state: "tampered", value: null };
          return { state: "ok", value: JSON.parse(json) };
        } catch {
          return { state: "tampered", value: null };
        }
      }
    });
  }

  function claimGrant() {
    if (claimed || !claimWindowOpen) return null;
    claimed = true;
    return makeGrant();
  }

  const api = Object.freeze({
    getCoins: readCoins,
    spendCoins,
    getMultiplier,
    refresh: updateDisplay,
    claimGrant
  });

  Object.defineProperty(window, "shopAPI", {
    value: api,
    writable: false,
    configurable: false
  });

  /* ===== DEV ONLY: only exists when the page URL has ?dev. DELETE BEFORE RELEASE. =====
  if (new URLSearchParams(location.search).has("dev")) {
    window.devGiveCoins = (n = 1000) => {
      writeCoins(readCoins() + n);   // writes a properly signed wallet, capped at MAX_COINS
      updateDisplay();
    };
  }
  // ===== END DEV ONLY ===== */

  readCoins();
  updateDisplay();
  document.addEventListener("DOMContentLoaded", updateDisplay);
})();