/* ======================= Character-Specific Conversations ======================= */
document.addEventListener("DOMContentLoaded", () => {
  const activeChar = sessionStorage.getItem("playerCharacter");
  const zhiynlDialogue = document.getElementById("zhiynl-dialogue");
  const convoBox = document.getElementById("conversation-box");
  const andyBtn = document.getElementById("andy-special");

  // ======================= Dialogue Database =======================
  const dialogues = {
    // ======== Andy's Dialogue =========
    andy1: {
      lines: [
        "You mean Sans?",
        "DAWG...",
        "DAAAAWWWGGGGG....",
        "DO YOU EVEN KNOW WHO U ARE",
        "CAUSE OF SANS... YOU WERE RUINED, THE INDIVIDUALS WERE RUINED.",
        "HOW CAN I NOT BE DISGUSTED WHEN YOU DONT EVEN HAVE AN IDENTITY",
        '"oh but we are a perfect match!"',
        "NO NIGGA",
        "YOU BOTH HAVE NOTHING TO DO",
        "YOU BOTH DONT PROGRESS IN ANYTHING RELEVANT TO LIFE",
        "YOU BOTH DO NOTHING FOR EACHOTHER",
        "EVEN SATAN DOESNT WANT FREELOADERS."
      ],
      afterQuote: [
        "But it's ok Andy you still have me :]",
        "AAUUGGGHHHH",
        "You should find a NEW GIRL"
      ]
    },

    andy2: {
      lines: [
        "SHIT UP ANDY I FOUND THR BROLY DRINK",
        "AHAHAHAHAHHAAHHAHA",
        "YES",
        "I CAN FEEL THE RACISM",
        "NIGGA NIGGER NIGGIE",
        "CHINKY CHINKLET CHINKLER",
        "EMBRACE THE ADDICTION AND TAKE A SIP ANDY"
      ],
      afterQuote: [
        "G.",
        "DRINK AND DRIVE DRINK AND DRIVE DRINK AND DRIVE DRINK AND DRIVE"
      ]
    },
      
    andy3: {
      lines: [
        "Don't worry Andy I won't rape and kill you",
        "(Yes i groomed and molested andy in a basement shortly after)",
        "(Andy was too tight.)",
        "(His asshole strangled my cock)"
      ],
      afterQuote: [
        "Pissed. On.",
        "Andy pregnant",
        "idk nigga i cant think"
      ]
    },
    
    andy4: {
      lines: [
        "BRAH ITS EASY",
        "yu jus need your house details",
        "Give me all of them.",
        "Your street address.",
        "Your postal code.",
        "Your P.O. number."
      ],
      afterQuote: [
        "FREEBIRD ALL OVER YO APARTMENT",
        "LOCK YOUR DOORS AND YO ASS SCREW IT SHUT",
        "i wont do anything :]"
      ]
    },

    // ======== Sai's Dialogue =========
    sai1: {
      lines: [
        "PRINCESS TYCOON MAKES PRIME YBA LOOK LIKE GAG BRO",
        "EXQUISITE LORE, EVEN ULTRAKILL CAN'T COMPETE",
        "HAVE YOU WATCHED PRINCESS TYCOON R34 HUH???"
      ],
      afterQuote: [
        "New York's Best Sellin'",
        "RAHAHAHAHAHAH"
      ]
    },

    sai2: {
      lines: [
        "you wrote this one: Among us among us, among us among us among us. Amonbg us, among us?",
        "SO WHO ARE YOU TO ORDER ME TO SPEAK NORMALLY",
        "WATCH YO TONE",
        "OR ILL TEST IF YOUR PREFRONTAL CORTEX CAN HANDLE A 18 FEET METAL PIPE."
      ],
      afterQuote: [
        "ya you die xd",
        "nazis >>>"
      ]
    },
      
    sai3: {
      lines: [
        "If you ask me anything I'm going to curse you out.",
        "NIGGER NIG G. E RNIGGER YOU BIG BLKACK MONKEY"
      ],
      afterQuote: [
        "IT LOOKS ZAMN",
        "7 terabytes of cockroach porn"
      ]
    },
    
      sai4: {
      lines: [
        "sai i'm pretty sure all named metals are english words",
        "but at the same time, english words have origins from different languages",
        "THIS IS OUTRAGEOUS 🗿 🍷"
      ],
      afterQuote: [
        "LONGUE MORT SAI",
        "VIVE LE ZHIY FRANÇAIS"
      ]
    },
    
    // ======== Sai's Dialogue =========
    kj1: {
      lines: [
        "kj ur just",
        "so h ot baby",
        "KJ PLZ JSUT LET ME RAPE BRO"
      ],
      afterQuote: [
        "I love u kj",
        "imagine drinking pee"
      ]
    },

    kj2: {
      lines: [
        "wow youre learnin from me",
        "very fluent in zhiynl martial art",
        "here is how u do it",
        "ahem",
        "SIT THE FUCK BACK DOWN YOU FUCKING WORTHLES STUPID ASS BITCH",
        "YOU'LL STAY ON MY DICK UNTIL THE DAY YOU FUCKING DIE",
        "YOU FUCKING COCK GOBBLING HOBGOBLIN MS MERRY BLOBFISH BITCH",
        "GARBAGE COMPACTED CINDERBRICK LOOKIN TOOTSIPOT DUMBASS"
      ],
      afterQuote: [
        "literally creamy landed",
        "zeh skulliez"
      ]
    },
      
    kj3: {
      lines: [
        "Sigma Grindset KJ.",
        "THROW THE GRENADE INTO SANS' HOUSE",
        "RAAAAAAÀAHAHAHAHHAAHAHAA"
      ],
      afterQuote: [
        "MINORITIES RAHAHAHAHAH CONFEDERAATES",
        "you can stop your death by asking the skull king."
      ]
    },
    
      kj4: {
      lines: [
        "you",
        "me",
        "different ways of frying cock",
        "number 1",
        "we",
        "...",
        "we uy",
        "uhhy",
        "we uuhhhy",
        "we fry it :]",
        "We don't sell food here."
      ],
      afterQuote: [
        "control your cocks",
        "WHAT HAVE YOU DONE"
      ]
    },
  };

  // ======================= Character UI Setup =======================
  if (!convoBox || !zhiynlDialogue) return;

  // ===== Andy =====
  if (activeChar === "Andy") {
    if (andyBtn) andyBtn.style.display = "block";
    convoBox.innerHTML = `
      <h3>SPEAK</h3>
      <button class="dialogue-option" data-dialogue="andy1">WHAT DID YOU DO TO MY GIRLFRIEND...</button>
      <button class="dialogue-option" data-dialogue="andy2">Help me with my drinking addiction dawg.</button>
      <button class="dialogue-option" data-dialogue="andy3">I am risking my life every second I spend here.</button>
      <button class="dialogue-option" data-dialogue="andy4">My God bruh I wanna know how to order shit.</button>
    `;
    initDialogue(convoBox, zhiynlDialogue, dialogues);
  }

  // ===== Sai =====
  if (activeChar === "Sai") {
    convoBox.innerHTML = `
      <h3>CONVERSE</h3>
      <button class="dialogue-option" data-dialogue="sai1">Let's play Princess Tycoon.</button>
      <button class="dialogue-option" data-dialogue="sai2">Fucking speak normally bro.</button>
      <button class="dialogue-option" data-dialogue="sai3">I got a question.</button>
      <button class="dialogue-option" data-dialogue="sai4">Is Magnesium an English word?</button>
    `;
    initDialogue(convoBox, zhiynlDialogue, dialogues);
  }
  
  // ===== Kj =====
  if (activeChar === "Kj") {
    convoBox.innerHTML = `
      <h3>CONVERSE</h3>
      <button class="dialogue-option" data-dialogue="kj1">Why are you staring at me like that.</button>
      <button class="dialogue-option" data-dialogue="kj2">FUCK YOU IN PARTICULAR</button>
      <button class="dialogue-option" data-dialogue="kj3">I almost killed Andy using a grenade.</button>
      <button class="dialogue-option" data-dialogue="kj4">I am starving.</button>
    `;
    initDialogue(convoBox, zhiynlDialogue, dialogues);
  }

  // ======================= Core Dialogue Logic =======================
  function initDialogue(convoBox, zhiynlDialogue, dialogues) {
    const dialogueOptions = convoBox.querySelectorAll(".dialogue-option");

    // --- SFX setup ---
    dialogueOptions.forEach(btn => {
      btn.addEventListener("pointerenter", () => {
        const hoverSfx = document.getElementById("hover-sfx");
        if (hoverSfx) {
          hoverSfx.currentTime = 0;
          hoverSfx.play().catch(() => {});
        }
      });
      btn.addEventListener("click", () => {
        const clickSfx = document.getElementById("click-sfx");
        if (clickSfx) {
          clickSfx.currentTime = 0;
          clickSfx.play().catch(() => {});
        }
      });
    });

    // --- Dialogue progression ---
    dialogueOptions.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.dialogue;
        const set = dialogues[key];
        if (!set) return;

        dialogueOptions.forEach(opt => (opt.disabled = true));
        convoBox.style.opacity = "0.5";

        let i = 0;
        function nextLine() {
          if (i < set.lines.length) {
            typeWriterEffect(set.lines[i], zhiynlDialogue, 25, () => {
              i++;
              setTimeout(nextLine, 600);
            });
          } else {
            const quote =
              set.afterQuote[Math.floor(Math.random() * set.afterQuote.length)];
            setTimeout(() => {
              typeWriterEffect(quote, zhiynlDialogue, 30, () => {
                dialogueOptions.forEach(opt => (opt.disabled = false));
                convoBox.style.opacity = "1";
              });
            }, 1000);
          }
        }
        nextLine();
      });
    });
  }
});
