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

  // If Andy is also one of your fine shyts his effect doubles:
  // Sans = 10 (not 5), fine shyts = 4 (not 2)
  const ANDY_SANS_POINTS     = 5;
  const ANDY_FINE_SHYT_BOOST = 2;

  const Andy = {
    onSTDClap(g, c) {
      if (c.profile.name === "Sans") {
        andyStagger();
        return "survive";
      }
    },
    adjustPoints(g, c, base) {
      const boost = g.chosenTargets.includes("Andy") ? ANDY_FINE_SHYT_BOOST : 1;
      if (c.profile.name === "Sans") return ANDY_SANS_POINTS * boost;
      return c.isTarget ? base * boost : base;
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
  //        Also: Lucy/Sans show up a bit less, fine shyts a bit more.
  // ===========================================================================
  const WIN_SHIELD_CLAPS = 3;
  const WIN_CLAP_BONUS   = 10;
  const WIN_STD_CHANCE_MULT    = 0.8;   // Lucy/Sans spawn chance x0.8 (10% -> 8%, hard mode 40% -> 32%)
  const WIN_TARGET_SPAWN_BOOST = 0.08;  // extra chance a normal card is swapped for one of your fine shyts

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
    adjustSTDChance(g, base) {
      return base * WIN_STD_CHANCE_MULT;
    },

    targetSpawnBoost() {
      return WIN_TARGET_SPAWN_BOOST;
    },

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
  const SAI_TIME_SPEED       = 3;   // the timer (and so the timer multiplier) runs twice as fast

  const SAI_GLANCE_ROLL_DELAY_MS = 700;    // before the cards start flickering
  const SAI_GLANCE_CYCLE_MS      = 100;    // one flicker
  const SAI_GLANCE_CYCLES        = 10;
  const SAI_GLANCE_FX_MS         = 3000;   // the whole fast-forward effect; the round stays locked until it's over

  // Pick `count` fine shyts for the roll. Distinct when possible. If the player has fewer fine shyts
  // than lanes (or none at all) it reuses / falls back to any normal card, so a lane is NEVER left
  // empty. (An empty lane was what bricked the game: undefined profile -> crash on the next clap.)
  function saiRollFineShyts(g, count) {
    const targets = g.chosenTargets
      .map(name => g.profiles.find(p => p.name === name))
      .filter(p => p && !p.isSTD);
    const source = targets.length ? targets : g.profiles.filter(p => !p.isSTD);

    const bag = [];
    const picked = [];
    while (picked.length < count) {
      if (!bag.length) bag.push(...source);
      picked.push(bag.splice(Math.floor(Math.random() * bag.length), 1)[0]);
    }
    return picked;
  }

  function saiGlance(g, selectedSlot) {
    if (!selectedSlot || g.isBusy() || g.isRunEnded()) return;

    const { left, right } = g.slots;

    g.showCard(left.div,  left.profile);
    g.showCard(right.div, right.profile);

    // no Lucy/Sans: just a plain look at both cards
    if (!left.profile.isSTD && !right.profile.isSTD) {
      g.addReveals(-1);
      g.markRevealed("left", "right");
      return;
    }

    // Lucy/Sans spotted: lock the round (no clapping / picking / revealing) until the effect is over.
    // Clapping mid-roll used to resolve the OLD cards, then the roll finished and overwrote the NEW round.
    g.setBusy(true);
    g.addReveals(-1);

    const goFast = document.getElementById("gofast-sfx");
    if (goFast) {
      goFast.currentTime = 0;
      goFast.play().catch(() => {});
    }

    g.animateStopwatchFast(SAI_GLANCE_FX_MS, 50);

    const rollEnd = SAI_GLANCE_ROLL_DELAY_MS + SAI_GLANCE_CYCLES * SAI_GLANCE_CYCLE_MS;
    setTimeout(() => g.setBusy(false), Math.max(SAI_GLANCE_FX_MS, rollEnd) + 50);

    setTimeout(() => {
      if (g.isRunEnded()) return;

      let currentCycle = 0;
      const interval = setInterval(() => {
        if (g.isRunEnded()) { clearInterval(interval); return; }

        left.div.textContent  = g.profiles[Math.floor(Math.random() * g.profiles.length)].name;
        right.div.textContent = g.profiles[Math.floor(Math.random() * g.profiles.length)].name;

        [left.div, right.div].forEach(div => {
          div.classList.add("card-flash");
          setTimeout(() => div.classList.remove("card-flash"), SAI_GLANCE_CYCLE_MS - 10);
        });

        if (++currentCycle < SAI_GLANCE_CYCLES) return;
        clearInterval(interval);

        // both lanes become fine shyts, then are marked as seen
        const [l, r] = saiRollFineShyts(g, 2);
        g.setProfile("left",  l);
        g.setProfile("right", r);
        g.showCard(left.div,  left.profile);
        g.showCard(right.div, right.profile);

        g.landStopwatchRandomly();
        g.markRevealed("left", "right");
      }, SAI_GLANCE_CYCLE_MS);
    }, SAI_GLANCE_ROLL_DELAY_MS);
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
    },

    adjustTimeSpeed(g, speed) {
      return speed * SAI_TIME_SPEED;
    }
  };

  // ===========================================================================
  //  KJ — butterflies spawn randomly; clicking one triggers a random event,
  //       ignoring one (letting it fly away) gives 5 score
  // ===========================================================================
  let nextCardWarning = false;
  let warnedSlot = null;

  const KJ_IGNORE_SCORE = 5;   // score for letting a butterfly fly away
  const KJ_TIME_BONUS     = 10;     // seconds added by the "time" event
  const KJ_JACKPOT_CHANCE = 0.01;   // per butterfly click
  const KJ_DEATH_CHANCE   = 0.01;   // when the "AAUGGGHHH" event is rolled
  const KJ_JACKPOT_SCORE  = 1000;

  // Turns one lane into Lucy/Sans and glows it. Only lanes where that can't produce a double-STD round.
  function warnNextCard(g) {
    if (nextCardWarning || g.isRoundLocked()) return;

    const other = { left: "right", right: "left" };
    const lanes = ["left", "right"].filter(slot =>
      !g.slots[slot].profile.isSTD && !g.slots[other[slot]].profile.isSTD
    );
    if (!lanes.length) return;

    warnedSlot = lanes[Math.floor(Math.random() * lanes.length)];
    const stdName = Math.random() < 0.5 ? "Lucy" : "Sans";
    g.setProfile(warnedSlot, g.profiles.find(p => p.name === stdName));
    g.refreshFace(warnedSlot);   // if the player had already revealed this lane, don't leave the old card showing

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
    if (g.isRunEnded()) return;

    if (Math.random() < KJ_JACKPOT_CHANCE) {
      g.addScore(KJ_JACKPOT_SCORE);
      showFloatingMessage("JACKPOT! +" + KJ_JACKPOT_SCORE + " Score!!!");
      return;
    }

    const events = [
      () => { g.addScore(5);          return "+5 Score!"; },
      () => { g.addReveals(1);        return "Extra Reveal!"; },
      () => { g.addScore(-3);         return "-3 Score"; },
      () => { g.addScore(-20);        return "-20 Score"; },
      () => { g.addReveals(-3);       return "-3 Reveals"; },
      () => { g.addScore(10);         return "+10 Score!"; },
      () => { g.addScore(15);         return "+15 Score!"; },
      () => { g.addTime(KJ_TIME_BONUS); return "+" + KJ_TIME_BONUS + " Seconds!"; },
      () => { g.setStreakToMax();     return "Streak maxed!"; },
      () => { warnNextCard(g);        return "Watch out for your next card!"; },
      () => { for (let i = 0; i < 3; i++) spawnButterfly(g); return "More butterflies!"; },
      () => {
        if (Math.random() < KJ_DEATH_CHANCE) {
          g.shake(true);
          sessionStorage.setItem("kjDeath", "true");
          g.gameOver();
          // Protection can eat this death; don't leave the flag behind for some later, unrelated game over
          if (!g.isRunEnded()) sessionStorage.removeItem("kjDeath");
        }
        return "AAUGGGHHH";
      }
    ];

    const message = events[Math.floor(Math.random() * events.length)]();
    if (message) showFloatingMessage(message);
  }

  function spawnButterfly(g) {
    if (g.isRunEnded()) return;
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
      if (!alive) return;
      remove();
      if (g.isRunEnded()) return;
      new Audio(SFX_DIR + "butterflytap.mp3").play().catch(() => {});
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
      // a fresh random delay every time (setInterval picked ONE delay and reused it forever)
      const schedule = () => setTimeout(() => {
        if (g.isRunEnded()) return;
        spawnButterfly(g);
        schedule();
      }, 10000 + Math.random() * 10000);
      schedule();
    },

    // The old beforeReveal flipped isSTD on the SHARED profile object (e.g. Matt), so that person
    // stayed Lucy/Sans-like for the rest of the run. The warned lane already holds a real Lucy/Sans,
    // so nothing needs mutating, we just forget the warning when the round changes.
    onRoundStart() {
      nextCardWarning = false;
      warnedSlot = null;
    }
  };

  // ===========================================================================
  //  KAI — streak multiplier hits twice as hard. Streaks can also reach
  //        30x / 40x / 50x, and the timer speeds up with his streak
  // ===========================================================================
  const KAI_STREAK_BOOST = 2;
  const KAI_EXTRA_STREAK_TIERS = [[30, 6], [40, 7], [50, 8]];   // [streak, base multiplier] (before the x2 boost)
  const KAI_TIME_SPEED_PER_STREAK = 0.05;   // +5% timer speed per streak (50 streak = 3.5x)
  const KAI_TIME_SPEED_MAX_STREAK = 50;

  const Kai = {
    extraStreakTiers() {
      return KAI_EXTRA_STREAK_TIERS;
    },

    adjustStreakMultiplier(g, c, mult) {
      return mult * KAI_STREAK_BOOST;
    },

    adjustTimeSpeed(g, speed) {
      const streak = Math.min(g.getStreak(), KAI_TIME_SPEED_MAX_STREAK);
      return speed * (1 + streak * KAI_TIME_SPEED_PER_STREAK);
    }
  };

  // ===========================================================================
  //  ZHIYNL — comes with a shotgun. Clapping Lucy/Sans fires it automatically
  //           (no game over). 1 ammo max. Clap an ammo card to reload.
  // ===========================================================================
  const ZHIYNL_MAX_AMMO         = 1;
  const ZHIYNL_AMMO_COST         = 5;      // score lost when clapping an ammo card
  const ZHIYNL_AMMO_CARD_CHANCE = 0.14;   // chance a (non-STD) card is an ammo card

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