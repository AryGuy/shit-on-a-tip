const dialogue = document.getElementById("zhiynl-dialogue");
const talkBtn = document.getElementById("talk-btn");
const backBtn = document.getElementById("back-btn");
const purchaseBtn = document.getElementById("open-store-btn");

let isTyping = false;
let currentOption = null;
let currentLine = 0;

const conversations = {
  "Who the fuck is you": [
    "AY IT ME DR PEAK",
    "HOW YOU BEEN COUSIN WHAT U HIT ME UP FOR",
    "THEY CALL ME CP KING , EPSTEINS ACCOMPLICE — A WHOLE TONNA NAMES",
    "BUT YOU CAN CALL ME ...",
    "Zhiy.",
  ],
  "About your connection with Lucy": [
    "I GAVE LUCY 700 SIBLINGS WHO ARE NOT AUTISTIC UNLIKE HIMSELF.",
    "AS A RESULT OF LUCY'S MOM BEING SO FAT AND PREGNANT WITH CHILDREN,\n\nTHE BABIES GET SUCKED INTO A TIME DISPARITY THAT SENT ME BACK IN TIME.",
    "AND THEN\n\nI SHOT HIM"
  ],
  "PECULIAR LAWYER": [
    "HE NOT WINNING THAT CASE.",
    "DON’T MATTER IF HE GOT A PARKING TICKET.",
    "SHE GONNA GO *DUUUUUUUHH EHEHEUEHHHHHEEE* MID SPEECH AND FUCK OVER HIS LIFE.",
    "EHEHUEUEUUUEEEHH.",
    "EUEUUUUUEEE HHHE DUUUUUUUUUUUUUUUUHGEHGHEUGH."
  ],
  "Gaining cash": [
    "BRAH.",
    "IT AIN'T THAT DEEP",
    "U GET COINS EQUIVALENT TO YOUR SCORE",
    "OK?",
    "FUCKING DUMBASS"
  ],
    "You scammed me": [
    "Aye",
    "THE STORE IN DA WIP OK",
    "IT NOT MY FAULT, YO BOY JUST TRYNA GAIN SOME COEMS",
    "IF YOU CRASHIN OUT GO FRENCH KISS THE DEVELOPER",
    "Aye sorry the evil negative piss demon possessed me that wasn't me speakin boy."
  ]
};

function typeWriterEffect(text, callback) {
  let i = 0;
  dialogue.textContent = '';
  isTyping = true;

  const interval = setInterval(() => {
    if (i < text.length) {
      dialogue.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(interval);
      isTyping = false;
      if (callback) callback();
    }
  }, 25);
}

talkBtn.addEventListener("click", () => {
  if (isTyping) return;

  if (typeof shopOpen !== "undefined" && shopOpen) {
    exitShop();
    return;
  }

  if (
    currentOption === null &&
    [...document.querySelectorAll("#zhiynl-dialogue button")].some(btn => btn !== talkBtn)
  ) {
    exitConversationNeutral();
    return;
  }

  if (purchaseBtn) purchaseBtn.style.display = "none"; // Hide purchase on conversation

  currentOption = null;
  showOptions();
});

function exitConversationNeutral() {
  clearDialogueButtons();

  setRandomSprite?.();

  const idleLines = [
    "IT TIME TO GO TO SLEEP",
    "THE STRONGEST NIGGA IN THE PLANET BUT THE STRENGTH ALL COMES FROM YOUR DICK",
    "RAAHAHAHAHAHAGH",
    "DOCTOR PEEEEAAAAAAAAAAAAAAK",
    "Please sit the fuck down ma’am, this is a serious case.",
    "HOLY SHIT DOECHII'S TITS ARE SMALL AS FUCK",
    "AAEYEE BEST SALEEE",
    "DONT DESECRATE THAT GOOD REFERENCE WITH YOUUUR FAAGGOOTRRYYYY",
    "I WILL USE Of Mice and Men TO ANTICIPATE ME FUCKING LUCY'S MOM"
  ];

  dialogue.textContent = idleLines[Math.floor(Math.random() * idleLines.length)];

  talkBtn.disabled = false;
  currentOption = null;
  currentLine = 0;

  if (backBtn) backBtn.style.display = "none";
  if (purchaseBtn) purchaseBtn.style.display = "inline-block"; // Show purchase on back
}

function clearDialogueButtons() {
  document.querySelectorAll("#zhiynl-dialogue button").forEach(btn => {
    if (
      btn.id !== "talk-btn" &&
      btn.id !== "open-store-btn" &&
      btn.id !== "exit-btn" &&
      btn.id !== "mute-btn" &&
      btn.id !== "back-btn"
    ) {
      btn.remove();
    }
  });
}

function showOptions() {
  talkBtn.disabled = true;
  dialogue.innerHTML = "Choose a question:<br><br>";

  Object.keys(conversations).forEach((option, idx) => {
    const optBtn = document.createElement("button");
    optBtn.textContent = `${idx + 1}. ${option}`;
    Object.assign(optBtn.style, {
      display: "block",
      margin: "8px auto",
      fontFamily: "'Press Start 2P', cursive",
      fontSize: "10px",
      background: "#222",
      color: "white",
      border: "1px solid white",
      cursor: "pointer"
    });

    optBtn.addEventListener("click", () => {
      currentOption = option;
      currentLine = 0;
      dialogue.innerHTML = "";
      clearDialogueButtons();

      typeWriterEffect(conversations[option][currentLine]);
      currentLine++;

      if (backBtn) backBtn.style.display = "block";
    });

    dialogue.appendChild(optBtn);
  });

  if (backBtn) {
    backBtn.style.display = "block";
    backBtn.onclick = exitConversationNeutral;
  }
}

document.addEventListener("click", (e) => {
  if (e.target === talkBtn || e.target.tagName === "BUTTON") return;
  if (isTyping || currentOption === null) return;

  const lines = conversations[currentOption];
  if (currentLine < lines.length) {
    if (
      currentOption === "PECULIAR LAWYER" &&
      currentLine === lines.length - 1
    ) {
      const sprite = document.getElementById("zhiynl-sprite");
      if (sprite) {
        sprite.classList.add("spin-glitch");
        setTimeout(() => {
          sprite.classList.remove("spin-glitch");
        }, 1500);
      }
    }

    typeWriterEffect(lines[currentLine]);
    currentLine++;
  } else {
    currentOption = null;
    talkBtn.disabled = false;

    setTimeout(() => {
      clearDialogueButtons();
      showOptions();
    }, 1000);
  }
});
