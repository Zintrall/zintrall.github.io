/**
 * Utility functions for PVZ Heroes Winrate Analyzer
 */

// Color utility functions
function getWinrateColor(winrate) {
  // Return precise color based on winrate percentage
  if (winrate <= 35) {
    const intensity = Math.max(0, winrate / 35) * 255;
    return `rgb(211, 47, 47)`;
  } else if (winrate <= 45) {
    const position = (winrate - 35) / 10; // 0 to 1 within this range
    const r = Math.round(211 - position * (211 - 245));
    const g = Math.round(47 + position * (124 - 47));
    const b = Math.round(47 + position * (0 - 47));
    return `rgb(${r}, ${g}, ${b})`;
  } else if (winrate <= 55) {
    const position = (winrate - 45) / 10; // 0 to 1 within this range
    const r = Math.round(245 - position * (245 - 251));
    const g = Math.round(124 + position * (192 - 124));
    const b = Math.round(0 + position * (45 - 0));
    return `rgb(${r}, ${g}, ${b})`;
  } else if (winrate <= 65) {
    const position = (winrate - 55) / 10; // 0 to 1 within this range
    const r = Math.round(251 - position * (251 - 124));
    const g = Math.round(192 - position * (192 - 179));
    const b = Math.round(45 - position * (45 - 66));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const position = Math.min(1, (winrate - 65) / 35); // 0 to 1 within this range
    const r = Math.round(124 - position * (124 - 46));
    const g = Math.round(179 - position * (179 - 125));
    const b = Math.round(66 - position * (66 - 50));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Date formatting
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Compare dates
function isDateInRange(dateStr, startDate, endDate) {
  const date = new Date(dateStr);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && end) {
    return date >= start && date <= end;
  } else if (start) {
    return date >= start;
  } else if (end) {
    return date <= end;
  }
  return true;
}

// Export to CSV
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;

  let csv = [];
  const rows = table.querySelectorAll("tr");

  for (let i = 0; i < rows.length; i++) {
    const row = [],
      cols = rows[i].querySelectorAll("td, th");

    for (let j = 0; j < cols.length; j++) {
      // Handle special cells with diagonal content
      if (cols[j].classList.contains("winrate-cell")) {
        const topLeft = cols[j].querySelector(".cell-top-left");
        const bottomRight = cols[j].querySelector(".cell-bottom-right");

        if (topLeft && bottomRight) {
          row.push(`${topLeft.textContent}|${bottomRight.textContent}`);
        } else {
          row.push(cols[j].innerText.replace(/,/g, " ").trim());
        }
      } else {
        row.push('"' + cols[j].innerText.replace(/"/g, '""').trim() + '"');
      }
    }
    csv.push(row.join(","));
  }

  // Download CSV file
  downloadCSV(csv.join("\n"), filename);
}

function downloadCSV(csv, filename) {
  const csvFile = new Blob([csv], { type: "text/csv" });
  const downloadLink = document.createElement("a");

  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Local storage functions for deck library
function saveDeckLibrary(deckLibrary) {
  localStorage.setItem("pvzh_deck_library", JSON.stringify(deckLibrary));
}

function loadDeckLibrary() {
  const library = localStorage.getItem("pvzh_deck_library");
  return library ? JSON.parse(library) : [];
}

// Export to image
function exportTableToImage(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;

  html2canvas(table)
    .then((canvas) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    })
    .catch((err) => {
      console.error("Failed to export table as image:", err);
      alert("Failed to export as image. Please try again.");
    });
}

// Helper for getting full hero name
function getFullHeroName(heroCode) {
  return heroData[heroCode]
    ? heroData[heroCode].fullName
    : heroCode.toUpperCase();
}

// Helper to determine if a hero is plant or zombie
function isPlantHero(heroCode) {
  return heroData[heroCode] && heroData[heroCode].type === "plant";
}

// Function to sort heroes - plants first then zombies
function sortHeroes(heroes) {
  return heroes.sort((a, b) => {
    const aIsPlant = isPlantHero(a);
    const bIsPlant = isPlantHero(b);

    if (aIsPlant && !bIsPlant) return -1;
    if (!aIsPlant && bIsPlant) return 1;
    return getFullHeroName(a).localeCompare(getFullHeroName(b));
  });
}

// Function to get an array of all unique tournaments from the data files
async function getAllTournaments() {
  const tournaments = new Set();

  try {
    const response = await fetch("tournaments.json");
    if (response.ok) {
      const data = await response.json();
      data.forEach((tournament) => tournaments.add(tournament));
    } else {
      console.error("Failed to load tournaments list");
      // Fallback to hardcoded list if available
      tournaments.add("Quicksand Live");
      tournaments.add("Quicksand Ranked");
    }
  } catch (error) {
    console.error("Error loading tournaments:", error);
    // Fallback to hardcoded list if error occurs
    tournaments.add("Quicksand Live");
    tournaments.add("Quicksand Ranked");
  }

  return Array.from(tournaments).sort();
}

// Function to get all patch names
async function getAllPatches() {
  const patches = new Set();

  try {
    const response = await fetch("patches.json");
    if (response.ok) {
      const data = await response.json();
      data.forEach((patch) => patches.add(patch));
    } else {
      console.error("Failed to load patches list");
      // Add fallback patches
      patches.add("p1");
      patches.add("p2");
    }
  } catch (error) {
    console.error("Error loading patches:", error);
  }

  return Array.from(patches).sort();
}

// Function to load player names
async function loadPlayerNames() {
  try {
    const response = await fetch("playernames.txt");
    if (!response.ok) throw new Error("Failed to load player names");

    const text = await response.text();
    return text
      .trim()
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name);
  } catch (error) {
    console.error("Error loading player names:", error);
    return [];
  }
}
