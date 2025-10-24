// ==========================
// COIN LOGIC — OBFUSCATED + IIFE (no globals)
// ==========================
(() => {
  const STORAGE_KEY = "cData_v2";
  const DECOY_KEY = "coins";
  const SECRET = 0x9a3f;
  const MAX_ACCEPTABLE = 10_000_000;
  const RESET_ON_TAMPER = true;

  function encodeNumber(n) { return btoa(String(n ^ SECRET)); }
  function decodeNumber(s) { try { return parseInt(atob(s), 10) ^ SECRET; } catch { return 0; } }
  function getRaw() { const v = localStorage.getItem(STORAGE_KEY); return v ? decodeNumber(v) : 0; }
  function setRaw(n) {
    const safe = Math.max(0, Math.floor(n));
    localStorage.setItem(STORAGE_KEY, encodeNumber(safe));
    localStorage.setItem(DECOY_KEY, safe);
  }
  function integrityCheck() {
    const val = getRaw();
    if (val > MAX_ACCEPTABLE) {
      if (RESET_ON_TAMPER) {
        console.warn("Coin value suspicious — resetting.");
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(DECOY_KEY);
        return true;
      }
    }
    return false;
  }
  function updateDisplay() {
    const display = document.getElementById("coin-count");
    if (display) display.textContent = getRaw();
  }
  function getCoinMultiplier() {
    let multiplier = 1;
    if (localStorage.getItem("upgrade_TaxEvasion") === "true") multiplier *= 2;
    if (localStorage.getItem("upgrade_MoneyMachine") === "true") multiplier *= 5;
    if (localStorage.getItem("upgrade_KillGov") === "true") multiplier *= 10;
    return multiplier;
  }
  function addCoins(amount) {
    if (integrityCheck()) return;
    const mul = getCoinMultiplier();
    setRaw(getRaw() + Math.floor(amount * mul));
    updateDisplay();
  }
  function spendCoins(amount) {
    if (integrityCheck()) return false;
    const current = getRaw();
    if (current >= amount) {
      setRaw(current - amount);
      updateDisplay();
      return true;
    }
    return false;
  }

  updateDisplay();

  window.shopAPI = {
    addCoins,
    spendCoins,
    getCoins: () => getRaw()
  };
})();
