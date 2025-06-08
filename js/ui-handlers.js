/**
 * UI handlers for PVZ Heroes Winrate Analyzer
 */

// UI event handlers
document.addEventListener("DOMContentLoaded", () => {
  // Tab functionality
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.getAttribute("data-tab");

      // Update active tab
      document
        .querySelectorAll(".tab-btn")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Theme is fixed to dark mode

  // Show/hide custom date filter based on checkbox
  document
    .getElementById("use-custom-date")
    .addEventListener("change", function () {
      document.getElementById("custom-date-filter").style.display = this.checked
        ? "block"
        : "none";
      document.getElementById("patches-filter").style.display = this.checked
        ? "none"
        : "block";
    });

  // Show more/less player rankings
  document
    .getElementById("show-more-winrate")
    .addEventListener("click", function () {
      showMoreRows("player-winrate-table");
      this.style.display = "none";
      document.getElementById("show-less-winrate").style.display =
        "inline-block";
    });

  document
    .getElementById("show-less-winrate")
    .addEventListener("click", function () {
      showLessRows("player-winrate-table");
      this.style.display = "none";
      document.getElementById("show-more-winrate").style.display =
        "inline-block";
    });

  document
    .getElementById("show-more-games")
    .addEventListener("click", function () {
      showMoreRows("player-games-table");
      this.style.display = "none";
      document.getElementById("show-less-games").style.display = "inline-block";
    });

  document
    .getElementById("show-less-games")
    .addEventListener("click", function () {
      showLessRows("player-games-table");
      this.style.display = "none";
      document.getElementById("show-more-games").style.display = "inline-block";
    });

  // Toggle experimental modal
  // document.getElementById('toggle-experimental').addEventListener('click', () => {
  //     document.getElementById('experimental-modal').style.display = 'block';
  // });

  // Close modals
  document.querySelectorAll(".close-modal").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.style.display = "none";
      });
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });

  // Export as CSV
  document.getElementById("export-csv").addEventListener("click", () => {
    const activeTab = document
      .querySelector(".tab-btn.active")
      .getAttribute("data-tab");

    if (activeTab === "hero-winrate") {
      exportTableToCSV("winrate-table", "pvzh_hero_winrates.csv");
    } else if (activeTab === "player-winrate") {
      exportTableToCSV("player-winrate-table", "pvzh_player_winrates.csv");
    }
  });

  // Experimental deck library controls
  document.getElementById("add-deck").addEventListener("click", addNewDeck);
  document
    .getElementById("save-library")
    .addEventListener("click", saveLibraryToFile);
  document.getElementById("load-library").addEventListener("click", () => {
    document.getElementById("load-library-file").click();
  });

  document
    .getElementById("load-library-file")
    .addEventListener("change", loadLibraryFromFile);

  // Select all / deselect all buttons
  document
    .getElementById("select-all-patches")
    .addEventListener("click", () => {
      toggleAllCheckboxes("patches-container", true);
    });

  document
    .getElementById("deselect-all-patches")
    .addEventListener("click", () => {
      toggleAllCheckboxes("patches-container", false);
    });

  document
    .getElementById("select-all-tournaments")
    .addEventListener("click", () => {
      toggleAllCheckboxes("tournaments-container", true);
    });

  document
    .getElementById("deselect-all-tournaments")
    .addEventListener("click", () => {
      toggleAllCheckboxes("tournaments-container", false);
    });

  document
    .getElementById("select-all-players")
    .addEventListener("click", () => {
      toggleAllCheckboxes("players-container", true);
    });

  document
    .getElementById("deselect-all-players")
    .addEventListener("click", () => {
      toggleAllCheckboxes("players-container", false);
    });

  // Player search filter
  document
    .getElementById("player-search")
    .addEventListener("input", function () {
      filterPlayerCheckboxes(this.value);
    });

  // Data type radio buttons change
  document.querySelectorAll('input[name="data-type"]').forEach((radio) => {
    radio.addEventListener("change", updatePlayerSelectionVisibility);
  });
});

// Helper functions for UI
function showMoreRows(tableId) {
  const table = document.getElementById(tableId);
  const rows = table.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    row.style.display = "";
  });
}

function showLessRows(tableId) {
  const table = document.getElementById(tableId);
  const rows = table.querySelectorAll("tbody tr");

  rows.forEach((row, index) => {
    if (index >= 5) {
      row.style.display = "none";
    }
  });
}

function toggleAllCheckboxes(containerId, checked) {
  const checkboxes = document.querySelectorAll(
    `#${containerId} input[type="checkbox"]`,
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = checked;
  });
}

function filterPlayerCheckboxes(searchText) {
  const container = document.getElementById("players-container");
  const checkboxDivs = container.querySelectorAll("div");

  const searchLower = searchText.toLowerCase();

  checkboxDivs.forEach((div) => {
    const label = div.querySelector("label");
    if (label) {
      const playerName = label.textContent.toLowerCase();
      if (playerName.includes(searchLower) || searchLower === "") {
        div.style.display = "";
      } else {
        div.style.display = "none";
      }
    }
  });
}

function updatePlayerSelectionVisibility() {
  const dataType = document.querySelector(
    'input[name="data-type"]:checked',
  ).value;
  const playerFilter = document.getElementById("players-filter");

  if (dataType === "player-stats") {
    // Change to select only one player
    setupSinglePlayerSelection(window.playerNames || []);
  } else {
    // Revert to multi-selection
    setupMultiPlayerSelection(window.playerNames || []);
  }
}

function setupSinglePlayerSelection(playerList) {
  const container = document.getElementById("players-container");
  const currentCheckboxes = container.querySelectorAll(
    'input[type="checkbox"]',
  );

  // Store the current state before clearing
  const checkedPlayers = [];
  currentCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      checkedPlayers.push(checkbox.value);
    }
  });

  // Use provided player list or fetch from window
  const allPlayers =
    playerList && playerList.length > 0 ? playerList : window.playerNames || [];

  // Clear the container
  container.innerHTML = "";

  // Create radio buttons
  allPlayers.forEach((player) => {
    const div = document.createElement("div");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "player-selection";
    radio.value = player;
    radio.id = `player-radio-${player}`;

    // Check the first player that was previously checked, if any
    if (
      checkedPlayers.includes(player) &&
      !container.querySelector("input:checked")
    ) {
      radio.checked = true;
    }

    const label = document.createElement("label");
    label.htmlFor = `player-radio-${player}`;
    label.textContent = player;

    div.appendChild(radio);
    div.appendChild(label);
    container.appendChild(div);
  });

  // Re-apply any active search filter
  const searchText = document.getElementById("player-search").value;
  if (searchText) {
    filterPlayerCheckboxes(searchText);
  }
}

function setupMultiPlayerSelection(playerList) {
  const container = document.getElementById("players-container");
  const currentRadios = container.querySelectorAll('input[type="radio"]');

  // Store the current state before clearing
  let checkedPlayer = "";
  currentRadios.forEach((radio) => {
    if (radio.checked) {
      checkedPlayer = radio.value;
    }
  });

  // Clear the container
  container.innerHTML = "";

  // Use provided player list or fetch from window
  const allPlayers =
    playerList && playerList.length > 0 ? playerList : window.playerNames || [];

  // Create checkboxes for all players
  allPlayers.forEach((player) => {
    const div = document.createElement("div");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = player;
    checkbox.id = `player-checkbox-${player}`;

    // Check the player that was previously selected as radio, if any
    if (player === checkedPlayer) {
      checkbox.checked = true;
    }

    const label = document.createElement("label");
    label.htmlFor = `player-checkbox-${player}`;
    label.textContent = player;

    div.appendChild(checkbox);
    div.appendChild(label);
    container.appendChild(div);
  });

  // Re-apply any active search filter
  const searchText = document.getElementById("player-search").value;
  if (searchText) {
    filterPlayerCheckboxes(searchText);
  }
}

// Experimental deck library functions
function addNewDeck() {
  const deckList = document.getElementById("deck-list");
  const deckId = `deck-${Date.now()}`;

  const deckItem = document.createElement("div");
  deckItem.className = "deck-item";
  deckItem.dataset.deckId = deckId;

  deckItem.innerHTML = `
        <input type="text" class="deck-name-input" placeholder="Enter deck name" data-deck-id="${deckId}">
        <div class="alias-container" id="alias-container-${deckId}"></div>
        <div class="deck-controls">
            <button class="deck-control-btn add-alias" data-deck-id="${deckId}">Add Alias</button>
            <button class="deck-control-btn remove-deck" data-deck-id="${deckId}">Remove</button>
        </div>
    `;

  deckList.appendChild(deckItem);

  // Add event listeners to new deck controls
  deckItem
    .querySelector(".add-alias")
    .addEventListener("click", () => addAlias(deckId));
  deckItem
    .querySelector(".remove-deck")
    .addEventListener("click", () => removeDeck(deckId));
}

function addAlias(deckId) {
  const aliasContainer = document.getElementById(`alias-container-${deckId}`);
  const aliasId = `alias-${Date.now()}`;

  const aliasDiv = document.createElement("div");
  aliasDiv.className = "alias-item";
  aliasDiv.innerHTML = `
        <input type="text" class="alias-input" placeholder="Enter deck alias" data-alias-id="${aliasId}">
        <button class="remove-alias" data-alias-id="${aliasId}">×</button>
    `;

  aliasContainer.appendChild(aliasDiv);

  // Add event listener to remove button
  aliasDiv.querySelector(".remove-alias").addEventListener("click", () => {
    aliasDiv.remove();
  });
}

function removeDeck(deckId) {
  const deckItem = document.querySelector(
    `.deck-item[data-deck-id="${deckId}"]`,
  );
  if (deckItem) {
    deckItem.remove();
  }
}

function getDeckLibrary() {
  const deckItems = document.querySelectorAll(".deck-item");
  const library = [];

  deckItems.forEach((item) => {
    const deckId = item.dataset.deckId;
    const nameInput = item.querySelector(".deck-name-input");
    const name = nameInput.value.trim();

    if (name) {
      const aliases = [];
      const aliasInputs = item.querySelectorAll(".alias-input");

      aliasInputs.forEach((input) => {
        const aliasText = input.value.trim();
        if (aliasText) {
          aliases.push(aliasText);
        }
      });

      library.push({ id: deckId, name, aliases });
    }
  });

  return library;
}

function saveLibraryToFile() {
  const library = getDeckLibrary();
  if (library.length === 0) {
    alert("Deck library is empty!");
    return;
  }

  // Save to localStorage
  saveDeckLibrary(library);

  // Save to file
  const dataStr = JSON.stringify(library, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "pvzh_deck_library.json";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function loadLibraryFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const library = JSON.parse(e.target.result);
      displayLoadedLibrary(library);
      saveDeckLibrary(library);
    } catch (error) {
      alert("Failed to load deck library file. The file may be corrupted.");
      console.error(error);
    }
  };

  reader.readAsText(file);
}

function displayLoadedLibrary(library) {
  const deckList = document.getElementById("deck-list");
  deckList.innerHTML = "";

  library.forEach((deck) => {
    const deckId =
      deck.id ||
      `deck-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const deckItem = document.createElement("div");
    deckItem.className = "deck-item";
    deckItem.dataset.deckId = deckId;

    deckItem.innerHTML = `
            <input type="text" class="deck-name-input" placeholder="Enter deck name" value="${deck.name}" data-deck-id="${deckId}">
            <div class="alias-container" id="alias-container-${deckId}"></div>
            <div class="deck-controls">
                <button class="deck-control-btn add-alias" data-deck-id="${deckId}">Add Alias</button>
                <button class="deck-control-btn remove-deck" data-deck-id="${deckId}">Remove</button>
            </div>
        `;

    deckList.appendChild(deckItem);

    // Add aliases
    const aliasContainer = deckItem.querySelector(`.alias-container`);
    if (deck.aliases && deck.aliases.length > 0) {
      deck.aliases.forEach((alias) => {
        const aliasId = `alias-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const aliasDiv = document.createElement("div");
        aliasDiv.className = "alias-item";
        aliasDiv.innerHTML = `
                    <input type="text" class="alias-input" placeholder="Enter deck alias" value="${alias}" data-alias-id="${aliasId}">
                    <button class="remove-alias" data-alias-id="${aliasId}">×</button>
                `;

        aliasContainer.appendChild(aliasDiv);

        // Add event listener to remove button
        aliasDiv
          .querySelector(".remove-alias")
          .addEventListener("click", () => {
            aliasDiv.remove();
          });
      });
    }

    // Add event listeners to deck controls
    deckItem
      .querySelector(".add-alias")
      .addEventListener("click", () => addAlias(deckId));
    deckItem
      .querySelector(".remove-deck")
      .addEventListener("click", () => removeDeck(deckId));
  });
}
