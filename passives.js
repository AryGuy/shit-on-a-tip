const passives = {
  Kj: function() {
    const butterfly = document.createElement("div");
    butterfly.className = "butterfly";
    butterfly.style.position = "absolute";
    butterfly.style.width = "80px";
    butterfly.style.height = "80px";
    butterfly.style.backgroundSize = "contain";
    butterfly.style.backgroundRepeat = "no-repeat";
    butterfly.style.left = Math.random() * (window.innerWidth - 80) + "px";
    butterfly.style.top = Math.random() * (window.innerHeight - 80) + "px";
    document.body.appendChild(butterfly);
    
    const glideSound = new Audio("assets/butterflyglide.mp3");
    glideSound.play();

    let flap = false;
    const flapInterval = setInterval(() => {
      butterfly.style.backgroundImage = flap
        ? "url('assets/butterfly.png')"
        : "url('assets/butterflyflap.png')";
      flap = !flap;
    }, 300);

    let x = parseFloat(butterfly.style.left);
    let y = parseFloat(butterfly.style.top);

    function hover() {
      x += (Math.random() - 0.5) * 4;
      y += (Math.random() - 0.5) * 4;
      x = Math.max(0, Math.min(window.innerWidth - 80, x));
      y = Math.max(0, Math.min(window.innerHeight - 80, y));
      butterfly.style.left = x + "px";
      butterfly.style.top = y + "px";
      requestAnimationFrame(hover);
    }
    hover();

    butterfly.addEventListener("click", () => {
       const tapSound = new Audio("assets/butterflytap.mp3");
  tapSound.play();
      triggerKjRandomEvent();
      clearInterval(flapInterval);
      butterfly.remove();
    });

    setTimeout(() => {
      clearInterval(flapInterval);
      butterfly.remove();
    }, 5000);
  },

  // ======================= NEXT CARD WARNING =======================
  warnNextCard: function() {
    if (this.nextCardWarning) return;

    this.warnedSlot = Math.random() < 0.5 ? "left" : "right";
    const stdProfile = Math.random() < 0.5
      ? profiles.find(p => p.name === "Lucy")
      : profiles.find(p => p.name === "Sans");

    if (this.warnedSlot === "left") leftProfile = stdProfile;
    else rightProfile = stdProfile;

    this.nextCardWarning = true;
    const slotDiv = this.warnedSlot === "left" ? leftDiv : rightDiv;
    slotDiv.classList.add("warning-glow");
    setTimeout(() => slotDiv.classList.remove("warning-glow"), 3000);

    console.log(`Next card warning on ${this.warnedSlot}, replaced with ${stdProfile.name}`);
  },

  nextCardWarning: false,
  warnedSlot: null
};

function triggerKjRandomEvent() {
  const events = [
    () => { score += 5; updateScore(); return "+5 Score!"; },
    () => { revealUses += 1; updateRevealCount(); return "Extra Reveal!"; },
    () => { score = Math.max(0, score - 3); updateScore(); return "-3 Score"; },
    () => { score = Math.max(0, score - 20); updateScore(); return "-20 Score"; },
    () => { revealUses = Math.max(0, revealUses - 3); updateRevealCount(); return "-3 Reveals"; },
    () => { score += 10; updateScore(); return "+10 Score!"; },
    () => { score += 15; updateScore(); return "+15 Score!"; },
    () => { passives.warnNextCard(); return "Watch out for your next card!"; },
    () => { for (let i = 0; i < 3; i++) passives.Kj(); return "More butterflies!"; },
    () => { // RARE DEATH EVENT ~1%
      if (Math.random() < 0.01) {
        shakeScreen(true);
        sessionStorage.setItem("kjDeath", "true"); // mark that Kj killed the player
        gameOver();
      }
      return "AAUGGGHHH"; // no message
    }
  ];

  const randomEvent = events[Math.floor(Math.random() * events.length)];
  const message = randomEvent();

  if (message) { // only show msgDiv if message exists
    const msgDiv = document.createElement("div");
    msgDiv.textContent = message;
    msgDiv.style.position = "absolute";
    msgDiv.style.top = "60px";
    msgDiv.style.left = "50%";
    msgDiv.style.transform = "translateX(-50%)";
    msgDiv.style.background = "rgba(0,0,0,0.7)";
    msgDiv.style.color = "#fff";
    msgDiv.style.padding = "6px 12px";
    msgDiv.style.borderRadius = "6px";
    msgDiv.style.fontFamily = "monospace";
    msgDiv.style.fontSize = "16px";
    msgDiv.style.zIndex = 9999;
    msgDiv.style.opacity = 1;
    msgDiv.style.transition = "opacity 1s ease, top 1s ease";
    document.body.appendChild(msgDiv);

    setTimeout(() => {
      msgDiv.style.top = "40px";
      msgDiv.style.opacity = 0;
    }, 50);

    setTimeout(() => {
      msgDiv.remove();
    }, 1050);
  }
}
