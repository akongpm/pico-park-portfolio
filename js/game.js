const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const introOverlay = document.getElementById("introOverlay");
const contentOverlay = document.getElementById("contentOverlay");
const startButton = document.getElementById("startButton");
const closeOverlay = document.getElementById("closeOverlay");
const keyStatus = document.getElementById("keyStatus");
const hudHint = document.getElementById("hudHint");
const soundToggle = document.getElementById("soundToggle");

const sectionTitle = document.getElementById("sectionTitle");
const sectionSummary = document.getElementById("sectionSummary");
const sectionItems = document.getElementById("sectionItems");

const SIZE = {
  player: 24,
  door: { w: 60, h: 80 },
  key: 18,
  sign: { w: 60, h: 30 },
};

const COLORS = {
  player: "#2b7a78",
  door: "#ff6b4a",
  doorLocked: "#b0a59a",
  key: "#f4c542",
  sign: "#3d342b",
  wall: "#c5b3a1",
};

const speed = 2.6;
const keys = new Set();

let hasKey = false;
let hasPermanentKey = false;
let currentRoom = "intro";
let activeSection = null;
let overlayOpen = true;
let soundOn = false;

const player = {
  x: 180,
  y: 260,
  w: SIZE.player,
  h: SIZE.player,
};

const keyItem = {
  x: 220,
  y: 260,
  size: SIZE.key,
  active: true,
};

const rooms = {
  intro: {
    name: "intro",
    door: { id: "hub", x: 520, y: 200, label: "Enter Portfolio", requiresKey: true },
    keySpawn: { x: 220, y: 260 },
    sign: null,
  },
  hub: {
    name: "hub",
    doors: [
      { id: "resume", x: 310, y: 140, label: "Resume", requiresKey: true },
      { id: "projects", x: 430, y: 140, label: "Projects", requiresKey: true },
      { id: "education", x: 310, y: 280, label: "Education", requiresKey: true },
      { id: "about", x: 430, y: 280, label: "About Me", requiresKey: true },
    ],
    keySpawn: { x: 360, y: 400 },
  },
  resume: {
    name: "resume",
    backDoor: { id: "hub", x: 620, y: 200, label: "Back", requiresKey: false },
    sign: { x: 220, y: 200 },
  },
  projects: {
    name: "projects",
    backDoor: { id: "hub", x: 620, y: 200, label: "Back", requiresKey: false },
    sign: { x: 220, y: 200 },
  },
  education: {
    name: "education",
    backDoor: { id: "hub", x: 620, y: 200, label: "Back", requiresKey: false },
    sign: { x: 220, y: 200 },
  },
  about: {
    name: "about",
    backDoor: { id: "hub", x: 620, y: 200, label: "Back", requiresKey: false },
    sign: { x: 220, y: 200 },
  },
};

function setRoom(roomName) {
  currentRoom = roomName;
  activeSection = null;
  contentOverlay.classList.add("hidden");
  overlayOpen = !introOverlay.classList.contains("hidden");

  if (roomName === "hub") {
    hasKey = hasPermanentKey;
    keyItem.active = !hasPermanentKey;
    if (keyItem.active) {
      keyItem.x = rooms.hub.keySpawn.x;
      keyItem.y = rooms.hub.keySpawn.y;
    }
  }

  if (roomName === "intro") {
    hasKey = hasPermanentKey;
    keyItem.active = !hasPermanentKey;
    if (keyItem.active) {
      keyItem.x = rooms.intro.keySpawn.x;
      keyItem.y = rooms.intro.keySpawn.y;
    }
  }

  if (roomName !== "intro" && roomName !== "hub") {
    hasKey = true;
    keyItem.active = false;
  }

  player.x = 180;
  player.y = 260;
  updateHud();
}

function updateHud() {
  keyStatus.textContent = hasKey ? "Yes" : "No";
  keyStatus.style.background = hasKey ? "#ff6b4a" : "#2b7a78";

  if (currentRoom === "intro") {
    hudHint.textContent = "Grab the key to open the door and enter your portfolio.";
  } else if (currentRoom === "hub") {
    hudHint.textContent = "Pick up the key, then choose a doorway.";
  } else {
    hudHint.textContent = "Press E by the sign to open the section panel.";
  }
}

function setHudHint(message) {
  hudHint.textContent = message;
}

function renderTextCentered(text, x, y) {
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

function drawDoor(door) {
  ctx.fillStyle = door.requiresKey && !hasKey ? COLORS.doorLocked : COLORS.door;
  ctx.fillRect(door.x, door.y, SIZE.door.w, SIZE.door.h);
  ctx.fillStyle = "#fff";
  ctx.font = "16px 'Space Grotesk', sans-serif";
  renderTextCentered(door.label, door.x + SIZE.door.w / 2, door.y + SIZE.door.h / 2 + 5);
}

function drawSign(sign) {
  ctx.fillStyle = COLORS.sign;
  ctx.fillRect(sign.x, sign.y, SIZE.sign.w, SIZE.sign.h);
  ctx.fillStyle = "#fff";
  ctx.font = "14px 'Space Grotesk', sans-serif";
  renderTextCentered("Press E", sign.x + SIZE.sign.w / 2, sign.y + 20);
}

function drawTooltip(text, x, y) {
  ctx.font = "12px 'Space Grotesk', sans-serif";
  const padding = 8;
  const width = ctx.measureText(text).width + padding * 2;
  const height = 20;
  ctx.fillStyle = "rgba(26, 26, 26, 0.85)";
  ctx.fillRect(x - width / 2, y - height - 6, width, height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y - 12);
}

function drawBackHint(door) {
  const centerX = door.x + SIZE.door.w / 2;
  const centerY = door.y - 18;
  ctx.strokeStyle = "#3d342b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX + 28, centerY);
  ctx.lineTo(centerX - 20, centerY);
  ctx.lineTo(centerX - 12, centerY - 6);
  ctx.moveTo(centerX - 20, centerY);
  ctx.lineTo(centerX - 12, centerY + 6);
  ctx.stroke();
  ctx.fillStyle = "#3d342b";
  ctx.font = "12px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Back", centerX, centerY - 10);
}

function drawKey() {
  if (!keyItem.active) return;
  ctx.fillStyle = COLORS.key;
  const radius = keyItem.size / 2;
  ctx.beginPath();
  ctx.arc(keyItem.x, keyItem.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillRect(keyItem.x + radius - 2, keyItem.y - 3, 24, 6);
  ctx.fillRect(keyItem.x + radius + 14, keyItem.y - 3, 4, 10);
}

function drawPlayer() {
  ctx.fillStyle = COLORS.player;
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawWalls() {
  ctx.strokeStyle = COLORS.wall;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function playerRect() {
  return { x: player.x, y: player.y, w: player.w, h: player.h };
}

function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys.has("ArrowUp") || keys.has("KeyW")) dy -= speed;
  if (keys.has("ArrowDown") || keys.has("KeyS")) dy += speed;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) dx -= speed;
  if (keys.has("ArrowRight") || keys.has("KeyD")) dx += speed;

  player.x += dx;
  player.y += dy;

  player.x = Math.max(28, Math.min(player.x, canvas.width - player.w - 28));
  player.y = Math.max(28, Math.min(player.y, canvas.height - player.h - 28));
}

function checkKeyPickup() {
  if (!keyItem.active) return;
  const keyRect = {
    x: keyItem.x - keyItem.size / 2,
    y: keyItem.y - keyItem.size / 2,
    w: keyItem.size,
    h: keyItem.size,
  };

  if (rectsOverlap(playerRect(), keyRect)) {
    hasKey = true;
    hasPermanentKey = true;
    keyItem.active = false;
    updateHud();
  }
}

function checkDoorTransitions() {
  if (currentRoom === "intro") {
    const door = rooms.intro.door;
    const doorRect = { x: door.x, y: door.y, w: SIZE.door.w, h: SIZE.door.h };
    if (rectsOverlap(playerRect(), doorRect) && !hasKey) {
      setHudHint("Door is locked. Grab the key to enter.");
    }
    if (rectsOverlap(playerRect(), doorRect) && hasKey) {
      setRoom("hub");
    }
    return;
  }

  if (currentRoom === "hub") {
    rooms.hub.doors.forEach((door) => {
      const doorRect = { x: door.x, y: door.y, w: SIZE.door.w, h: SIZE.door.h };
      if (rectsOverlap(playerRect(), doorRect) && !hasKey) {
        setHudHint("Grab the key first, then walk through a door.");
      }
      if (rectsOverlap(playerRect(), doorRect) && hasKey) {
        setRoom(door.id);
      }
    });
    return;
  }

  const backDoor = rooms[currentRoom].backDoor;
  const backRect = { x: backDoor.x, y: backDoor.y, w: SIZE.door.w, h: SIZE.door.h };
  if (rectsOverlap(playerRect(), backRect)) {
    setRoom("hub");
  }
}

function openSectionPanel(sectionId) {
  const section = window.SECTIONS.find((item) => item.id === sectionId);
  if (!section) return;

  sectionTitle.textContent = section.title;
  sectionSummary.textContent = section.summary;
  sectionItems.innerHTML = "";

  section.items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "panel__item";
    div.innerHTML = `<strong>${item.label}</strong><div>${item.value}</div>`;
    sectionItems.appendChild(div);
  });

  contentOverlay.classList.remove("hidden");
  overlayOpen = true;
  activeSection = sectionId;
}

function maybeOpenPanel() {
  if (currentRoom === "intro" || currentRoom === "hub") return;
  const sign = rooms[currentRoom].sign;
  const signRect = { x: sign.x, y: sign.y, w: SIZE.sign.w, h: SIZE.sign.h };
  if (rectsOverlap(playerRect(), signRect)) {
    setHudHint("Press E to open this section.");
  }
  if (rectsOverlap(playerRect(), signRect) && keys.has("KeyE")) {
    openSectionPanel(currentRoom);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWalls();

  if (currentRoom === "intro") {
    drawKey();
    const door = rooms.intro.door;
    drawDoor(door);
    const doorRect = { x: door.x, y: door.y, w: SIZE.door.w, h: SIZE.door.h };
    if (rectsOverlap(playerRect(), doorRect) && !hasKey) {
      drawTooltip("Locked", door.x + SIZE.door.w / 2, door.y);
    }
  } else if (currentRoom === "hub") {
    drawKey();
    rooms.hub.doors.forEach((door) => {
      drawDoor(door);
      const doorRect = { x: door.x, y: door.y, w: SIZE.door.w, h: SIZE.door.h };
      if (rectsOverlap(playerRect(), doorRect) && !hasKey) {
        drawTooltip("Locked", door.x + SIZE.door.w / 2, door.y);
      }
    });
  } else {
    const backDoor = rooms[currentRoom].backDoor;
    drawDoor(backDoor);
    drawBackHint(backDoor);
    drawSign(rooms[currentRoom].sign);
    const sign = rooms[currentRoom].sign;
    const signRect = { x: sign.x, y: sign.y, w: SIZE.sign.w, h: SIZE.sign.h };
    if (rectsOverlap(playerRect(), signRect)) {
      drawTooltip("Press E", sign.x + SIZE.sign.w / 2, sign.y);
    }
  }

  drawPlayer();
}

function loop() {
  if (!overlayOpen) {
    updateHud();
    updatePlayer();
    checkKeyPickup();
    checkDoorTransitions();
    maybeOpenPanel();
  }

  render();
  requestAnimationFrame(loop);
}

function startGame() {
  introOverlay.classList.add("hidden");
  overlayOpen = false;
  setRoom("intro");
}

window.addEventListener("keydown", (event) => {
  keys.add(event.code);

  if ((event.code === "Enter" || event.code === "Space") && !introOverlay.classList.contains("hidden")) {
    startGame();
  }

  if (event.code === "Escape" && !contentOverlay.classList.contains("hidden")) {
    contentOverlay.classList.add("hidden");
    overlayOpen = false;
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

startButton.addEventListener("click", () => {
  startGame();
});

closeOverlay.addEventListener("click", () => {
  contentOverlay.classList.add("hidden");
  overlayOpen = false;
});
soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "Sound: On" : "Sound: Off";
});


setRoom("intro");
loop();
