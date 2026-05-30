import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  get,
  getDatabase,
  onDisconnect,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const formSection = document.getElementById("formSection");
const activeSection = document.getElementById("activeSection");
const statusEl = document.getElementById("status");

const form = document.getElementById("serverForm");
const nameInput = document.getElementById("serverName");
const ipInput = document.getElementById("serverIp");
const playersInput = document.getElementById("serverPlayers");
const serverOffButton = document.getElementById("serverOff");

const activeName = document.getElementById("activeName");
const activeIp = document.getElementById("activeIp");
const updatePlayersInput = document.getElementById("updatePlayers");
const updatePlayersBtn = document.getElementById("updatePlayersBtn");

let currentRef = null;

const showStatus = (message, type) => {
  statusEl.textContent = message;
  statusEl.className = `status ${type ?? ""}`.trim();
  statusEl.classList.remove("hidden");
};

const setActiveUi = (active, data) => {
  if (active) {
    formSection.classList.add("hidden");
    activeSection.classList.remove("hidden");
    activeName.textContent = data?.name ?? "—";
    activeIp.textContent = data?.ip ?? "—";
    updatePlayersInput.value = data?.players ?? 0;
  } else {
    formSection.classList.remove("hidden");
    activeSection.classList.add("hidden");
  }
};

const registerDisconnect = (entryRef) => {
  if (!entryRef) {
    return;
  }
  onDisconnect(entryRef)
    .remove()
    .catch((error) => {
      showStatus(`Nepodařilo se nastavit automatické vypnutí: ${error.message}`, "error");
    });
};

const loadExistingEntry = async () => {
  const storedKey = sessionStorage.getItem("serverEntryKey");
  if (!storedKey) {
    return;
  }

  const storedRef = ref(database, `servers/${storedKey}`);
  try {
    const snapshot = await get(storedRef);
    if (!snapshot.exists()) {
      sessionStorage.removeItem("serverEntryKey");
      return;
    }
    currentRef = storedRef;
    const data = snapshot.val();
    setActiveUi(true, data);
    registerDisconnect(storedRef);
  } catch (error) {
    showStatus(`Nepodařilo se načíst uložený server: ${error.message}`, "error");
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (currentRef) {
    showStatus("Server už je aktivní. Nejprve jej vypněte.", "error");
    return;
  }

  const name = nameInput.value.trim();
  const ip = ipInput.value.trim();
  const players = Number(playersInput.value);

  if (!name || !ip || !Number.isFinite(players) || players < 0) {
    showStatus("Vyplňte prosím všechny údaje správně.", "error");
    return;
  }

  const entryRef = push(ref(database, "servers"));
  const payload = {
    name,
    ip,
    players: Math.floor(players),
    createdAt: serverTimestamp(),
  };

  set(entryRef, payload)
    .then(() => {
      currentRef = entryRef;
      sessionStorage.setItem("serverEntryKey", entryRef.key);
      setActiveUi(true, payload);
      registerDisconnect(entryRef);
      showStatus("Server byl přidán a je aktivní.", "success");
    })
    .catch((error) => {
      showStatus(`Nepodařilo se přidat server: ${error.message}`, "error");
    });
});

serverOffButton.addEventListener("click", () => {
  if (!currentRef) {
    return;
  }

  serverOffButton.disabled = true;

  remove(currentRef)
    .then(() => {
      sessionStorage.removeItem("serverEntryKey");
      currentRef = null;
      setActiveUi(false);
      showStatus("Server byl vypnut.", "success");
    })
    .catch((error) => {
      showStatus(`Nepodařilo se vypnout server: ${error.message}`, "error");
    })
    .finally(() => {
      serverOffButton.disabled = false;
    });
});

updatePlayersBtn.addEventListener("click", () => {
  if (!currentRef) {
    return;
  }

  const players = Number(updatePlayersInput.value);

  if (!Number.isFinite(players) || players < 0 || players > 128) {
    showStatus("Počet hráčů musí být mezi 0 a 128.", "error");
    return;
  }

  updatePlayersBtn.disabled = true;

  update(currentRef, { players: Math.floor(players) })
    .then(() => {
      showStatus("Počet hráčů byl aktualizován.", "success");
    })
    .catch((error) => {
      showStatus(`Nepodařilo se aktualizovat počet hráčů: ${error.message}`, "error");
    })
    .finally(() => {
      updatePlayersBtn.disabled = false;
    });
});

loadExistingEntry();
