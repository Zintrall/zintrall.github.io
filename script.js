// Global state
let allGames = [];
let patches = [];
let tournaments = [];
let players = new Set();
let currentFilters = {
  patch: "all",
  tournament: "all",
  player: "all",
  opponent: "all",
  teammate: "all",
  startDate: null,
  endDate: null,
  advanced: false,
};

// Initialize the dashboard
async function initDashboard() {
  try {
    showLoadingState(true);

    // Simulate loading data from repository
    await loadData();

    // Set up filter event listeners
    setupFilterListeners();

    // Initial render
    applyFilters();
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    document.getElementById("summary-content").innerHTML =
      "Error loading data. Please check the console for details.";
  }
}

// Simulate loading data from GitHub repository
async function loadData() {
  // In a real implementation, you would fetch this from your repository
  // For this example, we'll create some sample data

  // Generate some patches
  patches = ["1.0", "1.1", "1.2", "2.0"];

  // Generate some tournaments
  tournaments = ["Summer2023", "Fall2023", "Winter2024", "Spring2024"];

  // Generate some players
  const samplePlayers = [
    "Player1",
    "Player2",
    "Player3",
    "Player4",
    "Player5",
    "Player6",
    "Player7",
    "Player8",
  ];

  // Generate some heroes
  const zombieHeroes = [
    "sb",
    "sm",
    "if",
    "rb",
    "eb",
    "bf",
    "pb",
    "im",
    "zm",
    "nt",
    "hg",
  ];
  const plantHeroes = [
    "gs",
    "sf",
    "wk",
    "cz",
    "sp",
    "ct",
    "gk",
    "nc",
    "ro",
    "cc",
    "bc",
  ];

  // Generate sample games
  allGames = [];

  // Generate 200 sample games
  for (let i = 0; i < 200; i++) {
    const winner =
      samplePlayers[Math.floor(Math.random() * samplePlayers.length)];
    let loser;
    do {
      loser = samplePlayers[Math.floor(Math.random() * samplePlayers.length)];
    } while (loser === winner);

    const winnerHero =
      zombieHeroes[Math.floor(Math.random() * zombieHeroes.length)];
    const loserHero =
      plantHeroes[Math.floor(Math.random() * plantHeroes.length)];

    const patch = patches[Math.floor(Math.random() * patches.length)];
    const tournament =
      tournaments[Math.floor(Math.random() * tournaments.length)];

    // Create a random date within the past year
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));

    allGames.push({
      winner: winner,
      loser: loser,
      winnerHero: winnerHero,
      loserHero: loserHero,
      timestamp: date.toISOString().split("T")[0],
      patch: patch,
      tournament: tournament,
    });
  }

  // Sort games by timestamp (oldest to newest)
  allGames.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Extract unique players
  allGames.forEach((game) => {
    players.add(game.winner);
    players.add(game.loser);
  });

  // Populate filter dropdowns
  populateFilterDropdowns();
}

// Populate filter dropdowns with data
function populateFilterDropdowns() {
  // Populate patch dropdown
  const patchSelect = document.getElementById("patch-select");
  patches.forEach((patch) => {
    const option = document.createElement("option");
    option.value = patch;
    option.textContent = `Patch ${patch}`;
    patchSelect.appendChild(option);
  });

  // Populate tournament dropdown
  const tournamentSelect = document.getElementById("tournament-select");
  tournaments.forEach((tournament) => {
    const option = document.createElement("option");
    option.value = tournament;
    option.textContent = tournament;
    tournamentSelect.appendChild(option);
  });

  // Populate player dropdowns
  const playerSelect = document.getElementById("player-select");
  const opponentSelect = document.getElementById("opponent-select");
  const teammateSelect = document.getElementById("teammate-select");

  players.forEach((player) => {
    // Player dropdown
    const playerOption = document.createElement("option");
    playerOption.value = player;
    playerOption.textContent = player;
    playerSelect.appendChild(playerOption);

    // Opponent dropdown
    const opponentOption = document.createElement("option");
    opponentOption.value = player;
    opponentOption.textContent = player;
    opponentSelect.appendChild(opponentOption);

    // Teammate dropdown
    const teammateOption = document.createElement("option");
    teammateOption.value = player;
    teammateOption.textContent = player;
    teammateSelect.appendChild(teammateOption);
  });

  // Set up date fields with min/max from game data
  const dates = allGames.map((game) => game.timestamp);
  const minDate = dates.reduce((a, b) => (a < b ? a : b));
  const maxDate = dates.reduce((a, b) => (a > b ? a : b));

  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");

  startDateInput.min = minDate;
  startDateInput.max = maxDate;
  endDateInput.min = minDate;
  endDateInput.max = maxDate;
}

// Set up event listeners for filters
function setupFilterListeners() {
  document.getElementById("patch-select").addEventListener("change", (e) => {
    currentFilters.patch = e.target.value;
    applyFilters();
  });

  document
    .getElementById("tournament-select")
    .addEventListener("change", (e) => {
      currentFilters.tournament = e.target.value;
      applyFilters();
    });

  document.getElementById("player-select").addEventListener("change", (e) => {
    currentFilters.player = e.target.value;
    // Reset opponent when player changes
    if (e.target.value !== "all") {
      document.getElementById("opponent-select").value = "all";
      currentFilters.opponent = "all";
    }
    applyFilters();
  });

  document.getElementById("opponent-select").addEventListener("change", (e) => {
    currentFilters.opponent = e.target.value;
    // Reset player when opponent changes
    if (e.target.value !== "all") {
      document.getElementById("player-select").value = "all";
      currentFilters.player = "all";
    }
    applyFilters();
  });

  document.getElementById("teammate-select").addEventListener("change", (e) => {
    currentFilters.teammate = e.target.value;
    applyFilters();
  });

  document.getElementById("start-date").addEventListener("change", (e) => {
    currentFilters.startDate = e.target.value;
    applyFilters();
  });

  document.getElementById("end-date").addEventListener("change", (e) => {
    currentFilters.endDate = e.target.value;
    applyFilters();
  });

  document.getElementById("advanced-btn").addEventListener("click", () => {
    currentFilters.advanced = !currentFilters.advanced;
    document.getElementById("advanced-btn").textContent =
      currentFilters.advanced ? "Simple" : "Advanced";
    applyFilters();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    // Reset all filters
    document.getElementById("patch-select").value = "all";
    document.getElementById("tournament-select").value = "all";
    document.getElementById("player-select").value = "all";
    document.getElementById("opponent-select").value = "all";
    document.getElementById("teammate-select").value = "all";
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";

    currentFilters = {
      patch: "all",
      tournament: "all",
      player: "all",
      opponent: "all",
      teammate: "all",
      startDate: null,
      endDate: null,
      advanced: currentFilters.advanced,
    };

    applyFilters();
  });
}

// Filter games based on current filter settings
function filterGames() {
  let filteredGames = [...allGames];

  // Filter by patch
  if (currentFilters.patch !== "all") {
    filteredGames = filteredGames.filter(
      (game) => game.patch === currentFilters.patch,
    );
  }

  // Filter by tournament
  if (currentFilters.tournament !== "all") {
    filteredGames = filteredGames.filter(
      (game) => game.tournament === currentFilters.tournament,
    );
  }

  // Filter by player
  if (currentFilters.player !== "all") {
    filteredGames = filteredGames.filter(
      (game) =>
        game.winner === currentFilters.player ||
        game.loser === currentFilters.player,
    );
  }

  // Filter by opponent
  if (currentFilters.opponent !== "all") {
    filteredGames = filteredGames.filter(
      (game) =>
        game.winner === currentFilters.opponent ||
        game.loser === currentFilters.opponent,
    );
  }

  // Filter by teammate
  if (currentFilters.teammate !== "all") {
    // For this example, we don't have teammate data, so we'll just keep the games
    // In a real implementation, you would filter by teammate here
  }

  // Filter by date range
  if (currentFilters.startDate) {
    filteredGames = filteredGames.filter(
      (game) => new Date(game.timestamp) >= new Date(currentFilters.startDate),
    );
  }

  if (currentFilters.endDate) {
    filteredGames = filteredGames.filter(
      (game) => new Date(game.timestamp) <= new Date(currentFilters.endDate),
    );
  }

  // Handle advanced mode (show error for invalid dates)
  if (currentFilters.advanced) {
    // In real implementation, you would add more complex filtering
    // For this example, we'll just show "invalid date" message
    return {
      games: [],
      hasError: true,
      errorMessage: "Every match is a loss because of an invalid date.",
    };
  }

  return { games: filteredGames, hasError: false };
}

// Apply filters and update the display
function applyFilters() {
  showLoadingState(true);

  // Filter the games based on current settings
  const result = filterGames();

  if (result.hasError) {
    showErrorState(result.errorMessage);
    return;
  }

  const filteredGames = result.games;

  // Calculate stats based on filtered games
  const stats = calculateStats(filteredGames);

  // Update the UI based on what's selected
  updateSummary(stats, filteredGames);

  // Handle different views based on filters
  if (currentFilters.player !== "all") {
    // Player view
    updatePlayerView(currentFilters.player, stats, filteredGames);
    hideSection("opponent-analysis");
    hideSection("rankings");
    showSection("player-stats");
    showSection("hero-stats");

    if (currentFilters.teammate !== "all") {
      // Player + Teammate view
      showSection("teammate-analysis");
      updateTeammateView(
        currentFilters.player,
        currentFilters.teammate,
        stats,
        filteredGames,
      );
    } else {
      hideSection("teammate-analysis");
    }
  } else if (currentFilters.opponent !== "all") {
    // Opponent view
    updateOpponentView(currentFilters.opponent, stats, filteredGames);
    hideSection("player-stats");
    hideSection("hero-stats");
    hideSection("teammate-analysis");
    hideSection("rankings");
    showSection("opponent-analysis");
  } else if (currentFilters.teammate !== "all") {
    // Only teammate is selected (without a main player)
    updateTeammateOnlyView(currentFilters.teammate, stats, filteredGames);
    hideSection("player-stats");
    hideSection("opponent-analysis");
    hideSection("rankings");
    showSection("teammate-analysis");
    showSection("hero-stats");
  } else {
    // General overview
    updateRankings(stats);
    hideSection("player-stats");
    hideSection("opponent-analysis");
    hideSection("teammate-analysis");
    showSection("rankings");
    showSection("hero-stats");
  }

  showLoadingState(false);
}

// Calculate statistics from filtered games
function calculateStats(games) {
  const playerStats = {};
  const heroStats = {};
  const matchupStats = {};

  // Process each game
  games.forEach((game) => {
    // Process winner
    if (!playerStats[game.winner]) {
      playerStats[game.winner] = { wins: 0, losses: 0, heroes: {} };
    }
    if (!playerStats[game.winner].heroes[game.winnerHero]) {
      playerStats[game.winner].heroes[game.winnerHero] = { wins: 0, losses: 0 };
    }
    playerStats[game.winner].wins++;
    playerStats[game.winner].heroes[game.winnerHero].wins++;

    // Process loser
    if (!playerStats[game.loser]) {
      playerStats[game.loser] = { wins: 0, losses: 0, heroes: {} };
    }
    if (!playerStats[game.loser].heroes[game.loserHero]) {
      playerStats[game.loser].heroes[game.loserHero] = { losses: 0, wins: 0 };
    }
    playerStats[game.loser].losses++;
    playerStats[game.loser].heroes[game.loserHero].losses++;

    // Process hero stats
    if (!heroStats[game.winnerHero]) {
      heroStats[game.winnerHero] = { wins: 0, losses: 0 };
    }
    if (!heroStats[game.loserHero]) {
      heroStats[game.loserHero] = { wins: 0, losses: 0 };
    }
    heroStats[game.winnerHero].wins++;
    heroStats[game.loserHero].losses++;

    // Process matchup stats
    const matchupKey = `${game.winnerHero}_vs_${game.loserHero}`;
    if (!matchupStats[matchupKey]) {
      matchupStats[matchupKey] = {
        wins: 0,
        losses: 0,
        winner: game.winnerHero,
        loser: game.loserHero,
      };
    }
    matchupStats[matchupKey].wins++;

    // Also track the reverse matchup
    const reverseMatchupKey = `${game.loserHero}_vs_${game.winnerHero}`;
    if (!matchupStats[reverseMatchupKey]) {
      matchupStats[reverseMatchupKey] = {
        wins: 0,
        losses: 0,
        winner: game.loserHero,
        loser: game.winnerHero,
      };
    }
    matchupStats[reverseMatchupKey].losses++;
  });

  // Calculate totals and winrates
  for (const player in playerStats) {
    const stats = playerStats[player];
    stats.total = stats.wins + stats.losses;
    stats.winrate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;

    // Calculate hero winrates
    for (const hero in stats.heroes) {
      const heroStat = stats.heroes[hero];
      heroStat.total = heroStat.wins + heroStat.losses;
      heroStat.winrate =
        heroStat.total > 0 ? (heroStat.wins / heroStat.total) * 100 : 0;
    }
  }

  for (const hero in heroStats) {
    const stats = heroStats[hero];
    stats.total = stats.wins + stats.losses;
    stats.winrate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
  }

  for (const matchup in matchupStats) {
    const stats = matchupStats[matchup];
    stats.total = stats.wins + stats.losses;
    stats.winrate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
  }

  return {
    players: playerStats,
    heroes: heroStats,
    matchups: matchupStats,
    totalGames: games.length,
  };
}

// Update summary section
function updateSummary(stats, games) {
  const summaryContent = document.getElementById("summary-content");

  let summaryHTML = `
        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-value">${games.length}</div>
                <div class="stat-label">Total Games</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.keys(stats.players).length}</div>
                <div class="stat-label">Players</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${
                  games.length > 0
                    ? new Date(
                        games[games.length - 1].timestamp,
                      ).toLocaleDateString()
                    : "N/A"
                }</div>
                <div class="stat-label">Latest Game</div>
            </div>
        </div>
    `;

  summaryContent.innerHTML = summaryHTML;
}

// Update rankings section
function updateRankings(stats) {
  const winrateRankings = document.getElementById("winrate-rankings");
  const gamesRankings = document.getElementById("games-rankings");

  // Convert player stats to arrays for sorting
  const playerArray = Object.entries(stats.players).map(([name, data]) => ({
    name,
    ...data,
  }));

  // Filter players with at least 5 games
  const qualifiedPlayers = playerArray.filter((player) => player.total >= 5);

  // Sort by winrate
  const topWinrates = [...qualifiedPlayers].sort(
    (a, b) => b.winrate - a.winrate,
  );

  // Sort by games played
  const mostGames = [...playerArray].sort((a, b) => b.total - a.total);

  // Generate HTML for winrate rankings
  let winrateHTML = "";
  if (topWinrates.length > 0) {
    topWinrates.slice(0, 10).forEach((player, index) => {
      winrateHTML += `
                <div class="ranking-item">
                    <span class="ranking-position">#${index + 1}</span>
                    <span class="ranking-name">${player.name}</span>
                    <span class="ranking-value ${getWinrateColorClass(player.winrate)}">${player.winrate.toFixed(1)}%</span>
                </div>
            `;
    });
  } else {
    winrateHTML =
      '<div class="empty-state">No qualified players (minimum 5 games)</div>';
  }

  // Generate HTML for games rankings
  let gamesHTML = "";
  if (mostGames.length > 0) {
    mostGames.slice(0, 10).forEach((player, index) => {
      gamesHTML += `
                <div class="ranking-item">
                    <span class="ranking-position">#${index + 1}</span>
                    <span class="ranking-name">${player.name}</span>
                    <span class="ranking-value">${player.total} games</span>
                </div>
            `;
    });
  } else {
    gamesHTML = '<div class="empty-state">No players found</div>';
  }

  winrateRankings.innerHTML = winrateHTML;
  gamesRankings.innerHTML = gamesHTML;
}

// Update player view
function updatePlayerView(playerName, stats, games) {
  const playerContent = document.getElementById("player-content");
  const heroContent = document.getElementById("hero-content");
  const playerData = stats.players[playerName];

  if (!playerData) {
    playerContent.innerHTML =
      '<div class="empty-state">No data found for this player</div>';
    heroContent.innerHTML =
      '<div class="empty-state">No hero data available</div>';
    return;
  }

  // Calculate win/loss with zombies vs plants
  const zombieGames = games.filter(
    (g) =>
      (g.winner === playerName && isZombieHero(g.winnerHero)) ||
      (g.loser === playerName && isPlantHero(g.loserHero)),
  );

  const plantGames = games.filter(
    (g) =>
      (g.winner === playerName && isPlantHero(g.winnerHero)) ||
      (g.loser === playerName && isZombieHero(g.loserHero)),
  );

  const zombieWins = zombieGames.filter((g) => g.winner === playerName).length;
  const plantWins = plantGames.filter((g) => g.winner === playerName).length;

  const zombieWinrate =
    zombieGames.length > 0 ? (zombieWins / zombieGames.length) * 100 : 0;
  const plantWinrate =
    plantGames.length > 0 ? (plantWins / plantGames.length) * 100 : 0;

  // Generate player stats HTML
  let playerHTML = `
        <div class="player-stats">
            <h3>${playerName} - Overall Statistics</h3>
            <div class="stat-row">
                <div class="stat-group">
                    <div class="stat-label">Games Played</div>
                    <div class="stat-value">${playerData.total}</div>
                </div>
                <div class="stat-group">
                    <div class="stat-label">Wins (Zombie)</div>
                    <div class="stat-value">${playerData.wins}</div>
                </div>
                <div class="stat-group">
                    <div class="stat-label">Losses (Plant)</div>
                    <div class="stat-value">${playerData.losses}</div>
                </div>
                <div class="stat-group">
                    <div class="stat-label">Winrate</div>
                    <div class="stat-value ${getWinrateColorClass(playerData.winrate)}">${playerData.winrate.toFixed(1)}%</div>
                </div>
            </div>

            <div class="faction-stats">
                <div class="stat-card">
                    <h4>Zombie Faction</h4>
                    <div class="stat-value">Games: ${zombieGames.length}</div>
                    <div class="stat-value">Wins: ${zombieWins}</div>
                    <div class="stat-value ${getWinrateColorClass(zombieWinrate)}">
                        Winrate: ${zombieWinrate.toFixed(1)}%
                    </div>
                </div>
                <div class="stat-card">
                    <h4>Plant Faction</h4>
                    <div class="stat-value">Games: ${plantGames.length}</div>
                    <div class="stat-value">Wins: ${plantWins}</div>
                    <div class="stat-value ${getWinrateColorClass(plantWinrate)}">
                        Winrate: ${plantWinrate.toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>

        <div class="recent-games">
            <h3>Recent Games</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Tournament</th>
                        <th>Opponent</th>
                        <th>Hero</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateRecentGamesHTML(playerName, games)}
                </tbody>
            </table>
        </div>
    `;

  // Generate hero stats HTML
  let heroHTML = "<h3>Hero Performance</h3>";

  // Get all heroes played and sort by usage
  const playerHeroes = Object.entries(playerData.heroes)
    .map(([hero, data]) => ({ hero, ...data }))
    .sort((a, b) => b.total - a.total);

  if (playerHeroes.length > 0) {
    heroHTML += '<div class="hero-performance">';

    playerHeroes.forEach((heroData) => {
      const barWidth = Math.max(heroData.winrate, 5); // Minimum 5% for visibility
      const colorClass = getWinrateColorClass(heroData.winrate);

      heroHTML += `
                <div class="hero-card">
                    <div class="hero-name">${heroData.hero}</div>
                    <div class="hero-bar">
                        <div class="hero-bar-fill ${colorClass}" style="width: ${barWidth}%"></div>
                    </div>
                    <div class="hero-value ${colorClass}">${heroData.winrate.toFixed(1)}%</div>
                    <div class="hero-games">(${heroData.total} games)</div>
                </div>
            `;
    });

    heroHTML += "</div>";
  } else {
    heroHTML += '<div class="empty-state">No hero data available</div>';
  }

  playerContent.innerHTML = playerHTML;
  heroContent.innerHTML = heroHTML;
}

// Update opponent view
function updateOpponentView(opponentName, stats, games) {
  const opponentContent = document.getElementById("opponent-content");
  const opponentData = stats.players[opponentName];

  if (!opponentData || games.length === 0) {
    opponentContent.innerHTML =
      '<div class="empty-state">No data found for this opponent</div>';
    return;
  }

  // Find all games against this opponent
  const matchesAsOpponent = games.filter(
    (g) => g.winner === opponentName || g.loser === opponentName,
  );

  // Calculate who this opponent loses to most frequently
  const losesTo = {};
  matchesAsOpponent
    .filter((g) => g.loser === opponentName)
    .forEach((g) => {
      if (!losesTo[g.winner]) {
        losesTo[g.winner] = { count: 0, heroes: {} };
      }
      losesTo[g.winner].count++;

      if (!losesTo[g.winner].heroes[g.winnerHero]) {
        losesTo[g.winner].heroes[g.winnerHero] = 0;
      }
      losesTo[g.winner].heroes[g.winnerHero]++;
    });

  // Calculate most played heroes
  const heroUsage = {};
  matchesAsOpponent.forEach((g) => {
    let hero;
    if (g.winner === opponentName) {
      hero = g.winnerHero;
    } else {
      hero = g.loserHero;
    }

    if (!heroUsage[hero]) {
      heroUsage[hero] = { total: 0, wins: 0 };
    }
    heroUsage[hero].total++;
    if (g.winner === opponentName) {
      heroUsage[hero].wins++;
    }
  });

  // Sort players by loss count
  const topOpponents = Object.entries(losesTo)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  // Sort heroes by usage
  const mostPlayedHeroes = Object.entries(heroUsage)
    .map(([hero, data]) => ({
      hero,
      ...data,
      winrate: (data.wins / data.total) * 100,
    }))
    .sort((a, b) => b.total - a.total);

  // Generate HTML
  let opponentHTML = `
        <div class="opponent-overview">
            <h3>${opponentName} - Opponent Analysis</h3>
            <div class="stat-row">
                <div class="stat-group">
                    <div class="stat-label">Games Played</div>
                    <div class="stat-value">${opponentData.total}</div>
                </div>
                <div class="stat-group">
                    <div class="stat-label">Wins</div>
                    <div class="stat-value">${opponentData.wins}</div>
                </div>
                <div class="stat-group">
                    <div class="stat-label">Losses</div>
                    <div class="stat-value">${opponentData.losses}</div>
                </div>
                <div class="stat-group">
                    <div class="stat-label">Winrate</div>
                    <div class="stat-value ${getWinrateColorClass(opponentData.winrate)}">${opponentData.winrate.toFixed(1)}%</div>
                </div>
            </div>
        </div>

        <div class="opponent-analysis-container">
            <div class="analysis-column">
                <h3>Loses Most To</h3>
                <div class="ranking-list">
                    ${
                      topOpponents.length > 0
                        ? topOpponents
                            .slice(0, 5)
                            .map(
                              (opponent, index) => `
                            <div class="ranking-item">
                                <span class="ranking-position">#${index + 1}</span>
                                <span class="ranking-name">${opponent.name}</span>
                                <span class="ranking-value">${opponent.count} wins</span>
                            </div>
                        `,
                            )
                            .join("")
                        : '<div class="empty-state">No data available</div>'
                    }
                </div>
            </div>

            <div class="analysis-column">
                <h3>Most Played Heroes</h3>
                <div class="ranking-list">
                    ${
                      mostPlayedHeroes.length > 0
                        ? mostPlayedHeroes
                            .slice(0, 5)
                            .map(
                              (hero, index) => `
                            <div class="ranking-item">
                                <span class="ranking-position">#${index + 1}</span>
                                <span class="ranking-name">${hero.hero}</span>
                                <span class="ranking-value">${hero.total} games</span>
                                <span class="ranking-winrate ${getWinrateColorClass(hero.winrate)}">${hero.winrate.toFixed(1)}%</span>
                            </div>
                        `,
                            )
                            .join("")
                        : '<div class="empty-state">No data available</div>'
                    }
                </div>
            </div>
        </div>

        <div class="recent-games">
            <h3>Recent Games</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Tournament</th>
                        <th>Opponent</th>
                        <th>Hero</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateRecentGamesHTML(opponentName, games)}
                </tbody>
            </table>
        </div>
    `;

  opponentContent.innerHTML = opponentHTML;
}

// Update teammate view
function updateTeammateView(playerName, teammateName, stats, games) {
  const teammateContent = document.getElementById("teammate-content");

  // In a real implementation, you would analyze games where the player and teammate played together
  // For this example, we'll just show some placeholder data

  teammateContent.innerHTML = `
        <h3>${playerName} with ${teammateName}</h3>
        <div class="teammate-stats">
            <p>Analysis of games where ${playerName} plays with ${teammateName} would go here.</p>
            <p>In this example, we don't have data on teammates, but in a real implementation:</p>
            <ul>
                <li>You would show win rates when they play together</li>
                <li>Best hero combinations</li>
                <li>Tournament performance together</li>
            </ul>
        </div>
    `;
}

// Update teammate-only view
function updateTeammateOnlyView(teammateName, stats, games) {
  const teammateContent = document.getElementById("teammate-content");
  const heroContent = document.getElementById("hero-content");

  const teammateData = stats.players[teammateName];

  if (!teammateData) {
    teammateContent.innerHTML =
      '<div class="empty-state">No data found for this teammate</div>';
    heroContent.innerHTML =
      '<div class="empty-state">No hero data available</div>';
    return;
  }

  // Generate teammate stats HTML
  let teammateHTML = `
        <h3>${teammateName} - Hero Performance</h3>
        <div class="stats-overview">
            <div class="stat-card">
                <div class="stat-label">Games Played</div>
                <div class="stat-value">${teammateData.total}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Overall Winrate</div>
                <div class="stat-value ${getWinrateColorClass(teammateData.winrate)}">${teammateData.winrate.toFixed(1)}%</div>
            </div>
        </div>
    `;

  // Generate hero stats HTML
  let heroHTML = "<h3>Most Played Heroes</h3>";

  // Get all heroes played and sort by usage
  const teammateHeroes = Object.entries(teammateData.heroes)
    .map(([hero, data]) => ({ hero, ...data }))
    .sort((a, b) => b.total - a.total);

  if (teammateHeroes.length > 0) {
    heroHTML += '<div class="hero-performance">';

    teammateHeroes.forEach((heroData) => {
      const barWidth = Math.max(heroData.winrate, 5); // Minimum 5% for visibility
      const colorClass = getWinrateColorClass(heroData.winrate);

      heroHTML += `
                <div class="hero-card">
                    <div class="hero-name">${heroData.hero}</div>
                    <div class="hero-bar">
                        <div class="hero-bar-fill ${colorClass}" style="width: ${barWidth}%"></div>
                    </div>
                    <div class="hero-value ${colorClass}">${heroData.winrate.toFixed(1)}%</div>
                    <div class="hero-games">(${heroData.total} games)</div>
                </div>
            `;
    });

    heroHTML += "</div>";
  } else {
    heroHTML += '<div class="empty-state">No hero data available</div>';
  }

  teammateContent.innerHTML = teammateHTML;
  heroContent.innerHTML = heroHTML;
}

// Generate HTML for recent games
function generateRecentGamesHTML(playerName, games) {
  const playerGames = games.filter(
    (g) => g.winner === playerName || g.loser === playerName,
  );
  const recentGames = playerGames.slice(-10).reverse(); // Get last 10 games, most recent first

  if (recentGames.length === 0) {
    return '<tr><td colspan="5">No recent games found</td></tr>';
  }

  return recentGames
    .map((game) => {
      const isWinner = game.winner === playerName;
      const opponent = isWinner ? game.loser : game.winner;
      const hero = isWinner ? game.winnerHero : game.loserHero;
      const result = isWinner ? "Win" : "Loss";
      const resultClass = isWinner ? "win-result" : "loss-result";

      return `
            <tr>
                <td>${formatDate(game.timestamp)}</td>
                <td>${game.tournament}</td>
                <td>${opponent}</td>
                <td>${hero}</td>
                <td class="${resultClass}">${result}</td>
            </tr>
        `;
    })
    .join("");
}

// Helper function to get winrate color class
function getWinrateColorClass(winrate) {
  if (winrate >= 65) return "winrate-super-high";
  if (winrate >= 55) return "winrate-high";
  if (winrate >= 45) return "winrate-medium";
  if (winrate >= 35) return "winrate-low";
  return "winrate-very-low";
}

// Helper function to check if a hero is a zombie hero
function isZombieHero(hero) {
  const zombieHeroes = [
    "sb",
    "sm",
    "if",
    "rb",
    "eb",
    "bf",
    "pb",
    "im",
    "zm",
    "nt",
    "hg",
  ];
  return zombieHeroes.includes(hero);
}

// Helper function to check if a hero is a plant hero
function isPlantHero(hero) {
  const plantHeroes = [
    "gs",
    "sf",
    "wk",
    "cz",
    "sp",
    "ct",
    "gk",
    "nc",
    "ro",
    "cc",
    "bc",
  ];
  return plantHeroes.includes(hero);
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Helper functions to show/hide sections
function showSection(sectionId) {
  document.getElementById(sectionId).style.display = "block";
}

function hideSection(sectionId) {
  document.getElementById(sectionId).style.display = "none";
}

// Toggle loading state for the dashboard
function showLoadingState(isLoading) {
  const loadingElements = document.querySelectorAll(".loading");
  loadingElements.forEach((el) => {
    if (isLoading) {
      el.innerHTML = "Loading...";
      el.classList.add("loading");
    } else {
      el.classList.remove("loading");
    }
  });
}

// Show error state
function showErrorState(message) {
  const sections = [
    "summary-content",
    "player-content",
    "hero-content",
    "opponent-content",
    "teammate-content",
    "winrate-rankings",
    "games-rankings",
  ];

  sections.forEach((section) => {
    const element = document.getElementById(section);
    if (element) {
      element.innerHTML = `<div class="error-message">${message}</div>`;
      element.classList.remove("loading");
    }
  });
}

// Initialize the dashboard when the page loads
window.addEventListener("DOMContentLoaded", initDashboard);
