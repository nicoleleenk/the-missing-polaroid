// --- Ambient audio (unchanged vibe) ---
const rainAudio = document.getElementById("rainSound");
const thunderAudio = document.getElementById("thunderSound");

// Start rain on first click (browser policy)
document.body.addEventListener("click", () => {
  if (rainAudio.paused) {
    rainAudio.volume = 0.35;
    rainAudio.play().catch(() => {});
  }
}, { once: true });

// Occasional subtle thunder
setInterval(() => {
  if (Math.random() < 0.22) {
    thunderAudio.volume = 0.35;
    thunderAudio.play().catch(() => {});
  }
}, 25000);

// --- Scene system (A) ---
const locationEl = document.getElementById("location");
const timeEl = document.getElementById("time");
const sceneEl = document.getElementById("scene");
const choicesEl = document.getElementById("choices");

// --- Dialogue system (B) ---
const dialogueOverlay = document.getElementById("dialogueOverlay");
const speakerEl = document.getElementById("speaker");
const dialogueTextEl = document.getElementById("dialogueText");
const continueBtn = document.getElementById("continueDialogue");
const closeDialogueBtn = document.getElementById("closeDialogue");

let dialogueQueue = [];

function openDialogue(lines) {
  dialogueQueue = Array.isArray(lines) ? [...lines] : [String(lines)];
  dialogueOverlay.hidden = false;
  showNextDialogueLine();
}

function showNextDialogueLine() {
  const next = dialogueQueue.shift();
  if (!next) {
    dialogueOverlay.hidden = true;
    return;
  }

  // line can be string or { speaker, text }
  if (typeof next === "string") {
    speakerEl.textContent = "Narration";
    dialogueTextEl.textContent = next;
  } else {
    speakerEl.textContent = next.speaker ?? "Narration";
    dialogueTextEl.textContent = next.text ?? "";
  }
}

continueBtn.addEventListener("click", showNextDialogueLine);
closeDialogueBtn.addEventListener("click", () => {
  dialogueQueue = [];
  dialogueOverlay.hidden = true;
});

// Scenes data: vibe-first, Singapore setting
const scenes = {
  void_deck: {
    location: "Void Deck",
    time: "Evening",
    paragraphs: [
      "Rain taps steadily against the concrete. The void deck smells faintly of wet stone and kopi.",
      "A fluorescent light buzzes. Somewhere upstairs, someone drags a chair across tiles."
    ],
    choices: [
      { label: "Go to the café (kopitiam corner)", to: "cafe" },
      { label: "Walk to the bookstore", to: "bookstore" },
      { label: "Cut through to the laundromat", to: "laundromat" },
      { label: "Pause and listen", action: () => openDialogue([
        "You stand still. The rain fills the gaps people usually talk through.",
        { speaker: "You", text: "It’s one of those evenings… where everything feels a little heavier." }
      ])}
    ]
  },

  cafe: {
    location: "The Kettle & Crumb",
    time: "Evening",
    paragraphs: [
      "Warm light pools onto wet pavement outside. The windows are fogged at the edges.",
      "Behind the counter, Auntie Mei wipes the same spot twice—like she’s waiting for a thought to settle."
    ],
    choices: [
      { label: "Back to the void deck", to: "void_deck" },
      { label: "Order something warm", action: () => openDialogue([
        { speaker: "Auntie Mei", text: "雨很大 ah… you okay or not? Sit nearer the fan, later catch cold." },
        { speaker: "You", text: "Just something warm, please." },
        { speaker: "Auntie Mei", text: "Can. Milo peng… no, no—today drink hot." }
      ])},
      { label: "Look around quietly", action: () => openDialogue([
        "The wall near the counter has a string of Polaroids clipped in a neat row.",
        "One clip hangs empty. It’s the kind of empty that feels… recent."
      ])}
    ]
  },

  bookstore: {
    location: "Second Chapter Bookstore",
    time: "Evening",
    paragraphs: [
      "A small bell chimes softly as you step in. The air smells like paper that has survived too many rainy seasons.",
      "Jun is at the counter, writing something in a notebook without looking up."
    ],
    choices: [
      { label: "Back to the void deck", to: "void_deck" },
      { label: "Browse near the window", action: () => openDialogue([
        "Outside, the rain turns the street into a moving sheet of reflections.",
        { speaker: "Jun", text: "People buy books when it rains. Or… they hide in them." }
      ])},
      { label: "Say hi to Jun", action: () => openDialogue([
        { speaker: "You", text: "Busy day?" },
        { speaker: "Jun", text: "Not busy. Just… damp. Everything sounds different when the rain is loud." }
      ])}
    ]
  },

  laundromat: {
    location: "Spin & Soothe Laundromat",
    time: "Night",
    paragraphs: [
      "The fluorescent lights make the puddles look like dull glass. Machines hum like they’re trying to lull the world to sleep.",
      "Someone sits near the far dryer, hands folded, as if waiting for something more than laundry."
    ],
    choices: [
      { label: "Back to the void deck", to: "void_deck" },
      { label: "Sit for a while", action: () => openDialogue([
        "A dryer thumps rhythmically. You count the beats until you stop counting.",
        "Thunder rolls, far enough to feel like memory."
      ])},
      { label: "Look at the noticeboard", action: () => openDialogue([
        "A damp flyer peels at the corner: community event, cancelled due to weather.",
        "Someone has scribbled a phone number in pen, then crossed it out carefully."
      ])}
    ]
  }
};

let currentSceneKey = "void_deck";

function renderScene(key) {
  const data = scenes[key];
  if (!data) return;

  locationEl.textContent = data.location;
  timeEl.textContent = data.time;

  // fade out -> swap content -> fade in
  sceneEl.classList.add("fade-out");
  choicesEl.querySelectorAll("button").forEach(b => (b.disabled = true));

  setTimeout(() => {
    // Scene text
    sceneEl.innerHTML = data.paragraphs
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join("");

    // Choices
    choicesEl.innerHTML = "";
    data.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.label;
      btn.addEventListener("click", () => {
        if (choice.to) goTo(choice.to);
        if (choice.action) choice.action();
      });
      choicesEl.appendChild(btn);
    });

    sceneEl.classList.remove("fade-out");
  }, 220);
}

function goTo(key) {
  currentSceneKey = key;
  renderScene(key);
}

// tiny helper to avoid accidental HTML injection
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Boot
renderScene(currentSceneKey);

// Optional: open with a short mood line
setTimeout(() => {
  openDialogue([
    "The rain started at 6:17PM—soft at first, then steady.",
    "Somewhere in the neighbourhood, something small went missing."
  ]);
}, 350);
