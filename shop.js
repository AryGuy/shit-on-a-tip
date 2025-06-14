const spritePaths = [
  "assets/zhiynl-neutral1.png",
  "assets/zhiynl-neutral2.png",
  "assets/zhiynl-neutral3.png",
  "assets/zhiynl-neutral4.png",
  "assets/zhiynl-neutral5.png"
];

const dialogues = [
  "IT ME, DR PEAKINGSTON",
  "YOU AND ME. 100 YEARS. VISIT ZHIY_EATS.COM",
  "I FUCKING HATE",
  "WHO WAANTS IT FOR FREEEEEEE",
  "My Bad - zhyington",
  "AY I NOT DA TRASH BOY",
  "ts shit so A La Tragik",
  "CP CP CPP CPPPP",
  "YO BOY JUST BEAT A MOOSE TO DEATH WITH A PENCIL",
  "CLIM ACTIC BREAK",
  "AYYY I DAA BAAATTTTMMAAAAAANNNN",
  "GOTTA FUCKIN RAPE THAT CAT AND KILL IT",
  "IT NO WHAT HUH, IT N IT NO DIS DICK IN YO MOUUUUUUTT",
  "YOURE A FUCKIN G NOBODY",
  "YO KANYE PLEASE THINK OF YOUR BANK ACCOUNT",
  "ding Ding Ding Ding",
  ":] :] :] :] :] :] :] :]",
  "ikt eptein. Don't. answer",
  "I Just BEAT DOG FoR 30 Minute",
  "God Bless the White Man"
];

function typeWriterEffect(text, element, delay = 25, callback) {
  let i = 0;
  element.textContent = '';
  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, delay);
}

function setRandomSprite() {
  const img = document.getElementById("zhiynl-sprite");
  const randomIndex = Math.floor(Math.random() * 5); // 5 sprites
  img.src = `assets/zhiynl-neutral${randomIndex + 1}.png`;
}

function setRandomDialogue() {
  const dialogueBox = document.getElementById("zhiynl-dialogue");
  const sprite = document.getElementById("zhiynl-sprite");
  const rand = Math.floor(Math.random() * dialogues.length);
  const quote = dialogues[rand];

  // Flip sprite if it’s “CLIM ACTIC BREAK”
  sprite.style.transform = rand === 9 ? "scaleY(-1)" : "scaleY(1)";

  // Typewriter text
  typeWriterEffect(quote, dialogueBox, 25);
}

window.onload = () => {
  setRandomSprite();

  // ONLY run setRandomDialogue if NOT in conversation page
  const onConversationPage = window.location.pathname.includes("conversation.html");

  if (!onConversationPage) {
    setRandomDialogue();
  }
};

