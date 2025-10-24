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
const fromTamper = sessionStorage.getItem('completedTamper') === 'true';

if (fromTamper) {
  shopMusic.src = 'assets/AllTheThings.mp3';
} else {
  const trackList = ['assets/shop-theme.mp3','assets/StoreDay2.mp3','assets/StoreDay3.mp3','assets/StoreDay4.mp3'];
  shopMusic.src = trackList[Math.floor(Math.random() * trackList.length)];
}

// Try autoplay
shopMusic.play().catch(() => {
  const clickToPlay = () => {
    shopMusic.play().catch(err => console.warn("Audio still blocked:", err));
    document.removeEventListener('click', clickToPlay);
  };
  document.addEventListener('click', clickToPlay);
});

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

/* ======================= Hard Mode Load Check ======================= */
const hardModeBtn = document.querySelector('.buy-item[data-id="Hard Mode"]');
if (localStorage.getItem("hardModeBought") === "true" && hardModeBtn) {
    hardModeBtn.disabled = true;
    hardModeBtn.textContent = "Hard Mode - ✅ Purchased";
    hardModeBtn.style.opacity = "0.5";
    hardModeBtn.style.cursor = "not-allowed";
}

// ======================= Achievement Check =======================
function checkPreIndividualsAchievement() {
  const unlocked = JSON.parse(localStorage.getItem("unlockedCharacters") || "[]");

  if (unlocked.length >= 3) { // 3 or more characters unlocked
    const achievements = JSON.parse(localStorage.getItem("achievements") || "{}");

    if (!achievements.preIndividuals) {
      achievements.preIndividuals = "true";
      localStorage.setItem("achievements", JSON.stringify(achievements));

      // Optional visual feedback
      const popup = document.getElementById("achievement-popup");
      if (popup) {
        popup.innerHTML = "🏆 Achievement Unlocked: Pre-Individuals";
        popup.classList.add("show");
        setTimeout(() => popup.classList.remove("show"), 4000);
      }

      const achSfx = document.getElementById("achievement-sfx");
      if (achSfx) { achSfx.currentTime = 0; achSfx.play().catch(()=>{}); }
    }
  }
}
// ======================= Boombox Easter Egg Achievement =======================
function checkBoomboxShop() {
  const achievements = JSON.parse(localStorage.getItem("achievements") || "{}");

  if (!achievements.boomboxEasterEgg) {
    achievements.boomboxEasterEgg = "true";
    localStorage.setItem("achievements", JSON.stringify(achievements));

    // Optional visual feedback
    const popup = document.getElementById("achievement-popup");
    if (popup) {
      popup.innerHTML = "🏆 Achievement Unlocked: #SAVEEUROPE";
      popup.classList.add("show");
      setTimeout(() => popup.classList.remove("show"), 4000);
    }

    const achSfx = document.getElementById("achievement-sfx");
    if (achSfx) { achSfx.currentTime = 0; achSfx.play().catch(()=>{}); }
  }
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
// ======= Authoritative item table =======
const ITEMS = {
  "Packaged Air": { cost: 1, type: "item" },
  "Tax Evasion": { cost: 100, type: "upgrade", key: "upgrade_TaxEvasion" },
  "Money Printing Machine": { cost: 200, type: "upgrade", key: "upgrade_MoneyMachine" },
  "Kill The Government": { cost: 1000, type: "upgrade", key: "upgrade_KillGov" },
  "Andy": { cost: 500, type: "character" },
  "Sai": { cost: 500, type: "character" },
  "Kj": { cost: 500, type: "character" },
  "Hard Mode": { cost: 200, type: "misc" },
};

// attach guarded purchase handler
document.querySelectorAll('.buy-item').forEach(button => {
  button.addEventListener('click', guardedBuy, { passive: false });
});

function guardedBuy(ev) {
  if (!ev.isTrusted) return;

  const button = ev.currentTarget;
  const itemId = (button.dataset.id || button.textContent.split(' - ')[0]).trim();
  const item = ITEMS[itemId];
  if (!item) return;

  const domCost = parseInt(button.dataset.cost || '0', 10);
  if (domCost !== item.cost) { flashTamperUI(button); return; }
  if (!window.shopAPI || typeof window.shopAPI.spendCoins !== 'function') return;
  if (!window.shopAPI.spendCoins(item.cost)) { handleInsufficientFunds(); return; }

  handlePurchaseSuccess(itemId, item);
}

// small UI helpers

const agarthaAudio = new Audio("assets/Agartha.mp3");

function flashTamperUI(button) {
  // Optional: show visual flag before redirect
  button.classList.add('tamper-flag');
  setTimeout(() => button.classList.remove('tamper-flag'), 1200);

  // Redirect immediately
  window.location.href = 'tamper.html';
}

function handleInsufficientFunds() {
  // Screen shake
  const shopContainer = document.getElementById("shop-container");
  shopContainer.classList.add("shake");
  setTimeout(() => shopContainer.classList.remove("shake"), 400);

  // Play sound
  const insufficientSfx = document.getElementById("insufficient-sfx");
  if (insufficientSfx) {
    insufficientSfx.currentTime = 0;
    insufficientSfx.play().catch(err => console.warn("Audio blocked:", err));
  }

  // Zhiynl roast sequence
  const roast = ["YOU", "ARE", "FUCKING", "BBBBBRRRRRRRRRRRRRRRRROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"];
  let i = 0;

  function nextRoastLine() {
    if (i < roast.length) {
      typeWriterEffect(roast[i], zhiynlDialogue, 25, () => {
        i++;
        setTimeout(nextRoastLine, 500);
      });
    } else {
      // After BROKE, pick a random default insult
      const defaultRoasts = [
        "boohoo check yo wallet next time dog",
        "HOP OFF SBG AND GO GET A JOB",
        "BROKE BROKE BR",
        "GET A LIFE NIGGA"
      ];
      const rand = Math.floor(Math.random() * defaultRoasts.length);
      setTimeout(() => {
        typeWriterEffect(defaultRoasts[rand], zhiynlDialogue, 25);
      }, 1000);
    }
  }

  nextRoastLine();
}
// ======= Unified purchase success handler =======
function handlePurchaseSuccess(itemId, item) {
  const button = document.querySelector(`.buy-item[data-id="${itemId}"]`) 
                 || Array.from(document.querySelectorAll(".buy-item"))
                         .find(b => b.textContent.startsWith(itemId));

  // Upgrade items
  if (item.type === 'upgrade') {
    if (item.key && !localStorage.getItem(item.key)) localStorage.setItem(item.key, "true");
    if (button) {
      button.disabled = true;
      button.textContent = `${itemId} - ✅ Activated`;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    }
    new Audio("assets/chaching.mp3").play().catch(() => {});
    typeWriterEffect(`${itemId} bought boy`, zhiynlDialogue, 25);
    spawnMoneyFx();
    return;
  }

  // Characters
  // Characters
if (item.type === 'character') {
  let unlocked = JSON.parse(localStorage.getItem("unlockedCharacters") || "[]");
  if (!unlocked.includes(itemId)) {
    unlocked.push(itemId);
    localStorage.setItem("unlockedCharacters", JSON.stringify(unlocked));
    
    // START OF THE SIMPLIFIED FIX: Apply UI changes directly to the button
    const button = document.querySelector(`.buy-item[data-id="${itemId}"]`);
    if (button) {
        button.disabled = true;
        button.textContent = `${itemId} - ✅ Unlocked`; // Changed from 'Activated' to 'Unlocked'
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
    }
    
        checkPreIndividualsAchievement();
    // END OF THE SIMPLIFIED FIX

  }
  const purchaseSfx = document.getElementById("purchase-sfx");
  if (purchaseSfx) { purchaseSfx.currentTime = 0; purchaseSfx.play().catch(() => {}); }
  spawnMoneyFx();
  
  // REMOVE THIS LINE: refreshShopItems(); // It's no longer needed for instant update

  const zhiyLines = [
    "I do not support human trafficking (HLEP IM BEING HELD HOSTAGE AND I HAVEMY FREEDOM OF SPEECH SEALED)",
    "COME AGAIN RAHAHAH",
    "OFFICER I SWEAR, HE JUST ENDED UP THERE"
  ];
  typeWriterEffect(zhiyLines[Math.floor(Math.random()*zhiyLines.length)], zhiynlDialogue, 25);
  return;
}

  // Hard Mode
  if (itemId === "Hard Mode") {
    localStorage.setItem("hardModeBought", "true");
    if (button) {
      button.disabled = true;
      button.textContent = `${itemId} - ✅ Purchased`;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    }
    new Audio("assets/chaching.mp3").play().catch(() => {});
    typeWriterEffect(`You bought ${itemId} (you did not have to do this)`, zhiynlDialogue, 25);
    spawnMoneyFx();
    return;
  }

  // Regular items
  if (button) {
    new Audio("assets/chaching.mp3").play().catch(() => {});
    typeWriterEffect(`Thanks for buy ${itemId} boy.`, zhiynlDialogue, 25);
    spawnMoneyFx();
  }
}

// Money FX
function spawnMoneyFx(){
  const container = document.getElementById("fx-container");
  for(let i=0;i<12;i++){
    const img=document.createElement("img");
    img.src="assets/money-wings.gif";
    img.classList.add("money-fx");
    img.style.left="50%";
    img.style.top="50%";
    img.style.setProperty("--dx",(Math.random()-0.5)*1600+"px");
    img.style.setProperty("--dy",(Math.random()-0.5)*1600+"px");
    container.appendChild(img);
    setTimeout(()=>img.remove(),4500);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (Math.random() < 0.2) { // 1/10 chance
    const fxContainer = document.getElementById("fx-container") || document.body;

    // Create boombox element
    const boombox = document.createElement("img");
    boombox.src = "assets/boombox.png";
    boombox.id = "euro-boombox";
    boombox.style.position = "absolute";
    boombox.style.bottom = "30px";
    boombox.style.right = "40px";
    boombox.style.width = "296px";
    boombox.style.height = "auto";
    boombox.style.imageRendering = "pixelated";
    boombox.style.zIndex = "999";
    fxContainer.appendChild(boombox);

    // Pick one of your three tracks randomly
    const tracks = ["assets/TickKissMe.mp3", "assets/LuckyTwiceLucky.mp3", "assets/VRIL.mp3"];
    const euroMusic = new Audio(tracks[Math.floor(Math.random() * tracks.length)]);
    euroMusic.loop = true;
    euroMusic.volume = 0.5;

    // Stop main shop music
    const shopMusic = document.getElementById("shop-music");
    if (shopMusic) {
      shopMusic.pause();
      shopMusic.src = "";
      shopMusic.load();
    }

    // Respect mute state
    const musicMuted = JSON.parse(localStorage.getItem("musicMuted") || "false");
    euroMusic.muted = musicMuted;

    // Play music safely
    const playMusic = () => euroMusic.play().catch(() => {
      document.addEventListener("click", () => euroMusic.play().catch(() => {}), { once: true });
    });
    playMusic();

    // Bobbing animation
    boombox.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-6px)" },
        { transform: "translateY(0)" }
      ],
      { duration: 800, iterations: Infinity }
    );

    // Unlock boombox achievement
    checkBoomboxShop();
  }
});


// ======================= Restore purchased items on load =======================
window.addEventListener("DOMContentLoaded", () => {
  // Restore upgrades
  Object.entries(ITEMS).forEach(([itemId, item]) => {
    const button = document.querySelector(`.buy-item[data-id="${itemId}"]`) 
                   || Array.from(document.querySelectorAll(".buy-item"))
                           .find(b => b.textContent.startsWith(itemId));

    if (!button) return;

    // Upgrades
    if (item.type === "upgrade" && item.key && localStorage.getItem(item.key) === "true") {
      button.disabled = true;
      button.textContent = `${itemId} - ✅ Activated`;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    }

    // Characters
    if (item.type === "character") {
      const unlocked = JSON.parse(localStorage.getItem("unlockedCharacters") || "[]");
      if (unlocked.includes(itemId)) {
        button.disabled = true;
        button.textContent = `${itemId} - ✅ Unlocked`;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
      }
    }

    // Misc (like Hard Mode)
    if (item.type === "misc" && localStorage.getItem("hardModeBought") === "true") {
      button.disabled = true;
      button.textContent = `${itemId} - ✅ Purchased`;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    }
  });
});

// ======================= Achievement Check on Load =======================
window.addEventListener("DOMContentLoaded", () => {
  checkPreIndividualsAchievement();
});
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
window.addEventListener("DOMContentLoaded", () => {
  const zhiynlDialogue = document.getElementById('zhiynl-dialogue');
  const convoBox = document.getElementById('conversation-box');
  if (!zhiynlDialogue || !convoBox) return;

  let lines = [];
  
  // Priority: Tamper
  if (sessionStorage.getItem("completedTamper") === "true") {
    lines = [
      "How'd the lead taste?",
      "You look like you just got pumped by a shotgun",
    ];
  } else {
    const activeChar = sessionStorage.getItem("playerCharacter") || "default";
    lines = randomEntryDialogues[activeChar] || randomEntryDialogues.default;
  }

  zhiynlDialogue.textContent = lines[Math.floor(Math.random() * lines.length)];
  convoBox.style.display = 'none';

  // Only remove flag **after displaying** to prevent overwriting
  if (sessionStorage.getItem("completedTamper") === "true") {
    sessionStorage.removeItem('completedTamper');
  }
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
const devCoinBtn = document.getElementById("dev-coin-btn");
devCoinBtn.addEventListener("click", () => {
    shopAPI.addCoins(500); // add 500 coins
    playSound(clickSound); // optional feedback
    alert("Added 500 coins (DEV)");
});
