// ==========================
// ZHIYNL SHOP SCRIPT
// ==========================

// Just handle sprite randomization — the rest lives in shop.html
function setRandomSprite() {
  const img = document.getElementById("zhiynl-sprite");
  if (!img) return;
  const randomIndex = Math.floor(Math.random() * 5);
  img.src = `assets/zhiynl-neutral${randomIndex + 1}.png`;
}

// Run when page loads
window.addEventListener("load", setRandomSprite);


    /* ======================= Music Setup ======================= */
    const trackList = ['assets/shop-theme.mp3','assets/StoreDay2.mp3','assets/StoreDay3.mp3','assets/StoreDay4.mp3'];
    const shopMusic = document.getElementById('shop-music');
    shopMusic.src = trackList[Math.floor(Math.random() * trackList.length)];

    const savedTime = sessionStorage.getItem('musicTime');
    if(savedTime !== null) shopMusic.currentTime = parseFloat(savedTime);

    document.addEventListener('click', () => {
      if(shopMusic.paused) shopMusic.play().catch(err=>console.warn("Autoplay blocked:", err));
    }, { once: true });

    document.getElementById('exit-btn').addEventListener('click', () => window.location.href='index.html');
    
    /* ========== Hover & Click Sounds for Buttons ========== */
const hoverSfx = document.getElementById('hover-sfx');
const clickSfx = document.getElementById('click-sfx');

function attachButtonSFX(button) {
  if (!button.hasAttribute('data-sfx')) { // prevent duplicates
    button.addEventListener('pointerenter', () => {
      hoverSfx.currentTime = 0;
      hoverSfx.play().catch(()=>{});
    });
    button.addEventListener('click', () => {
      clickSfx.currentTime = 0;
      clickSfx.play().catch(()=>{});
    });
    button.setAttribute('data-sfx', 'true');
  }
}

// Attach to existing buttons immediately
document.querySelectorAll('button').forEach(attachButtonSFX);

// Observe DOM changes for new buttons
const observer = new MutationObserver(() => {
  document.querySelectorAll('button').forEach(attachButtonSFX);
});
observer.observe(document.body, { childList: true, subtree: true });


    /* ======================= Coin Setup ======================= */
    let coins = parseInt(localStorage.getItem("coins")) || 0;
    let coinMultiplier = parseInt(localStorage.getItem("coinMultiplier") || "1");

    const coinDisplay = document.getElementById("coin-count");
    coinDisplay.textContent = coins;

    const taxButton = document.querySelector('.buy-item[data-id="Tax Evasion"]');
if (parseInt(localStorage.getItem("coinMultiplier") || "1") > 1) {
    taxButton.disabled = true;
    taxButton.textContent = "Tax Evasion - ✅ Activated";
    taxButton.style.opacity = "0.5";
    taxButton.style.cursor = "not-allowed";
}
    const moneyMachineBtn = document.querySelector('.buy-item[data-id="Money Printing Machine"]');
if (parseInt(localStorage.getItem("coinMultiplier") || "1") >= 5) {
  moneyMachineBtn.disabled = true;
  moneyMachineBtn.textContent = "Money Printing Machine - ✅ Activated";
  moneyMachineBtn.style.opacity = "0.5";
  moneyMachineBtn.style.cursor = "not-allowed";
}
// Kill The Government
const killGovBtn = document.querySelector('.buy-item[data-id="Kill The Government"]');
if (coinMultiplier >= 10) {
  killGovBtn.disabled = true;
  killGovBtn.textContent = "Kill The Government - ✅ Activated";
  killGovBtn.style.opacity = "0.5";
  killGovBtn.style.cursor = "not-allowed";
}
/* ======================= Hard Mode Load Check ======================= */
const hardModeBtn = document.querySelector('.buy-item[data-id="Hard Mode"]');
if (localStorage.getItem("hardModeBought") === "true" && hardModeBtn) {
    hardModeBtn.disabled = true;
    hardModeBtn.textContent = "Hard Mode - ✅ Purchased";
    hardModeBtn.style.opacity = "0.5";
    hardModeBtn.style.cursor = "not-allowed";
}

    /* ======================= Typewriter Effect ======================= */
    let typeWriterInterval; // global variable to track interval

function typeWriterEffect(text, element, delay=25, callback) {
    clearInterval(typeWriterInterval); // cancel any previous typewriter
    let i = 0;
    element.textContent = '';
    typeWriterInterval = setInterval(() => {
        element.textContent += text[i] || '';
        i++;
        if(i >= text.length) {
            clearInterval(typeWriterInterval);
            if(callback) callback();
        }
    }, delay);
}

    /* ======================= Sprite Click Insults ======================= */
    const zhiynlSprite = document.getElementById("zhiynl-sprite");
    const zhiynlDialogue = document.getElementById("zhiynl-dialogue");
    const sfx = document.getElementById("insult-sfx");
    const zhiynlInsults = [
      "SCHLAWG", "I FEEL LIKE NAPOLEON", "BRO",
      "STOPPINGS STOOOPP", "IF THIS GAME BREAKS YOU'RE RESPONSIBLE FOR IT"
    ];

    zhiynlSprite.addEventListener("click", ()=>{
      const insult = zhiynlInsults[Math.floor(Math.random()*zhiynlInsults.length)];
      zhiynlDialogue.textContent = insult;
      zhiynlSprite.classList.add("squish");
      setTimeout(()=> zhiynlSprite.classList.remove("squish"),150);
      if(sfx){ sfx.currentTime=0; sfx.play().catch(err=>console.warn("Audio blocked:", err)); }
    });

    /* ======================= Conversation Logic ======================= */
    const talkBtn = document.getElementById("talk-btn");
    const convoBox = document.getElementById("conversation-box");
    talkBtn.addEventListener("click", ()=>{
      convoBox.style.display = window.getComputedStyle(convoBox).display !== "none" ? "none" : "block";
    });

    document.querySelectorAll(".dialogue-option").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const replies = btn.dataset.replies ? JSON.parse(btn.dataset.replies) : [btn.dataset.reply];
        let i=0;
        function nextLine(){
          if(i<replies.length){
            typeWriterEffect(replies[i], zhiynlDialogue, 25, ()=>{
              i++;
              setTimeout(nextLine, i>=replies.length?1000:600);
            });
          } else convoBox.style.display = "block";
        }
        nextLine();
        convoBox.style.display="none";
      });
    });


    /* ======================= Purchase Logic ======================= */
let unlockedCharacters = JSON.parse(localStorage.getItem("unlockedCharacters") || "[]");

// helper to update UI
function refreshShopItems() {
  document.querySelectorAll(".buy-item").forEach(button => {
    const itemType = button.dataset.type;
    const itemId = button.dataset.id;
    if (itemType === "character" && unlockedCharacters.includes(itemId)) {
      button.textContent = `${itemId} - ✅ Owned`;
      button.disabled = true;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    }
  });
}
refreshShopItems();

document.querySelectorAll(".buy-item").forEach(button => {
  button.addEventListener("click", () => {
    const cost = parseInt(button.dataset.cost);
    const itemType = button.dataset.type; // may be undefined for normal items
    const itemId = button.dataset.id ? button.dataset.id.trim() : button.textContent.split(' - ')[0].trim();

    if (coins >= cost) {
      coins -= cost;
      localStorage.setItem("coins", coins);
      coinDisplay.textContent = coins;

      // ================= UPGRADES =================
      if(itemId === "Tax Evasion") {
        coinMultiplier = 2;
        localStorage.setItem("coinMultiplier", coinMultiplier);
        button.disabled = true;
        button.textContent = `${itemId} - ✅ Activated`;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
      }

      if(itemId === "Money Printing Machine") {
        coinMultiplier = 5;
        localStorage.setItem("coinMultiplier", coinMultiplier);
        button.disabled = true;
        button.textContent = `${itemId} - ✅ Activated`;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";

        const taxButton = document.querySelector('.buy-item[data-id="Tax Evasion"]');
        if(taxButton) {
            taxButton.disabled = true;
            taxButton.textContent = "Tax Evasion - ✅ Activated";
            taxButton.style.opacity = "0.5";
            taxButton.style.cursor = "not-allowed";
        }
      }
      if(itemId === "Kill The Government") {
  coinMultiplier = 10;
  localStorage.setItem("coinMultiplier", coinMultiplier);
  button.disabled = true;
  button.textContent = `${itemId} - ✅ Activated`;
  button.style.opacity = "0.5";
  button.style.cursor = "not-allowed";

  // also disable previous upgrades visually if needed
  const prevButtons = [
    '.buy-item[data-id="Tax Evasion"]',
    '.buy-item[data-id="Money Printing Machine"]'
  ];
  prevButtons.forEach(sel => {
    const b = document.querySelector(sel);
    if(b){
      b.disabled = true;
      b.style.opacity = "0.5";
      b.style.cursor = "not-allowed";
    }
  });
}

      // ================= CHARACTERS =================
      if (itemType === "character") {
        if (!unlockedCharacters.includes(itemId)) {
          unlockedCharacters.push(itemId);
          localStorage.setItem("unlockedCharacters", JSON.stringify(unlockedCharacters));

          const purchaseSfx = document.getElementById("purchase-sfx");
          if (purchaseSfx) {
            purchaseSfx.currentTime = 0;
            purchaseSfx.play().catch(() => {});
          }

          spawnMoneyFx();
          refreshShopItems();

          const zhiyLines = [
            "I do not support human trafficking (HLEP IM BEING HELD HOSTAGE AND I HAVEMY FREEDOM OF SPEECH SEALED)",
            "COME AGAIN RAHAHAH",
            "OFFICER I SWEAR, HE JUST ENDED UP THERE"
          ];
          const rand = Math.floor(Math.random() * zhiyLines.length);
          typeWriterEffect(zhiyLines[rand], zhiynlDialogue, 25);
        }
      } 
      // ================= HARD MODE =================
      else if (itemType === "misc" && itemId === "Hard Mode") {
        localStorage.setItem("hardModeBought", "true"); // flag to check in selection.html
        button.disabled = true;
        button.textContent = `${itemId} - ✅ Purchased`;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";

        const chachingSfx = new Audio("assets/chaching.mp3");
        chachingSfx.play().catch(()=>{});
        typeWriterEffect(`You bought ${itemId} (you did not have to do this)`, zhiynlDialogue, 25);
        spawnMoneyFx();
      } 
      // ================= REGULAR ITEMS =================
      else {
        const chachingSfx = new Audio("assets/chaching.mp3");
        chachingSfx.play().catch(()=>{});
        typeWriterEffect(`Thanks for buy ${itemId} boy.`, zhiynlDialogue, 25);
        spawnMoneyFx();
      }
    } 
    else {
          // Insufficient coins
          const shopContainer = document.getElementById("shop-container");
          shopContainer.classList.add("shake");
          setTimeout(()=>shopContainer.classList.remove("shake"),400);

          const insufficientSfx = document.getElementById("insufficient-sfx");
          if(insufficientSfx){ insufficientSfx.currentTime=0; insufficientSfx.play().catch(err=>console.warn("Audio blocked:", err)); }

          const roast = ["YOU", "ARE", "FUCKING", "BBBBBRRRRRRRRRRRRRRRRROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"];
      let i = 0;

      function nextRoastLine() {
        if (i < roast.length) {
          typeWriterEffect(roast[i], zhiynlDialogue, 25, () => {
            i++;
            setTimeout(nextRoastLine, 500);
          });
        } else {
          // Stage 2: after BROKE, pick a random default insult
          const defaultRoasts = [
            "boohoo check yo wallet next time dog",
            "HOP OFF SBG AND GO GET A JOB",
            "BROKE BROKE BR",
            "GET A LIFE NIGGA"
          ];
          const rand = Math.floor(Math.random() * defaultRoasts.length);
          setTimeout(() => {
            typeWriterEffect(defaultRoasts[rand], zhiynlDialogue, 25);
          }, 1000); // wait 1s before fallback line
        }
      }

      nextRoastLine();
    }
  });
});

    /* ======================= Money FX ======================= */
    function spawnMoneyFx(){
      const container = document.getElementById("fx-container");
      for(let i=0;i<12;i++){
        const img=document.createElement("img");
        img.src="assets/money-wings.gif";
        img.classList.add("money-fx");
        img.style.left="50%";
        img.style.top="50%";
        const dx=(Math.random()-0.5)*1600+"px";
        const dy=(Math.random()-0.5)*1600+"px";
        img.style.setProperty("--dx",dx);
        img.style.setProperty("--dy",dy);
        container.appendChild(img);
        setTimeout(()=>img.remove(),4500);
      }
    }

    /* ======================= Random Entry Dialogues ======================= */
const randomEntryDialogues = {
  default: [
    "IT ME, DR PEAKINGSTON","Rule number 1: Do not make me Creamy.","SAMSUNG HOME ESTATE",
    "TOP 10 CUNGADERO","Gonna dead a rape dog.","there is a WHOLE ASS PLAYLIST of RACIST ASS MUSIC",
    "i blame testers.","YOU AND ME. 100 YEARS. VISIT ZHIY_EATS.COM","I FUCKING HATE",
    "WHO WAANTS IT FOR FREEEEEEE","My Bad - zhyington","AY I NOT DA TRASH BOY","ts shit so A La Tragik",
    "CP CP CPP CPPPP","YO BOY JUST BEAT A MOOSE TO DEATH WITH A PENCIL","DAY 1 JELQIN",
    "AYYY I DAA BAAATTTTMMAAAAAANNNN","KILL IT UAGAGAGAGAGAGG","IT NO WHAT HUH, IT N IT NO DIS DICK IN YO MOUUUUUUTT",
    "YOURE A FUCKIN G NOBODY","YO KANYE PLEASE THINK OF YOUR BANK ACCOUNT","ding Ding Ding Ding",
    ":] :] :] :] :] :] :] :]","ikt eptein. Don't. answer","I Just BEAT DOG FoR 30 Minute","God Bless the White Man"
  ],
  Andy: [
    "ANDY IS PREGNAAANNTT","I IDI T ANDY","andy i'll make a dea l, if u dont springlock me i will show u the way to the CP one pieec"
  ],
  Sai: [
    "lets cheer nyaggr sai up!", "the 7 liters of cum waiting for sai:", "hi sai :]"
  ],
  Kj: [
    "sthu before i rape ur tight ass kj", "KJ VOUCHER", "KJ GIVE ME YO SUMBO SAUCE"
  ],
};

// Show random entry dialogue based on current character
window.addEventListener("DOMContentLoaded", ()=>{
  const activeChar = sessionStorage.getItem("playerCharacter") || "default";
  const lines = randomEntryDialogues[activeChar] || randomEntryDialogues.default;
  const randomLine = lines[Math.floor(Math.random()*lines.length)];
  zhiynlDialogue.textContent = randomLine;

  // Hide conversation box initially
  convoBox.style.display = 'none';
});
 
  // defensive references (safe even if variables already exist)
  const _convoBox = document.getElementById('conversation-box');
  const _talkBtn  = document.getElementById('talk-btn');

  // Ensure talk button only toggles the dialogue box (no auto-open)
  if (_talkBtn && _convoBox) {
    // Remove any previously attached click handlers (safer) by cloning
    const newTalk = _talkBtn.cloneNode(true);
    _talkBtn.parentNode.replaceChild(newTalk, _talkBtn);

    newTalk.addEventListener('click', () => {
  const isOpen = window.getComputedStyle(_convoBox).display !== 'none';
  _convoBox.style.display = isOpen ? 'none' : 'block';

  // play click SFX
  const clickSfx = document.getElementById('click-sfx');
  if (clickSfx) {
    clickSfx.currentTime = 0;
    clickSfx.play().catch(()=>{});
  }
});

newTalk.addEventListener('pointerenter', () => {
  const hoverSfx = document.getElementById('hover-sfx');
  if (hoverSfx) {
    hoverSfx.currentTime = 0;
    hoverSfx.play().catch(()=>{});
  }
});
  }
  /* ======================= Mute Button Functionality ======================= */
const muteBtn = document.getElementById("mute-btn");
const shopMusicEl = document.getElementById("shop-music");
let musicMuted = JSON.parse(localStorage.getItem("musicMuted") || "false");

// Apply the saved state on load
shopMusicEl.muted = musicMuted;
muteBtn.textContent = musicMuted ? "🔇" : "🔊";

muteBtn.addEventListener("click", () => {
  musicMuted = !musicMuted;
  shopMusicEl.muted = musicMuted;
  muteBtn.textContent = musicMuted ? "🔇" : "🔊";
  localStorage.setItem("musicMuted", JSON.stringify(musicMuted));
});

/* ======================= Toggle Shop Menu Visibility ======================= */
const buyButton = document.getElementById("buy-btn");
const shopNotebook = document.getElementById("shop-notebook"); // container for tabs + sections

// hide notebook by default
shopNotebook.style.display = "none";

buyButton.addEventListener("click", () => {
  const isVisible = shopNotebook.style.display !== "none";
  shopNotebook.style.display = isVisible ? "none" : "block";
});

/* ======================= SHOP TAB SWITCHING ======================= */
const tabButtons = document.querySelectorAll(".tab-btn");
const shopSections = document.querySelectorAll(".shop-section");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab; // "items", "characters", etc.

    // Deactivate all buttons
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Hide all sections
    shopSections.forEach(sec => sec.classList.remove("active"));

    // Show selected section
    const section = document.getElementById("tab-" + target);
    if (section) section.classList.add("active");
  });
});

// Show first tab by default
if (tabButtons.length > 0) {
  const firstTab = tabButtons[0];
  firstTab.classList.add("active");
  const firstSection = document.getElementById("tab-" + firstTab.dataset.tab);
  if (firstSection) firstSection.classList.add("active");
}
