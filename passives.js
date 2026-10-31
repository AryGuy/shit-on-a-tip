const SFX_DIR = "assets/soundfx/";
const IMG_DIR = "assets/";
const characterPassives = (() => {

  function playSfx(file, dir = SFX_DIR) {
    new Audio(dir + file).play().catch(() => {});
  }

  // ===========================================================================
  //  ANDY — clapping Sans is worth 5 and no longer ends the game,
  //         but leaves you staggered for 3s (ruminating.gif fades in/out
  //         over the screen and blocks clicks while it plays)
  // ===========================================================================
  const ANDY_STAGGER_MS = 3000;
  const ANDY_STAGGER_GIF = IMG_DIR + "ruminating.gif";
  let andyStaggered = false;

  function andyStagger() {
    if (andyStaggered) return;
    andyStaggered = true;

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: 10000,
      opacity: 0,
      pointerEvents: "auto",   // swallows clicks while staggered
      background: "transparent"
    });

    const img = document.createElement("img");
    img.src = ANDY_STAGGER_GIF + "?t=" + Date.now();   // cache-bust so the gif restarts from frame 1
    Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover" });
    overlay.appendChild(img);
    document.documentElement.appendChild(overlay);

    // 0–2s slow fade in, 2–2.5s clear, 2.5–3s fade out
    overlay.animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: 2000 / ANDY_STAGGER_MS },
        { opacity: 1, offset: 2500 / ANDY_STAGGER_MS },
        { opacity: 0, offset: 1 }
      ],
      { duration: ANDY_STAGGER_MS, easing: "linear", fill: "forwards" }
    );

    setTimeout(() => {
      overlay.remove();
      andyStaggered = false;
    }, ANDY_STAGGER_MS);
  }

  const Andy = {
    onSTDClap(g, c) {
      if (c.profile.name === "Sans") {
        andyStagger();
        return "survive";
      }
    },
    adjustPoints(g, c, base) {
      return c.profile.name === "Sans" ? 5 : base;
    }
  };

  // ===========================================================================
  //  DENNIS — an extra middle lane (cards clapped there are worth at least 2),
  //           and he can shuffle cards between lanes. Clapping a card that was
  //           shuffled this round doubles its value; if it turns out to be
  //           Lucy/Sans the shuffle was "unsuccessful" and it's game over as usual.
  // ===========================================================================
  const DENNIS_LANE_MIN_POINTS = 2;
  const DENNIS_SHUFFLE_MULT    = 2;
  const DENNIS_LANES = ["left", "third", "right"];   // same order as on screen

  const shuffledSlots = new Set();                   // lanes holding a card that was moved this round
  const shuffleUI = { left: null, right: null };

  function dennisSyncShuffle(g) {
    const i = DENNIS_LANES.indexOf(g.getSelected());
    const locked = g.isRoundLocked() || i < 0;
    if (shuffleUI.left)  shuffleUI.left.disabled  = locked || i === 0;
    if (shuffleUI.right) shuffleUI.right.disabled = locked || i === DENNIS_LANES.length - 1;
  }

  // dir: -1 = swap the selected lane's card with the lane to its left, +1 = with the one to its right
  function dennisShuffle(g, e, dir) {
    if (!e.isTrusted || g.isRoundLocked()) return;

    const i = DENNIS_LANES.indexOf(g.getSelected());
    const j = i + dir;
    if (i < 0 || j < 0 || j >= DENNIS_LANES.length) return;

    g.swapSlots(DENNIS_LANES[i], DENNIS_LANES[j]);   // you stay on the same lane; its card changes
    shuffledSlots.add(DENNIS_LANES[i]);
    shuffledSlots.add(DENNIS_LANES[j]);
    playSfx("cardwhoosh.mp3");
    dennisSyncShuffle(g);
  }

  const Dennis = {
    onInit(g) {
      // Middle lane: placed BETWEEN the left and right lanes
      const div = document.createElement("div");
      div.className = "profile";
      div.id = "third-slot";
      const rightSlot = document.getElementById("right-slot");
      rightSlot.parentNode.insertBefore(div, rightSlot);
      g.addSlot("third", div);

      // Middle button: between "choose left" and "choose right"
      const btn = document.createElement("button");
      btn.id = "choose-third";
      btn.textContent = "Choose Middle Slot";
      const rightBtn = document.getElementById("choose-right");
      rightBtn.parentNode.insertBefore(btn, rightBtn);
      btn.addEventListener("click", (e) => g.selectSlot(e, "third"));

      // Shuffle buttons: swap the selected lane's card with its left / right neighbour
      const row = document.createElement("div");
      row.id = "shuffle-select";
      Object.assign(row.style, { display: "flex", justifyContent: "center", gap: "8px", margin: "8px 0" });

      const mk = (id, text, dir) => {
        const b = document.createElement("button");
        b.id = id;
        b.textContent = text;
        b.disabled = true;
        b.addEventListener("click", (e) => dennisShuffle(g, e, dir));
        row.appendChild(b);
        return b;
      };
      shuffleUI.left  = mk("shuffle-left",  "◀ Shuffle Left",  -1);
      shuffleUI.right = mk("shuffle-right", "Shuffle Right ▶", +1);

      const slotSelect = document.getElementById("slot-select");
      slotSelect.parentNode.insertBefore(row, slotSelect.nextSibling);
    },

    onRoundStart(g) { shuffledSlots.clear(); dennisSyncShuffle(g); },
    onSelect(g)     { dennisSyncShuffle(g); },
    onClapStart(g)  { dennisSyncShuffle(g); },

    adjustPoints(g, c, base) {
      let pts = c.slot === "third" ? Math.max(base, DENNIS_LANE_MIN_POINTS) : base;
      if (shuffledSlots.has(c.slot)) pts *= DENNIS_SHUFFLE_MULT;   // successful shuffle
      return pts;
    }
  };

  // ===========================================================================
  //  WIN — clapping Win raises a shield that absorbs the next 3 claps
  //        (re-clapping Win while shielded = flat bonus)
  // ===========================================================================
  const WIN_SHIELD_CLAPS = 3;
  const WIN_CLAP_BONUS   = 10;

  const shield = {
    claps: 0,
    vignetteEl: null,

    isActive() { return this.claps > 0; },

    afterClap(clappedWin) {
      if (clappedWin) this.claps = WIN_SHIELD_CLAPS;
      else if (this.claps > 0) this.claps--;
      this.syncVignette();
    },

    // #8181bb vignette; fades in/out via CSS transition on .active
    syncVignette() {
      if (!this.vignetteEl) {
        this.vignetteEl = document.createElement("div");
        this.vignetteEl.className = "win-shield-vignette";
        document.body.appendChild(this.vignetteEl);
      }
      this.vignetteEl.classList.toggle("active", this.isActive());
    }
  };

  const Win = {
    onSTDClap() {
      if (shield.isActive()) {
        shield.afterClap(false);
        return "absorb";
      }
    },

    afterClap(g, c) {
      if (c.profile.name === "Win") {
        if (shield.isActive()) {
          g.addScore(WIN_CLAP_BONUS);
          playSfx("LuckyCoins.mp3");
        } else {
          playSfx("WinShieldUp.mp3");
        }
        shield.afterClap(true);     
      } else {
        shield.afterClap(false);    
      }
    }
  };

  // ===========================================================================
  //  SAI — double reveals; "Glance" reveals both cards at once and rolls
  //        to a fine shyt if a Lucy/Sans shows up; Reveal++ cards give double
  // ===========================================================================
  const SAI_REVEAL_PLUS_MULT = 2;

  function saiGlance(g, selectedSlot) {
    const { left, right } = g.slots;
    if (!selectedSlot) return;

    left.div.textContent  = left.profile.name;
    right.div.textContent = right.profile.name;

    if (!left.profile.isSTD && !right.profile.isSTD) {
      g.addReveals(-1);
      g.markRevealed("left", "right");
      return;
    }

    g.revealBtn.disabled = true;

    const goFast = document.getElementById("gofast-sfx");
    if (goFast) {
      goFast.currentTime = 0;
      goFast.play().catch(() => {});
    }

    g.animateStopwatchFast(3000, 50);

    setTimeout(() => {
      const cycleDuration = 100;
      const cycleCount = 10;
      let currentCycle = 0;

      const interval = setInterval(() => {
        left.div.textContent  = g.profiles[Math.floor(Math.random() * g.profiles.length)].name;
        right.div.textContent = g.profiles[Math.floor(Math.random() * g.profiles.length)].name;

        [left.div, right.div].forEach(div => {
          div.classList.add("card-flash");
          setTimeout(() => div.classList.remove("card-flash"), cycleDuration - 10);
        });

        currentCycle++;
        if (currentCycle < cycleCount) return;

        clearInterval(interval);

        const pool = [...g.chosenTargets];
        const pick = () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0];

        g.setProfile("left",  g.profiles.find(p => p.name === pick()));
        g.setProfile("right", g.profiles.find(p => p.name === pick()));

        left.div.textContent  = left.profile.name;
        right.div.textContent = right.profile.name;

        g.landStopwatchRandomly();
        g.revealBtn.disabled = false;
        g.markRevealed("left", "right");
        g.addReveals(-1);
      }, cycleDuration);
    }, 700);
  }

  const Sai = {
    onInit(g) {
      g.multiplyReveals(2);

      g.revealBtn.textContent = "Glance";
      g.revealBtn.classList.add("my-glance-effect");
      setTimeout(() => g.revealBtn.classList.remove("my-glance-effect"), 600);

      setTimeout(() => {
        const sfx = document.getElementById("glance-sfx");
        if (sfx) {
          sfx.currentTime = 0;
          sfx.play().catch(() => {});
        }
      }, 300);
    },

    onReveal(g, slot) {
      saiGlance(g, slot);
      return true;
    },

    // Reveal++ cards give double
    adjustRevealGain(g, c, base) {
      return base * SAI_REVEAL_PLUS_MULT;
    }
  };

  // ===========================================================================
  //  KJ — butterflies spawn randomly; clicking one triggers a random event,
  //       ignoring one (letting it fly away) gives 5 score
  // ===========================================================================
  let nextCardWarning = false;
  let warnedSlot = null;

  const KJ_IGNORE_SCORE = 5;   // score for letting a butterfly fly away

  function warnNextCard(g) {
    if (nextCardWarning) return;

    warnedSlot = Math.random() < 0.5 ? "left" : "right";
    const stdName = Math.random() < 0.5 ? "Lucy" : "Sans";
    g.setProfile(warnedSlot, g.profiles.find(p => p.name === stdName));

    nextCardWarning = true;
    const div = g.slots[warnedSlot].div;
    div.classList.add("warning-glow");
    setTimeout(() => div.classList.remove("warning-glow"), 3000);
  }

  function showFloatingMessage(text) {
    const el = document.createElement("div");
    el.textContent = text;
    Object.assign(el.style, {
      position: "absolute",
      top: "60px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0,0,0,0.7)",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: "6px",
      fontFamily: "monospace",
      fontSize: "16px",
      zIndex: 9999,
      opacity: 1,
      transition: "opacity 1s ease, top 1s ease"
    });
    document.body.appendChild(el);

    setTimeout(() => { el.style.top = "40px"; el.style.opacity = 0; }, 50);
    setTimeout(() => el.remove(), 1050);
  }

  function kjRandomEvent(g) {
    const events = [
      () => { g.addScore(5);          return "+5 Score!"; },
      () => { g.addReveals(1);        return "Extra Reveal!"; },
      () => { g.addScore(-3);         return "-3 Score"; },
      () => { g.addScore(-20);        return "-20 Score"; },
      () => { g.addReveals(-3);       return "-3 Reveals"; },
      () => { g.addScore(10);         return "+10 Score!"; },
      () => { g.addScore(15);         return "+15 Score!"; },
      () => { warnNextCard(g);        return "Watch out for your next card!"; },
      () => { for (let i = 0; i < 3; i++) spawnButterfly(g); return "More butterflies!"; },
      () => {
        if (Math.random() < 0.01) {
          g.shake(true);
          sessionStorage.setItem("kjDeath", "true");
          g.gameOver();
        }
        return "AAUGGGHHH";
      }
    ];

    const message = events[Math.floor(Math.random() * events.length)]();
    if (message) showFloatingMessage(message);
  }

  function spawnButterfly(g) {
    const SIZE = 80;
    const el = document.createElement("div");
    el.className = "butterfly";
    Object.assign(el.style, {
      position: "absolute",
      width: SIZE + "px",
      height: SIZE + "px",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat"
    });

    let x = Math.random() * (window.innerWidth  - SIZE);
    let y = Math.random() * (window.innerHeight - SIZE);
    el.style.left = x + "px";
    el.style.top  = y + "px";
    document.body.appendChild(el);

    new Audio(SFX_DIR + "butterflyglide.mp3").play().catch(() => {});

    let flap = false;
    const flapInterval = setInterval(() => {
      el.style.backgroundImage = flap
        ? "url('assets/butterfly.png')"
        : "url('assets/butterflyflap.png')";
      flap = !flap;
    }, 300);

    let alive = true;
    function remove() {
      alive = false;
      clearInterval(flapInterval);
      el.remove();
    }

    (function hover() {
      if (!alive) return;
      x = Math.max(0, Math.min(window.innerWidth  - SIZE, x + (Math.random() - 0.5) * 4));
      y = Math.max(0, Math.min(window.innerHeight - SIZE, y + (Math.random() - 0.5) * 4));
      el.style.left = x + "px";
      el.style.top  = y + "px";
      requestAnimationFrame(hover);
    })();

    el.addEventListener("click", () => {
      new Audio(SFX_DIR + "butterflytap.mp3").play().catch(() => {});
      remove();
      kjRandomEvent(g);
    });

    // Left alone for 5s = ignored = free score (clicking it sets alive=false first)
    setTimeout(() => {
      if (!alive) return;
      remove();
      if (g.isRunEnded()) return;
      g.addScore(KJ_IGNORE_SCORE);
      showFloatingMessage("+" + KJ_IGNORE_SCORE + " Score");
    }, 5000);
  }

  const Kj = {
    onInit(g) {
      setInterval(() => spawnButterfly(g), 10000 + Math.random() * 10000);
    },

    beforeReveal(g, slot, profile) {
      if (nextCardWarning && slot === warnedSlot) {
        profile.isSTD = true;
        nextCardWarning = false;
        warnedSlot = null;
      }
    }
  };

  // ===========================================================================
  //  KAI — streak multiplier hits twice as hard
  // ===========================================================================
  const KAI_STREAK_BOOST = 2;

  const Kai = {
    adjustStreakMultiplier(g, c, mult) {
      return mult * KAI_STREAK_BOOST;
    }
  };

  // ===========================================================================
  //  ZHIYNL — comes with a shotgun. Clapping Lucy/Sans fires it automatically
  //           (no game over). 1 ammo max. Clap an ammo card to reload.
  // ===========================================================================
  const ZHIYNL_MAX_AMMO         = 1;
  const ZHIYNL_AMMO_COST         = 5;      // score lost when clapping an ammo card
  const ZHIYNL_AMMO_CARD_CHANCE = 0.12;   // chance a (non-STD) card is an ammo card

  const SHELL_IMG = IMG_DIR + "shotgunshell.png";
  const GUN_IMG   = IMG_DIR + "fpsshotgun.png";
  const BLAST_IMG = IMG_DIR + "shotgunblast.png";
  const GUN_W = 697, BLAST_W = 561, BLAST_H = 445;   // native sprite sizes

  const ammo = {
    count: 0,
    hudEl: null,

    set(n) {
      this.count = Math.max(0, Math.min(ZHIYNL_MAX_AMMO, n));
      this.syncHud();
    },

    // Same shell image as the card, tucked in the corner. Grey = empty, colour = loaded
    syncHud() {
      if (!this.hudEl) {
        this.hudEl = document.createElement("img");
        this.hudEl.className = "ammo-hud";
        this.hudEl.src = SHELL_IMG;
        this.hudEl.alt = "Ammo";
        document.documentElement.appendChild(this.hudEl);  // on <html> so screen shake doesn't drag it
      }
      this.hudEl.classList.toggle("has-ammo", this.count > 0);
    }
  };

  // Pull up -> blast (flash + shake + sound) -> drop away
  function fireShotgun(g) {
    const scale = Math.min(0.9, (window.innerHeight * 0.65) / BLAST_H, (window.innerWidth * 0.9) / GUN_W);

    const wrap = document.createElement("div");
    wrap.className = "shotgun-wrap";
    const sprite = document.createElement("img");
    sprite.className = "shotgun-sprite";
    sprite.src = GUN_IMG;
    sprite.style.width = Math.round(GUN_W * scale) + "px";
    wrap.appendChild(sprite);
    document.documentElement.appendChild(wrap);

    // pull up
    requestAnimationFrame(() => requestAnimationFrame(() => sprite.classList.add("up")));

    // blast
    setTimeout(() => {
      sprite.src = BLAST_IMG;
      sprite.style.width = Math.round(BLAST_W * scale) + "px";

      const flash = document.createElement("div");
      flash.className = "shotgun-flash";
      document.documentElement.appendChild(flash);
      setTimeout(() => flash.remove(), 400);

      g.shake(true);
      playSfx("shotgunblast.mp3", IMG_DIR);   // lives in assets/, not assets/soundfx/
    }, 280);

    // drop away
    setTimeout(() => sprite.classList.remove("up"), 650);
    setTimeout(() => wrap.remove(), 950);
  }

  const Zhiynl = {
    onInit(g) {
      // preload so the sprites don't pop in late
      [GUN_IMG, BLAST_IMG, SHELL_IMG].forEach(src => { new Image().src = src; });
      ammo.set(ZHIYNL_MAX_AMMO);
    },

    rollSpecialCard() {
      if (Math.random() < ZHIYNL_AMMO_CARD_CHANCE) {
        return { name: "Ammo", isSTD: false, special: true, isAmmo: true, image: SHELL_IMG };
      }
    },

    onSpecialClap(g, c) {
      if (c.profile.isAmmo) {
        ammo.set(ZHIYNL_MAX_AMMO);
        g.addScore(-ZHIYNL_AMMO_COST);   // clamps at 0
      }
    },

    onSTDClap(g, c) {
      if (ammo.count <= 0) return;      // empty = vulnerable, normal game over
      ammo.set(0);
      fireShotgun(g);
      return "absorb";                  // no game over, no score, refresh to next card
    }
  };

  return { Andy, Dennis, Win, Sai, Kj, Kai, Zhiynl };
})();