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
        "HEAR ME OUT, SLEEPER PICK...",
        "PRINCESS TYCOON.",
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

    // ======== Kj's Dialogue =========
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
        "ooohuee oohue ee oohue eelalala"
      ]
    },
    
         // ======== Win's Dialogue =========
    win1: {
      lines: [
        "CHIPOTTLLEE",
        "CHIPOOOOOOTTLLEE",
        "ZHIYNL",
        "FOR 400 POINTS",
        "WHAT IS THE NAME OF THE BURRITO PLACE",
        "🛎️ 🛎️",
        "ITS CHIPOTLE"
      ],
      afterQuote: [
        "that iss...",
        "YAAH!"
      ]
    },

    win2: {
      lines: [
        "BRO CAN I HAVE A DOLLAR",
        "I LEFT MY WALLET AT HOME",
        "AND MY DAUGHTER REALLY NEEDS THIS BONG"
      ],
      afterQuote: [
        "WHY DID YOU DECIDE TO HELP ME TODAY",
        "Hello Bartender, I need an angel shot."
      ]
    },

    win3: {
      lines: [
        "cause they dogs",
        "u interact with filth u get filth on u that simple",
        "dogs wearing human skin",
        "they an advanced form of canine",
        "that all u gota know blud diddy"
      ],
      afterQuote: [
        "PEDOPEDOEDPEODEPDEDOED",
        "what gay ugly stick"
      ]
    },

    win4: {
      lines: [
        "DodleBob",
        "YO IT DODDLER",
        "DOODLEBOB",
        "DOODLINGTON",
        "DIDDLER",
        "BRO STFU IT DOODLEBOBIS"
      ],
      afterQuote: [
        "The Strongest Rapist in the World.",
        "bruhhhhh"
      ],
    },
          
         // ======== Dennis' Dialogue =========
    dennis1: {
      lines: [
        "no  IDIDN OT",
        "I DID NOT",
        "INDEED I DID NOT"
      ],
      afterQuote: [
        "FEET",
        "yep i no longer have rights"
      ]
    },

    dennis2: {
      lines: [
        "WAHT",
        "It genuinely is disgusting.",
        "Fucking plaquing people with their fetishes.",
        "Maybe people would only start to love them once you kill them.",
        "Only then would people celebrate them during their passing."
      ],
      afterQuote: [
        "OOH AHH OOH AHH",
        "iita chao che ga byowei zhe bou lai lo"
      ]
    },

    dennis3: {
      lines: [
        "YOU'RE WRONG",
        "TODAY IF UCKED FIFTEEN KIDS",
        "AND SHAT ON MY NEIGHBOUR",
        "BEFORE DRINKING ALL THE COOKING OIL IN BURGER KING"
      ],
      afterQuote: [
        "Can I have a glass of water, please?",
        "NIIIGGAAAAHHHHH"
      ]
    },

    dennis4: {
      lines: [
        "ITs a Plot by big pharma",
        "To get u Eating Goyslop to get U sick and Inflamed",
        "To get u",
        "To Buy more Shit"
      ],
      afterQuote: [
        "welcome to economics bradar.",
        "y'all nothing but dildo to me"
      ]
    },
    
    // ======== Kai's Dialogue =========
    kai1: {
      lines: [
        "bro",
        "niga what the fuk",
        "im not clcking that fking link",
        "fk u nigga",
        "fk u",
        "fk u"
      ],
      afterQuote: [
        "no no nigga",
        "NIGGA I WILL SHOOT UR DOG"
      ]
    },

    kai2: {
      lines: [
        "????????",
        "BRO STFU BEFORE I RAPE UR EYE SOCKETS",
        "DON'T EVEN",
        "DON'T EVEN PUT THAT THOUGHT IN MY HEAD"
      ],
      afterQuote: [
        "I AINT TAKING SHIT FROM ANYONE ANYMORE",
        "Professional Calcium Consumer."
      ]
    },

    kai3: {
      lines: [
        "kai u cant say that thats offensive and could hurt other people's feeling",
        "the n word is bad",
        "so pls listen to me kai",
        "never say the word 'november' ever again"
      ],
      afterQuote: [
        "im gona go solo israel.",
        "on CRACK VERITY."
      ]
    },

    kai4: {
      lines: [
        "wwwwwwwww",
        "waht...",
        "are u still not over the fact that i used ur dog like a condom without ur consent",
        "sorry accidents, dude",
        "forgive n forget."
      ],
      afterQuote: [
        "SKIP BROKSIPSKI PLOLSKIP SKIP",
        "FIVE HOURS OF GIRA GIRA."
      ]
    }
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
      <button class="dialogue-option" data-dialogue="sai1">Let's play something</button>
      <button class="dialogue-option" data-dialogue="sai2">Do you mind speaking normally for once?</button>
      <button class="dialogue-option" data-dialogue="sai3">Got an important question to ask</button>
      <button class="dialogue-option" data-dialogue="sai4">Is Magnesium an English word?</button>
    `;

    initDialogue(convoBox, zhiynlDialogue, dialogues);
  }

  // ===== Kj =====
  if (activeChar === "Kj") {
    convoBox.innerHTML = `
      <h3>CONVERSE</h3>
      <button class="dialogue-option" data-dialogue="kj1">Why are you staring at me like that</button>
      <button class="dialogue-option" data-dialogue="kj2">Fuck you</button>
      <button class="dialogue-option" data-dialogue="kj3">I almost killed Andy using a grenade</button>
      <button class="dialogue-option" data-dialogue="kj4">I am starving</button>
    `;

    initDialogue(convoBox, zhiynlDialogue, dialogues);
  }
  
  // ===== Win =====
  if (activeChar === "Win") {
    convoBox.innerHTML = `
      <h3>CONVERSE</h3>
      <button class="dialogue-option" data-dialogue="win1">👋</button>
      <button class="dialogue-option" data-dialogue="win2">I wanna buy the entire shop</button>
      <button class="dialogue-option" data-dialogue="win3">Why are Lucy and Sans attributed to getting 'shit' on your 'tip'... I never understood the concept.</button>
      <button class="dialogue-option" data-dialogue="win4">Can I leave</button>
    `;
    
    initDialogue(convoBox, zhiynlDialogue, dialogues);
  }
    
    // ===== Dennis =====
  if (activeChar === "Dennis") {
    convoBox.innerHTML = `
      <h3>CONVERSE</h3>
      <button class="dialogue-option" data-dialogue="dennis1">You fucking fucked with my fucking shit</button>
      <button class="dialogue-option" data-dialogue="dennis2">I saw these deranged niggas forcing kids to get a gender reassignment surgery</button>
      <button class="dialogue-option" data-dialogue="dennis3">Tbh bro I don't see u becoming an ideal tumblr's sexiest man</button>
      <button class="dialogue-option" data-dialogue="dennis4">why do pharmacies even sell candy in the first place ikiag</button>
    `;

    initDialogue(convoBox, zhiynlDialogue, dialogues);
  }
  
   // ===== Kai =====
  if (activeChar === "Kai") {
    // shop.js owns the secret Zhiynl option -- keep it alive through the innerHTML wipe
    const secretBtn = document.getElementById("zhiynl-secret");
    const secretWasInBox = secretBtn && convoBox.contains(secretBtn);

    convoBox.innerHTML = `
      <h3>CONVERSE</h3>
      <button class="dialogue-option" data-dialogue="kai1">🚨 STOP! 🚨 YES, STOP RIGHT NOW! GIVE ME YOUR ⚠️ ATTENTION ⚠️FOR 50 SECONDS ⏱️ and I will show you how you can get unlimited Robux 💵 on Roblox. Yes, you can generate UNLIMITED Robux 💵right now! All you would need to do is click the link 🔗 below ⬇️to open the generator. After that, you will need to fill in your username, and select the Robux! Then, you are ready to go ✅! This will ONLY work today 📅. Yes, ONLY today. So, if you want to generate an unlimited amount of Robux 💵, click the link 🔗below ⬇️right now. This process will ONLY take one minute of your time, and will give you unlimited Robux 💵without ANY risk ⛔. Click the link 🔗below ⬇️right now, and enjoy it! The instructions will be on the link 🔗below ⬇️. Click on it RIGHT now ⏲️. Goodbye!</button>
      <button class="dialogue-option" data-dialogue="kai2">The milk I gave you, right... It actually came straight from Andy</button>
      <button class="dialogue-option" data-dialogue="kai3">Stand ready for No Nigger November</button>
      <button class="dialogue-option" data-dialogue="kai4">You can’t run forever cause when I catch you i am going to play with you for hours on end so you only lucky you hiding behind this shop counter</button>
    `;

    if (secretWasInBox) convoBox.appendChild(secretBtn); // same node, so shop.js's click handler survives

    initDialogue(convoBox, zhiynlDialogue, dialogues);
  }

  // ======================= Core Dialogue Logic =======================
  function initDialogue(convoBox, zhiynlDialogue, dialogues) {
    const dialogueOptions = convoBox.querySelectorAll(".dialogue-option");

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
              set.afterQuote[
                Math.floor(Math.random() * set.afterQuote.length)
              ];

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

/* ======================= Random Entry Dialogues ======================= */
const randomEntryDialogues = {
  default: [
    "CALL ME DR PEAK",
    "Rule number 1: Do not make me Creamy.",
    "SAMSUNG HOME ESTATE",
    "TOP 10 CUNGADERO",
    "Gonna dead a rape dog.",
    "there is a WHOLE ASS PLAYLIST of RACIST ASS MUSIC",
    "i blame testers.",
    "YOU AND ME. 100 YEARS. VISIT ZHIY_EATS.COM",
    "I FUCKING HATE",
    "WHO WAANTS IT FOR FREEEEEEE",
    "My Bad - zhyington",
    "AY I NOT DA TRASH BOY",
    "ts shit so A La Tragik",
    "CP CP CPP CPPPP",
    "fard cei.",
    "DAY 1 JELQIN",
    "HAILL DAAA HYTTLLLAAAAAAAAAAAAAAAAAAA",
    "KILL IT UAGAGAGAGAGAGG",
    "IT NO WHAT HUH, IT N IT NO DIS DICK IN YO MOUUUUUUTT",
    "YOURE A FUCKIN G NOBODY",
    "YO KANYE PLEASE THINK OF YOUR BANK ACCOUNT",
    "ding Ding Ding Ding",
    ":] :] :] :] :] :] :] :]",
    "ikt eptein. Don't. answer",
    "I Just BEAT MY NEIGHBOUR'S DOG FoR 30 MinuteS",
    "God Bless the White Man",
    "TOP TIER MERCHANTRY"
  ],

  Andy: [
    "ANDY IS PREGNAAANNTT",
    "I IDI T ANDY",
    "andy i'll make a dea l, if u dont springlock me i will show u the way to the CP one pieec"
  ],

  Sai: [
    "lets cheer nyaggr sai up!",
    "the 7 liters of cum waiting for sai:",
    "hi sai :]"
  ],

  Kj: [
    "sthu before i rape ur tight ass kj",
    "KJ VOUCHER",
    "KJ GIVE ME YO SUMBO SAUCE"
  ],
  
  Win: [
    "WHO DIS NIGGA GENUILEY",
    "IT LOOKS COOL RIGHT WHAT ELSE DOES IT DO WHAT ELSE CAN I DO snifff NIGGA YOU SMELL LIKE CATNIP",
    "Mr. Unfunny0601 care to explain the hard drive containing 500 TB of CP under your bed?"
  ],
  
  Dennis: [
    "fk u denner",
    "HI DENIS",
    "I Raped You I,. , raped Dennis in your sleep last night Sorry not Sorry."
  ],
  
  Kai: [
    "おはよう 古川会",
    "NIGGA LOOOL WHERE UR HAIR AT U WENT BALD WITHOUT TELLIN ME AHAHAHAHAH BAAAAL",
    "69nekoyamato -- Not a groomer"
  ]
};

// ======================= Show Random Entry Dialogue =======================
window.addEventListener("DOMContentLoaded", () => {
  const zhiynlDialogue = document.getElementById("zhiynl-dialogue");
  const convoBox = document.getElementById("conversation-box");

  if (!zhiynlDialogue || !convoBox) return;

  let lines = [];
  
if (sessionStorage.getItem("completedBackyard") === "true") {
  sessionStorage.removeItem("completedBackyard");  
  lines = [
    "im pooped too much doggis for today..",
    "I THINK MY SHOTGUN GON NEED FIXING"
  ];
} else if (sessionStorage.getItem("completedPriceNotice") === "true") {
  sessionStorage.removeItem("completedPriceNotice");   // one-time, like completedBackyard
  lines = [
    "AY I NOT JEW OK I JUST HAVE FAMILIY TO FEED",
    "ANOTHER DAY ANOTHER INFLATION PORNO"
  ];
} else if (sessionStorage.getItem("completedTamper") === "true") {
  lines = [
    "I can forgive rapists but I have no tolerance for shoplifters",
    "You look like you just got pumped by a shotgun"
  ];
} else {
  const activeChar = sessionStorage.getItem("playerCharacter") || "default";
  lines = randomEntryDialogues[activeChar] || randomEntryDialogues.default;
}

  zhiynlDialogue.textContent =
    lines[Math.floor(Math.random() * lines.length)];

  convoBox.style.display = "none";

  if (sessionStorage.getItem("completedTamper") === "true") {
    sessionStorage.removeItem("completedTamper");
  }
});