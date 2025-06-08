/**
 * Main application code for PVZ Heroes Winrate Analyzer
 */

// Global state
let gameData = new GameData();
let playerNames = [];
let availablePatches = [];
let availableTournaments = [];
let deckLibrary = [];

// Make playerNames globally accessible
window.playerNames = [];

// Initialize the application
async function initializeApp() {
    try {
        // Load player names
        playerNames = await loadPlayerNames();
        window.playerNames = [...playerNames]; // Make available globally
        
        // Load patches and tournaments
        availablePatches = await getAllPatches();
        
        // Initialize UI components
        await initializeFilters();
        setupEventListeners();
        
        // Load saved deck library from localStorage
        deckLibrary = loadDeckLibrary();
        if (deckLibrary.length > 0) {
            displayLoadedLibrary(deckLibrary);
        }
        
        // Hide loading indicator if it exists
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('An error occurred while initializing the application. Please try refreshing the page.');
    }
}

// Initialize filter options
async function initializeFilters() {
    // Populate patch checkboxes
    const patchesContainer = document.getElementById('patches-container');
    patchesContainer.innerHTML = '';
    
    availablePatches.forEach(patch => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `patch-${patch}`;
        checkbox.value = patch;
        checkbox.name = 'patches';
        
        const label = document.createElement('label');
        label.htmlFor = `patch-${patch}`;
        label.textContent = `Patch ${patch.replace('p', '')}`;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        patchesContainer.appendChild(div);
    });
    
    // Also populate experimental patches
    const expPatchesContainer = document.getElementById('exp-patches-container');
    expPatchesContainer.innerHTML = patchesContainer.innerHTML;
    
    // Populate tournaments checkboxes
    await populateTournamentsForSelectedPatches();
    
    // Populate players
    populatePlayerCheckboxes(playerNames);
}

// Populate tournaments based on selected patches
async function populateTournamentsForSelectedPatches() {
    const selectedPatches = getSelectedPatches();
    const tournamentsContainer = document.getElementById('tournaments-container');
    tournamentsContainer.innerHTML = '';
    
    // Get all tournaments from all selected patches
    availableTournaments = [];
    for (const patch of selectedPatches) {
        try {
            const patchTournaments = await gameData.fetchTournamentsForPatch(patch);
            patchTournaments.forEach(tournament => {
                if (!availableTournaments.includes(tournament)) {
                    availableTournaments.push(tournament);
                }
            });
        } catch (error) {
            console.error(`Failed to fetch tournaments for patch ${patch}:`, error);
        }
    }
    
    // Sort tournaments alphabetically
    availableTournaments.sort();
    
    // Create checkboxes for each tournament
    availableTournaments.forEach(tournament => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `tournament-${tournament}`;
        checkbox.value = tournament;
        checkbox.name = 'tournaments';
        
        const label = document.createElement('label');
        label.htmlFor = `tournament-${tournament}`;
        label.textContent = tournament;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        tournamentsContainer.appendChild(div);
    });
    
    // Also populate experimental tournaments
    const expTournamentsContainer = document.getElementById('exp-tournaments-container');
    expTournamentsContainer.innerHTML = tournamentsContainer.innerHTML;
}

// Populate player checkboxes
function populatePlayerCheckboxes(players) {
    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = '';
    
    // Sort player names alphabetically
    players.sort();
    
    // Store players in global scope so we can access them when changing display type
    window.playerNames = [...players];
    playerNames = [...players];
    
    players.forEach(player => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `player-${player}`;
        checkbox.value = player;
        checkbox.name = 'players';
        
        const label = document.createElement('label');
        label.htmlFor = `player-${player}`;
        label.textContent = player;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        playersContainer.appendChild(div);
    });
    
    // Also populate experimental players
    const expPlayersContainer = document.getElementById('exp-players-container');
    expPlayersContainer.innerHTML = playersContainer.innerHTML;
}

// Set up event listeners
function setupEventListeners() {
    // Patch checkboxes change - update tournaments
    const patchCheckboxes = document.querySelectorAll('#patches-container input[type="checkbox"]');
    patchCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', populateTournamentsForSelectedPatches);
    });
    
    // Generate report button
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    // Generate deck report button
    document.getElementById('generate-deck-report').addEventListener('click', generateDeckReport);
}

// Get selected patches
function getSelectedPatches() {
    const useCustomDate = document.getElementById('use-custom-date').checked;
    if (useCustomDate) {
        return availablePatches; // Use all patches when custom date is selected
    }
    
    const checkboxes = document.querySelectorAll('#patches-container input[type="checkbox"]:checked');
    const selectedPatches = Array.from(checkboxes).map(checkbox => checkbox.value);
    
    // If nothing selected, use all patches
    return selectedPatches.length > 0 ? selectedPatches : availablePatches;
}

// Get selected tournaments
function getSelectedTournaments() {
    const checkboxes = document.querySelectorAll('#tournaments-container input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// Get selected players
function getSelectedPlayers() {
    const dataType = document.querySelector('input[name="data-type"]:checked').value;
    
    if (dataType === 'player-stats') {
        // For player stats, we need to check if we're using the radio buttons
        const radioButton = document.querySelector('#players-container input[type="radio"]:checked');
        if (radioButton) {
            return [radioButton.value];
        } else {
            // Fallback to first checked checkbox if radio buttons haven't been set up yet
            const checkbox = document.querySelector('#players-container input[type="checkbox"]:checked');
            return checkbox ? [checkbox.value] : [];
        }
    } else {
        // For other views, we use checkboxes
        const checkboxes = document.querySelectorAll('#players-container input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }
}

// Get custom date range
function getCustomDateRange() {
    const useCustomDate = document.getElementById('use-custom-date').checked;
    if (!useCustomDate) {
        return { startDate: null, endDate: null };
    }
    
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    return { startDate, endDate };
}

// Generate the report
async function generateReport() {
    // Show loading spinner
    document.getElementById('loading-spinner').style.display = 'flex';
    document.getElementById('no-data-message').style.display = 'none';
    document.getElementById('data-container').style.display = 'none';
        
    try {
        // Get selected filters
        const selectedPatches = getSelectedPatches();
        const selectedTournaments = getSelectedTournaments();
        const selectedPlayers = getSelectedPlayers();
        const { startDate, endDate } = getCustomDateRange();
        const dataType = document.querySelector('input[name="data-type"]:checked').value;
            
        // Load game data
        await gameData.loadData(selectedPatches, selectedTournaments, startDate, endDate);
            
        // Process data based on selected display type
        if (dataType === 'players-default') {
            const filteredGames = gameData.filterGamesForPlayers(selectedPlayers);
            await displayHeroWinrates(filteredGames);
            await displayPlayerRankings(filteredGames);
            // Show player rankings tab
            document.querySelector('.tab-btn[data-tab="player-winrate"]').style.display = 'block';
        } else if (dataType === 'player-stats') {
            await displayPlayerStatsModal(selectedPlayers[0]); // Will show error message if no player selected
            // Hide player rankings tab in player stats view
            document.querySelector('.tab-btn[data-tab="player-winrate"]').style.display = 'none';
        } else if (dataType === 'custom-battles') {
            const battleGames = gameData.getMatchesBetweenPlayers(selectedPlayers);
            await displayHeroWinrates(battleGames);
            await displayPlayerRankings(battleGames);
            // Show player rankings tab
            document.querySelector('.tab-btn[data-tab="player-winrate"]').style.display = 'block';
        }
        
        // Show data container
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('data-container').style.display = 'block';
    } catch (error) {
        console.error('Error generating report:', error);
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('no-data-message').style.display = 'flex';
        document.getElementById('no-data-message').innerHTML = `<p>An error occurred while generating the report:<br>${error.message}</p>`;
    }
}

// Generate deck report for experimental feature
async function generateDeckReport() {
    // Get selected filters from experimental modal
    const checkboxes = document.querySelectorAll('#exp-patches-container input[type="checkbox"]:checked');
    const selectedPatches = Array.from(checkboxes).map(checkbox => checkbox.value);
    
    const tournamentCheckboxes = document.querySelectorAll('#exp-tournaments-container input[type="checkbox"]:checked');
    const selectedTournaments = Array.from(tournamentCheckboxes).map(checkbox => checkbox.value);
    
    const playerCheckboxes = document.querySelectorAll('#exp-players-container input[type="checkbox"]:checked');
    const selectedPlayers = Array.from(playerCheckboxes).map(checkbox => checkbox.value);
    
    const startDate = document.getElementById('exp-start-date').value;
    const endDate = document.getElementById('exp-end-date').value;
    
    // Get deck library
    const library = getDeckLibrary();
    if (library.length === 0) {
        alert('Please add at least one deck to your library first.');
        return;
    }
    
    // Show loading indicator or something
    document.getElementById('experimental-modal').style.display = 'none';
    document.getElementById('loading-spinner').style.display = 'flex';
    document.getElementById('no-data-message').style.display = 'none';
    document.getElementById('data-container').style.display = 'none';
    
    try {
        // Load data
        await gameData.loadData(selectedPatches, selectedTournaments, startDate, endDate);
        
        // Process deck stats
        const deckStats = gameData.getDeckStatsForPlayers(selectedPlayers, library);
        
        // Display deck stats
        displayDeckStats(deckStats);
        
        // Show data
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('data-container').style.display = 'block';
    } catch (error) {
        console.error('Error generating deck report:', error);
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('no-data-message').style.display = 'flex';
        document.getElementById('no-data-message').innerHTML = `<p>An error occurred while generating the deck report:<br>${error.message}</p>`;
    }
}

// Display hero winrates in the table
async function displayHeroWinrates(games) {
    // If no games data, show message and return
    if (!games || games.length === 0) {
        document.getElementById('no-data-message').style.display = 'flex';
        document.getElementById('no-data-message').innerHTML = '<p>No game data available for the selected filters</p>';
        document.getElementById('data-container').style.display = 'none';
        document.getElementById('loading-spinner').style.display = 'none';
        return;
    }

    // Create temporary GameData object with just the filtered games
    const tempGameData = new GameData();
    tempGameData.games = games;
    
    // Extract unique heroes from the games
    games.forEach(game => {
        tempGameData.heroes.add(game.winningHero);
        tempGameData.heroes.add(game.losingHero);
    });
    
    // Filter heroes to ensure we have the 11x11 grid (all heroes)
    const plantHeroes = ["gs", "sf", "wk", "cz", "sp", "ct", "gk", "nc", "ro", "cc", "bc"];
    const zombieHeroes = ["sb", "sm", "if", "rb", "eb", "bf", "pb", "im", "zm", "nt", "hg"];
    
    // Add all heroes to the set even if they weren't in games
    plantHeroes.forEach(hero => tempGameData.heroes.add(hero));
    zombieHeroes.forEach(hero => tempGameData.heroes.add(hero));
    
    // Get matchup data
    const matchupData = tempGameData.getHeroMatchupData();
    
    // Create the table
    const table = document.getElementById('winrate-table');
    table.innerHTML = '';
    
    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Empty corner cell
    const cornerCell = document.createElement('th');
    headerRow.appendChild(cornerCell);
    
    // Hero columns - only zombie heroes
    zombieHeroes.forEach(hero => {
        const th = document.createElement('th');
        th.className = 'zombie-hero';
        th.textContent = getFullHeroName(hero);
        headerRow.appendChild(th);
    });
    
    // Total column
    const totalHeader = document.createElement('th');
    totalHeader.textContent = 'Total';
    headerRow.appendChild(totalHeader);
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Create rows for each plant hero
    plantHeroes.forEach(plantHero => {
        const row = document.createElement('tr');
        
        // Row header (hero name)
        const rowHeader = document.createElement('th');
        rowHeader.className = 'plant-hero';
        rowHeader.textContent = getFullHeroName(plantHero);
        row.appendChild(rowHeader);
        
        // Hero matchup cells
        let totalPlantWins = 0;
        let totalMatchups = 0;
        
        // Create all cells for this row at once to ensure proper horizontal layout
        const cells = [];
        
        // Calculate all matchups first
        zombieHeroes.forEach(zombieHero => {
            const cell = document.createElement('td');
            cell.className = 'winrate-cell single-winrate';
            
            // Calculate from plant hero perspective
            // To get plant winrate, we need to find matches where plant hero won against zombie hero
            const plantMatchup = matchupData[plantHero][zombieHero] || { wins: 0, total: 0 };
            const zombieMatchup = matchupData[zombieHero][plantHero] || { wins: 0, total: 0 };
            
            // Total games between these heroes
            const totalGames = plantMatchup.total + zombieMatchup.wins;
            
            if (totalGames > 0) {
                // Calculate plant winrate
                const plantWins = plantMatchup.wins;
                const plantWinRate = (plantWins / totalGames) * 100;
                
                // Create the cell content
                cell.style.backgroundColor = getWinrateColor(plantWinRate);
                cell.innerHTML = `<div class="cell-winrate">${plantWinRate.toFixed(1)}%</div>
                                  <div class="cell-games">(${totalGames} games)</div>`;
                
                // Update totals for this plant hero
                totalPlantWins += plantWins;
                totalMatchups += totalGames;
            } else {
                cell.innerHTML = '<div style="text-align: center; line-height: 60px;">-</div>';
            }
            
            cells.push(cell);
        });
        
        // Add all cells to the row in proper order (horizontally)
        cells.forEach(cell => row.appendChild(cell));
        
        // Total column
        const totalCell = document.createElement('td');
        
        if (totalMatchups > 0) {
            const totalWinRate = (totalPlantWins / totalMatchups) * 100;
            totalCell.innerHTML = `<div>${totalWinRate.toFixed(1)}%</div><div>(${totalPlantWins}/${totalMatchups})</div>`;
            totalCell.style.backgroundColor = getWinrateColor(totalWinRate);
            totalCell.style.color = totalWinRate > 50 ? '#000' : '#fff';
        } else {
            totalCell.textContent = '-';
        }
        
        row.appendChild(totalCell);
        tbody.appendChild(row);
    });
    
    // Add a row for zombie totals (horizontal)
    const zombieTotalsRow = document.createElement('tr');
    
    // Add header cell for the row
    const zombieTotalsHeader = document.createElement('th');
    zombieTotalsHeader.textContent = 'Zombie Totals';
    zombieTotalsHeader.className = 'zombie-total-header';
    zombieTotalsRow.appendChild(zombieTotalsHeader);
    
    // Calculate zombie hero stats for each column (indexed by zombieHeroes array position)
    let overallZombieWins = 0;
    let overallZombieGames = 0;
    let zombieStats = [];
    
    // Pre-calculate all zombie stats first
    zombieHeroes.forEach(zombieHero => {
        let zombieWins = 0;
        let totalZombieGames = 0;
        
        // Calculate stats for this zombie hero against all plants
        plantHeroes.forEach(plantHero => {
            const zombieMatchup = matchupData[zombieHero][plantHero] || { wins: 0, total: 0 };
            const plantMatchup = matchupData[plantHero][zombieHero] || { wins: 0, total: 0 };
            
            zombieWins += zombieMatchup.wins;
            totalZombieGames += zombieMatchup.total + plantMatchup.wins;
        });
        
        // Store stats for this zombie
        zombieStats.push({
            hero: zombieHero,
            wins: zombieWins,
            total: totalZombieGames
        });
        
        // Add to overall totals
        overallZombieWins += zombieWins;
        overallZombieGames += totalZombieGames;
    });
    
    // Now populate the cells in proper order
    zombieStats.forEach(stat => {
        const cell = document.createElement('td');
        cell.className = 'zombie-total-cell';
        
        if (stat.total > 0) {
            const zombieWinRate = (stat.wins / stat.total) * 100;
            cell.innerHTML = `<div class="cell-winrate">${zombieWinRate.toFixed(1)}%</div>
                              <div class="cell-games">(${stat.wins}/${stat.total})</div>`;
            cell.style.backgroundColor = getWinrateColor(zombieWinRate);
        } else {
            cell.innerHTML = '<div style="text-align: center; line-height: 60px;">-</div>';
        }
        
        zombieTotalsRow.appendChild(cell);
    });
    
    // Add overall zombie total cell
    const overallZombieTotalCell = document.createElement('td');
    if (overallZombieGames > 0) {
        const overallZombieWinRate = (overallZombieWins / overallZombieGames) * 100;
        overallZombieTotalCell.innerHTML = `<div>${overallZombieWinRate.toFixed(1)}%</div>
                                            <div>(${overallZombieWins}/${overallZombieGames})</div>`;
        overallZombieTotalCell.style.backgroundColor = getWinrateColor(overallZombieWinRate);
        overallZombieTotalCell.style.color = overallZombieWinRate > 50 ? '#000' : '#fff';
    } else {
        overallZombieTotalCell.textContent = '-';
    }
    zombieTotalsRow.appendChild(overallZombieTotalCell);
    
    // Add the zombie totals row to the table
    tbody.appendChild(zombieTotalsRow);
    
    table.appendChild(tbody);
}

// Display player rankings
async function displayPlayerRankings(games) {
    // Create temporary GameData object with just the filtered games
    const tempGameData = new GameData();
    tempGameData.games = games;
    
    // Extract unique players from the games
    games.forEach(game => {
        tempGameData.players.add(game.winner);
        tempGameData.players.add(game.loser);
    });
    
    // Get player rankings
    const rankings = tempGameData.getPlayerRankings();
    
    // Sort by winrate (descending)
    const winrateRankings = [...rankings].sort((a, b) => b.winRate - a.winRate);
    
    // Sort by games played (descending)
    const gamesRankings = [...rankings].sort((a, b) => b.games - a.games);
    
    // Display winrate rankings
    displayRankingTable('player-winrate-table', winrateRankings, 'winRate');
    
    // Display games played rankings
    displayRankingTable('player-games-table', gamesRankings, 'games');
}

// Helper to display ranking table
function displayRankingTable(tableId, rankings, sortKey) {
    const table = document.getElementById(tableId);
    table.innerHTML = '';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    ['Rank', 'Player', 'Winrate', 'W', 'L', 'Total'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    rankings.forEach((player, index) => {
        const row = document.createElement('tr');
        if (index >= 5) {
            row.style.display = 'none'; // Hide rows beyond the first 5
        }
        
        // Rank cell
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        row.appendChild(rankCell);
        
        // Player name
        const nameCell = document.createElement('td');
        nameCell.textContent = player.name;
        row.appendChild(nameCell);
        
        // Winrate
        const winrateCell = document.createElement('td');
        winrateCell.textContent = `${player.winRate.toFixed(1)}%`;
        winrateCell.style.color = player.winRate >= 50 ? 'var(--light-green)' : 'var(--orange)';
        row.appendChild(winrateCell);
        
        // Wins
        const winsCell = document.createElement('td');
        winsCell.textContent = player.wins;
        row.appendChild(winsCell);
        
        // Losses
        const lossesCell = document.createElement('td');
        lossesCell.textContent = player.losses;
        row.appendChild(lossesCell);
        
        // Total games
        const totalCell = document.createElement('td');
        totalCell.textContent = player.games;
        row.appendChild(totalCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
}

// Display player stats in main content area
async function displayPlayerStatsModal(playerName) {
  if (!playerName) {
      // No player selected, show message
      document.getElementById('loading-spinner').style.display = 'none';
      document.getElementById('no-data-message').style.display = 'flex';
      document.getElementById('no-data-message').innerHTML = '<p>Please select a player to view their stats</p>';
      document.getElementById('data-container').style.display = 'none';
      return;
  }

  // Get player data
  const playerGames = gameData.getPlayerGames(playerName);
  const heroStats = gameData.getPlayerHeroStats(playerName);
  const deckStats = gameData.getPlayerDeckStats(playerName);
  const heroMatchups = gameData.getPlayerHeroMatchups(playerName);
    
  // Calculate overall stats
  const totalGames = playerGames.length;
  const wins = playerGames.filter(game => game.winner.toLowerCase() === playerName.toLowerCase()).length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    
  // Get container for the data
  document.getElementById('data-container').style.display = 'block';
  document.getElementById('no-data-message').style.display = 'none';
    
  // Select the hero-winrate tab and make it active
  document.querySelectorAll('.tab-btn').forEach(tab => {
      if (tab.getAttribute('data-tab') === 'hero-winrate') {
          tab.click();
      }
      // Hide player rankings tab for player stats view
      if (tab.getAttribute('data-tab') === 'player-winrate') {
          tab.style.display = 'none';
      }
  });
    
  // Get the hero-winrate tab content
  const heroWinrateTab = document.getElementById('hero-winrate');
  if (!heroWinrateTab) {
      console.error("Cannot find hero-winrate tab content");
      return;
  }
    
  // Clear the content
  heroWinrateTab.innerHTML = '';
    
    // Create content
    let content = `
        <h2>${playerName}'s Stats</h2>
        <div class="player-overall-stats">
            <div class="stat-card">
                <div class="stat-value">${winRate.toFixed(1)}%</div>
                <div class="stat-label">Overall Winrate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${wins}</div>
                <div class="stat-label">Wins</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalGames - wins}</div>
                <div class="stat-label">Losses</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalGames}</div>
                <div class="stat-label">Total Games</div>
            </div>
        </div>
        
        <h3>Best Winrate Heroes</h3>
        <table class="player-stats-table">
            <thead>
                <tr>
                    <th>Hero</th>
                    <th>Games</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Winrate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Sort heroes by winrate (descending)
    const bestWinrateHeroes = Object.entries(heroStats)
        .filter(([_, stats]) => stats.played >= 3) // Only consider heroes with at least 3 games
        .sort((a, b) => b[1].winRate - a[1].winRate);
    
    bestWinrateHeroes.forEach(([hero, stats], index) => {
        const isHidden = index >= 10 ? 'style="display:none"' : '';
        content += `
            <tr ${isHidden}>
                <td>${getFullHeroName(hero)}</td>
                <td>${stats.played}</td>
                <td>${stats.wins}</td>
                <td>${stats.played - stats.wins}</td>
                <td style="color: ${stats.winRate >= 50 ? 'var(--light-green)' : 'var(--orange)'}">
                    ${stats.winRate.toFixed(1)}%
                </td>
            </tr>
        `;
    });
    
    content += `
            </tbody>
        </table>
        <div class="show-more-container">
            <button id="show-more-best-heroes" class="show-more-btn">Show More</button>
            <button id="show-less-best-heroes" class="show-less-btn" style="display: none;">Show Less</button>
        </div>
        
        <h3>Most Played Heroes</h3>
        <table class="player-stats-table">
            <thead>
                <tr>
                    <th>Hero</th>
                    <th>Games</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Winrate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Sort heroes by games played
    const mostPlayedHeroes = Object.entries(heroStats)
        .sort((a, b) => b[1].played - a[1].played);
    
    mostPlayedHeroes.forEach(([hero, stats], index) => {
        const isHidden = index >= 10 ? 'style="display:none"' : '';
        content += `
            <tr ${isHidden}>
                <td>${getFullHeroName(hero)}</td>
                <td>${stats.played}</td>
                <td>${stats.wins}</td>
                <td>${stats.played - stats.wins}</td>
                <td style="color: ${stats.winRate >= 50 ? 'var(--light-green)' : 'var(--orange)'}">
                    ${stats.winRate.toFixed(1)}%
                </td>
            </tr>
        `;
    });
    
    content += `
            </tbody>
        </table>
        <div class="show-more-container">
            <button id="show-more-most-played" class="show-more-btn">Show More</button>
            <button id="show-less-most-played" class="show-less-btn" style="display: none;">Show Less</button>
        </div>
        
        <h3>Heroes You Lose Most Against</h3>
        <table class="player-stats-table">
            <thead>
                <tr>
                    <th>Opponent Hero</th>
                    <th>Games</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Winrate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Calculate heroes the player loses most against - count losses against each opponent hero
    const heroLossCounts = {};
    
    // Process all games to count losses against each hero
    playerGames.forEach(game => {
        // If player is the loser, count the hero they lost to
        if (game.loser.toLowerCase() === playerName.toLowerCase()) {
            const oppHero = game.winningHero;
            if (!heroLossCounts[oppHero]) {
                heroLossCounts[oppHero] = {
                    played: 0,
                    losses: 0,
                    wins: 0,
                    winRate: 0
                };
            }
            heroLossCounts[oppHero].played++;
            heroLossCounts[oppHero].losses++;
        } else if (game.winner.toLowerCase() === playerName.toLowerCase()) {
            // If player won, add it to the count of games played against this hero
            const oppHero = game.losingHero;
            if (!heroLossCounts[oppHero]) {
                heroLossCounts[oppHero] = {
                    played: 0,
                    losses: 0,
                    wins: 0,
                    winRate: 0
                };
            }
            heroLossCounts[oppHero].played++;
            heroLossCounts[oppHero].wins++;
        }
    });
    
    // Calculate winrates and create matchup array
    let difficultMatchups = [];
    for (const oppHero in heroLossCounts) {
        const stats = heroLossCounts[oppHero];
        if (stats.played >= 3) { // Only consider matchups with at least 3 games
            stats.winRate = (stats.wins / stats.played) * 100;
            difficultMatchups.push({
                oppHero,
                ...stats
            });
        }
    }
    
    // Sort by winrate (ascending) to show heroes the player loses to most
    difficultMatchups.sort((a, b) => a.winRate - b.winRate);
    
    // Display all matchups, we'll control visibility with show more/less
    // Display worst matchups (heroes the player loses most to)
    difficultMatchups.forEach((matchup, index) => {
        const isHidden = index >= 10 ? 'style="display:none"' : '';
        content += `
            <tr ${isHidden} class="matchup-row">
                <td>${getFullHeroName(matchup.oppHero)}</td>
                <td>${matchup.played}</td>
                <td>${matchup.wins}</td>
                <td>${matchup.losses}</td>
                <td style="color: ${matchup.winRate >= 50 ? 'var(--light-green)' : 'var(--orange)'}">
                    ${matchup.winRate.toFixed(1)}%
                </td>
            </tr>
        `;
    });
    
    content += `
            </tbody>
        </table>
        <div class="show-more-container">
            <button id="show-more-matchups" class="show-more-btn">Show More</button>
            <button id="show-less-matchups" class="show-less-btn" style="display: none;">Show Less</button>
        </div>
    `;
    
    // Fill the container
    heroWinrateTab.innerHTML = content;
    
    // Add event listeners for the show more/less buttons
    document.getElementById('show-more-best-heroes').addEventListener('click', function() {
        showAllRows('player-stats-table', 0);
        this.style.display = 'none';
        document.getElementById('show-less-best-heroes').style.display = 'inline-block';
    });
    
    document.getElementById('show-less-best-heroes').addEventListener('click', function() {
        hideRowsAfter('player-stats-table', 0, 10);
        this.style.display = 'none';
        document.getElementById('show-more-best-heroes').style.display = 'inline-block';
    });
    
    document.getElementById('show-more-most-played').addEventListener('click', function() {
        showAllRows('player-stats-table', 1);
        this.style.display = 'none';
        document.getElementById('show-less-most-played').style.display = 'inline-block';
    });
    
    document.getElementById('show-less-most-played').addEventListener('click', function() {
        hideRowsAfter('player-stats-table', 1, 10);
        this.style.display = 'none';
        document.getElementById('show-more-most-played').style.display = 'inline-block';
    });
    
    document.getElementById('show-more-matchups').addEventListener('click', function() {
        showAllRows('player-stats-table', 2);
        this.style.display = 'none';
        document.getElementById('show-less-matchups').style.display = 'inline-block';
    });
    
    document.getElementById('show-less-matchups').addEventListener('click', function() {
        hideRowsAfter('player-stats-table', 2, 10);
        this.style.display = 'none';
        document.getElementById('show-more-matchups').style.display = 'inline-block';
    });
    
    // Hide loading spinner
    document.getElementById('loading-spinner').style.display = 'none';
}

// Display deck stats for experimental feature
function displayDeckStats(deckStats) {
    // Select the matchup-details tab and make it active
    document.querySelector('.tab-btn[data-tab="matchup-details"]').click();
    
    const container = document.getElementById('matchup-details-container');
    container.innerHTML = '';
    
    // Create deck stats content
    let content = `
        <h3>Deck Analysis</h3>
        <table class="deck-stats-table">
            <thead>
                <tr>
                    <th>Deck Name</th>
                    <th>Games</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Winrate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Sort decks by games played
    deckStats.sort((a, b) => b.played - a.played);
    
    deckStats.forEach(deck => {
        content += `
            <tr class="deck-row" data-deck-id="${deck.name}">
                <td>${deck.name}</td>
                <td>${deck.played}</td>
                <td>${deck.wins}</td>
                <td>${deck.losses}</td>
                <td style="color: ${deck.winRate >= 50 ? 'var(--light-green)' : 'var(--orange)'}">
                    ${deck.winRate.toFixed(1)}%
                </td>
            </tr>
        `;
        
        // Add detailed player stats for this deck (initially hidden)
        content += `
            <tr class="deck-details-row" style="display: none;" data-deck-id="${deck.name}">
                <td colspan="5">
                    <div class="deck-details">
                        <h4>Player Performance with ${deck.name}</h4>
                        <table class="deck-player-stats-table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Games</th>
                                    <th>Wins</th>
                                    <th>Losses</th>
                                    <th>Winrate</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        // Add each player's stats with this deck
        const playerStats = Object.entries(deck.players);
        playerStats.sort((a, b) => b[1].played - a[1].played);
        
        playerStats.forEach(([player, stats]) => {
            content += `
                <tr>
                    <td>${player}</td>
                    <td>${stats.played}</td>
                    <td>${stats.wins}</td>
                    <td>${stats.losses}</td>
                    <td style="color: ${stats.winRate >= 50 ? 'var(--light-green)' : 'var(--orange)'}">
                        ${stats.winRate.toFixed(1)}%
                    </td>
                </tr>
            `;
        });
        
        content += `
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        `;
    });
    
    content += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = content;
    
    // Add click event to show/hide details
    const deckRows = document.querySelectorAll('.deck-row');
    deckRows.forEach(row => {
        row.addEventListener('click', function() {
            const deckId = this.dataset.deckId;
            const detailsRow = document.querySelector(`.deck-details-row[data-deck-id="${deckId}"]`);
            
            if (detailsRow.style.display === 'none') {
                detailsRow.style.display = 'table-row';
                this.classList.add('expanded');
            } else {
                detailsRow.style.display = 'none';
                this.classList.remove('expanded');
            }
        });
    });
}

// Helper functions for showing/hiding rows
function showAllRows(tableClass, tableIndex) {
    // Get all tables with this class
    const tables = document.getElementsByClassName(tableClass);
    if (tables.length <= tableIndex) return;
    
    const rows = tables[tableIndex].querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });
}

function hideRowsAfter(tableClass, tableIndex, rowLimit) {
    // Get all tables with this class
    const tables = document.getElementsByClassName(tableClass);
    if (tables.length <= tableIndex) return;
    
    const rows = tables[tableIndex].querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        if (index >= rowLimit) {
            row.style.display = 'none';
        }
    });
}

// Start the app when the document is loaded
document.addEventListener('DOMContentLoaded', initializeApp);