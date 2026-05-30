import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  onValue,
  ref,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const serversBody = document.getElementById("serversBody");
const serverCount = document.getElementById("serverCount");
const emptyState = document.getElementById("emptyState");
const notificationToggle = document.getElementById("notificationToggle");

const searchInput = document.getElementById("search");
const minPlayersInput = document.getElementById("minPlayers");
const maxPlayersInput = document.getElementById("maxPlayers");
const sortBySelect = document.getElementById("sortBy");

let servers = [];
let previousServerIds = new Set();
let isFirstLoad = true;
let notificationsEnabled =
  localStorage.getItem("notificationsEnabled") === "true";
const notificationAudio = new Audio("audio/notification.mp3");
notificationAudio.preload = "auto";

notificationToggle.checked = notificationsEnabled;
console.log("Initial notifications enabled:", notificationsEnabled);

const playNotificationSound = () => {
  console.log("Playing notification sound...", notificationsEnabled);
  try {
    const audio = new Audio("audio/notification.mp3");
    audio.volume = 1;
    audio.play().catch((error) => {
      console.error("Zvuk nelze přehrát:", error);
    });
  } catch (error) {
    console.error("Zvuk nelze přehrát:", error);
  }
};

notificationToggle.addEventListener("change", (e) => {
  notificationsEnabled = e.target.checked;
  console.log("Notifications toggled:", notificationsEnabled);
  localStorage.setItem("notificationsEnabled", notificationsEnabled);
});

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatDate = (timestamp) => {
  if (!timestamp) {
    return "—";
  }
  return new Date(timestamp).toLocaleString("cs-CZ");
};

const normalize = (value) => String(value ?? "").toLowerCase();

const renderTable = () => {
  const query = normalize(searchInput.value.trim());
  const minPlayers =
    minPlayersInput.value === "" ? null : toNumber(minPlayersInput.value);
  const maxPlayers =
    maxPlayersInput.value === "" ? null : toNumber(maxPlayersInput.value);

  let filtered = servers.filter((server) => {
    const matchesQuery =
      !query ||
      normalize(server.name).includes(query) ||
      normalize(server.ip).includes(query);
    const matchesMin = minPlayers === null || server.players >= minPlayers;
    const matchesMax = maxPlayers === null || server.players <= maxPlayers;
    return matchesQuery && matchesMin && matchesMax;
  });

  switch (sortBySelect.value) {
    case "players-asc":
      filtered = filtered.sort(
        (a, b) => a.players - b.players || a.name.localeCompare(b.name),
      );
      break;
    case "name-asc":
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "players-desc":
    default:
      filtered = filtered.sort(
        (a, b) => b.players - a.players || a.name.localeCompare(b.name),
      );
  }

  serverCount.textContent = `Aktivní servery: ${filtered.length} / ${servers.length}`;

  serversBody.innerHTML = "";

  if (servers.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  if (filtered.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "muted";
    cell.textContent = "Žádné servery neodpovídají zadaným filtrům.";
    row.appendChild(cell);
    serversBody.appendChild(row);
    return;
  }

  filtered.forEach((server) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = server.name;
    row.appendChild(nameCell);

    const ipCell = document.createElement("td");
    ipCell.textContent = server.ip;
    row.appendChild(ipCell);

    const playersCell = document.createElement("td");
    playersCell.textContent = String(server.players);
    row.appendChild(playersCell);

    const createdCell = document.createElement("td");
    createdCell.textContent = formatDate(server.createdAt);
    row.appendChild(createdCell);

    serversBody.appendChild(row);
  });
};

[searchInput, minPlayersInput, maxPlayersInput].forEach((input) => {
  input.addEventListener("input", renderTable);
});
sortBySelect.addEventListener("change", renderTable);

onValue(
  ref(database, "servers"),
  (snapshot) => {
    const data = snapshot.val() || {};
    const newServers = Object.entries(data).map(([id, value]) => ({
      id,
      name: value?.name ?? "Bez názvu",
      ip: value?.ip ?? "—",
      players: toNumber(value?.players),
      createdAt: toNumber(value?.createdAt),
    }));

    console.log("Data received:", newServers.length, "servers");
    const currentServerIds = new Set(newServers.map((s) => s.id));
    const newServersAdded = Array.from(currentServerIds).filter(
      (id) => !previousServerIds.has(id),
    );

    if (!isFirstLoad) {
      console.log("New servers added:", newServersAdded);
      if (notificationsEnabled && newServersAdded.length > 0) {
        console.log("Playing notification sound...");
        playNotificationSound();
      }
    } else {
      console.log("First load - skipping notification");
      isFirstLoad = false;
    }

    previousServerIds = currentServerIds;
    servers = newServers;
    renderTable();
  },
  (error) => {
    serverCount.textContent = "Nepodařilo se načíst data.";
    serversBody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "muted";
    cell.textContent = `Chyba načítání: ${error.message}`;
    row.appendChild(cell);
    serversBody.appendChild(row);
  },
);
