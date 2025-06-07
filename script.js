// PvZ Heroes Tournament Analysis Tool
document.addEventListener('DOMContentLoaded', function() {
    // Hero Data
    const zombieHeroes = [
        { code: 'sb', fullName: 'Super Brainz' },
        { code: 'sm', fullName: 'Smash' },
        { code: 'if', fullName: 'Impfinity' },
        { code: 'rb', fullName: 'Rustbolt' },
        { code: 'eb', fullName: 'Electric Boogaloo' },
        { code: 'bf', fullName: 'Brain Freeze' },
        { code: 'pb', fullName: 'Professor Brainstorm' },
        { code: 'im', fullName: 'Immorticia' },
        { code: 'zm', fullName: 'Z-Mech' },
        { code: 'nt', fullName: 'Neptuna' },
        { code: 'hg', fullName: 'Huge-Gigantacus' }
    ];
    
    const plantHeroes = [
        { code: 'gs', fullName: 'Green Shadow' },
        { code: 'sf', fullName: 'Solar Flare' },
        { code: 'wk', fullName: 'Wall-Knight' },
        { code: 'cz', fullName: 'Chompzilla' },
        { code: 'sp', fullName: 'Spudow' },
        { code: 'ct', fullName: 'Citron' },
        { code: 'gk', fullName: 'Grass Knuckles' },
        { code: 'nc', fullName: 'Nightcap' },
        { code: 'ro', fullName: 'Rose' },
        { code: 'cc', fullName: 'Captain Combustible' },
        { code: 'bc', fullName: 'Beta-Carrotina' }
    ];

    // Configuration
    let allPlayers = [];
    let allPatches = [];
    let allTournaments = [];
    let gameData = []; // Will hold all parsed game data
    
    // Current selections
    const currentSelections = {
        dateRange: false,
        startDate: null,
        endDate: null,
        patches: [],
        tournaments: [],
        players: [],
        opponent: '',
        teammate: '',
        deckHero: '',
        deckString: '',
        activeTab: 'matchups'
    };

    // DOM Elements
    const dateBtn = document.getElementById('dateBtn');
    const patchBtn = document.getElementById('patchBtn');
    const dateSelector = document.getElementById('dateSelector');
    const patchSelector = document.getElementById('patchSelector');
    const patchList = document.getElementById('patchList');
    const tournamentList = document.getElementById('tournamentList');
    const playersBtn = document.getElementById('playersBtn');
    const opponentBtn = document.getElementById('opponentBtn');
    const teammateBtn = document.getElementById('teammateBtn');
    const playersSelector = document.getElementById('playersSelector');
    const opponentSelector = document.getElementById('opponentSelector');
    const teammateSelector = document.getElementById('teammateSelector');
    const playerList = document.getElementById('playerList');
    const opponentSelect = document.getElementById('opponentSelect');
    const teammateSelect = document.getElementById('teammateSelect');
    const playerSearch = document.getElementById('playerSearch');
    const opponentSearch = document.getElementById('opponentSearch');
    const teammateSearch = document.getElementById('teammateSearch');
    const deckHero = document.getElementById('deckHero');
    const deckString = document.getElementById('deckString');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const matchupTable = document.getElementById('matchupTable');
    const zombieHeroTable = document.getElementById('zombieHeroTable');
    const plantHeroTable = document.getElementById('plantHeroTable');
    const playerWinRateTable = document.getElementById('playerWinRateTable');
    const playerGamesTable = document.getElementById('playerGamesTable');
    const showMoreButtons = document.querySelectorAll('.show-more-btn');
    const showLessButtons = document.querySelectorAll('.show-less-btn');
    const deckAnalysisContent = document.getElementById('deckAnalysisContent');
    const opponentAnalysis = document.getElementById('opponentAnalysis');
    const teammateAnalysis = document.getElementById('teammateAnalysis');
    const selectedOpponentSpan = document.getElementById('selectedOpponent');
    const selectedTeammateSpan = document.getElementById('selectedTeammate');
    const opponentHeroes = document.getElementById('opponentHeroes');
    const opponentWeaknesses = document.getElementById('opponentWeaknesses');
    const teammateHeroes = document.getElementById('teammateHeroes');
    const teammatePlayedHeroes = document.getElementById('teammatePlayedHeroes');

    // Initialize the application
    async function init() {
        await loadPlayerNames();
        await loadPatches();
        await loadTournaments();
        populateHeroDropdown();
        setupEventListeners();
        populateUIElements();
    }

    // Load player names from file
    async function loadPlayerNames() {
        try {
            const response = await fetch('playernames.txt');
            if (!response.ok) throw new Error('Failed to load player names');
            
            const text = await response.text();
            allPlayers = text.split('\n')
                .map(name => name.trim())
                .filter(name => name.length > 0);
            
            console.log(`Loaded ${allPlayers.length} players`);
        } catch (error) {
            console.error('Error loading player names:', error);
            allPlayers = [];
        }
    }

    // Load patches from directory structure
    async function loadPatches() {
        try {
            // In a real deployment, this would make a fetch to a serverside API
            // that would scan the directories. For now we'll hardcode patches
            allPatches = ['p1', 'p2'];
            console.log(`Loaded ${allPatches.length} patches`);
        } catch (error) {
            console.error('Error loading patches:', error);
            allPatches = [];
        }
    }

    // Load tournaments from directory structure
    async function loadTournaments() {
        try {
            // In a real deployment, this would make a fetch to a serverside API
            // For now, hardcode based on file paths we've seen
            allTournaments = ['Quicksand Live', 'Quicksand Ranked', 'test'];
            console.log(`Loaded ${allTournaments.length} tournaments`);
        } catch (error) {
            console.error('Error loading tournaments:', error);
            allTournaments = [];
        }
    }

    // Populate the hero dropdown for deck search
    function populateHeroDropdown() {
        // Clear existing options except the first one
        while (deckHero.options.length > 1) {
            deckHero.remove(1);
        }

        // Add zombie heroes
        const zombieOptgroup = document.createElement('optgroup');
        zombieOptgroup.label = 'Zombie Heroes';
        zombieHeroes.forEach(hero => {
            const option = document.createElement('option');
            option.value = hero.code;
            option.textContent = hero.fullName;
            zombieOptgroup.appendChild(option);
        });
        deckHero.appendChild(zombieOptgroup);

        // Add plant heroes
        const plantOptgroup = document.createElement('optgroup');
        plantOptgroup.label = 'Plant Heroes';
        plantHeroes.forEach(hero => {
            const option = document.createElement('option');
            option.value = hero.code;
            option.textContent = hero.fullName;
            plantOptgroup.appendChild(option);
        });
        deckHero.appendChild(plantOptgroup);
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Date/Patch selector toggle
        dateBtn.addEventListener('click', () => toggleSelectors('date'));
        patchBtn.addEventListener('click', () => toggleSelectors('patch'));
        
        // Player/Opponent/Teammate selector toggle
        playersBtn.addEventListener('click', () => togglePlayerSelectors('players'));
        opponentBtn.addEventListener('click', () => togglePlayerSelectors('opponent'));
        teammateBtn.addEventListener('click', () => togglePlayerSelectors('teammate'));
        
        // Search functionality
        playerSearch.addEventListener('input', () => filterPlayers(playerSearch.value, playerList));
        opponentSearch.addEventListener('input', () => filterPlayers(opponentSearch.value, opponentSelect));
        teammateSearch.addEventListener('input', () => filterPlayers(teammateSearch.value, teammateSelect));
        
        // Apply date range
        document.getElementById('applyDateBtn').addEventListener('click', applyDateRange);
        
        // Analyze button
        analyzeBtn.addEventListener('click', analyzeData);
        
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', () => switchTab(button.dataset.tab));
        });
        
        // Show more/less buttons
        setupShowMoreLessButtons();
        
        // Opponent and teammate selection
        opponentSelect.addEventListener('change', handleOpponentChange);
        teammateSelect.addEventListener('change', handleTeammateChange);
    }

    // Populate UI elements with initial data
    function populateUIElements() {
        // Populate patch list
        allPatches.forEach(patch => {
            const item = createCheckboxItem(patch, patch, 'patch');
            patchList.appendChild(item);
        });

        // Populate tournament list
        allTournaments.forEach(tournament => {
            const item = createCheckboxItem(tournament, tournament, 'tournament');
            tournamentList.appendChild(item);
        });

        // Populate player lists
        populatePlayerLists();
    }

    // Helper to create a checkbox list item
    function createCheckboxItem(value, label, type) {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = value;
        checkbox.id = `${type}-${value.replace(/\s+/g, '-').toLowerCase()}`;
        
        // Add event listener based on type
        if (type === 'patch') {
            checkbox.addEventListener('change', () => handlePatchChange(checkbox));
        } else if (type === 'tournament') {
            checkbox.addEventListener('change', () => handleTournamentChange(checkbox));
        } else if (type === 'player') {
            checkbox.addEventListener('change', () => handlePlayerChange(checkbox));
        }
        
        const labelElem = document.createElement('label');
        labelElem.htmlFor = checkbox.id;
        labelElem.textContent = label;
        
        div.appendChild(checkbox);
        div.appendChild(labelElem);
        
        return div;
    }

    // Populate player selection lists
    function populatePlayerLists(filter = '') {
        // Clear current lists
        playerList.innerHTML = '';
        opponentSelect.innerHTML = '<option value="">Select an opponent</option>';
        teammateSelect.innerHTML = '<option value="">Select a teammate</option>';
        
        // Filter players if needed
        const filteredPlayers = filter ? 
            allPlayers.filter(player => player.toLowerCase().includes(filter.toLowerCase())) : 
            allPlayers;
        
        // Add to checkbox list
        filteredPlayers.slice(0, 20).forEach(player => {
            const item = createCheckboxItem(player, player, 'player');
            playerList.appendChild(item);
        });
        
        // Add to dropdown selects
        filteredPlayers.forEach(player => {
            const opponentOption = document.createElement('option');
            opponentOption.value = player;
            opponentOption.textContent = player;
            opponentSelect.appendChild(opponentOption);
            
            const teammateOption = document.createElement('option');
            teammateOption.value = player;
            teammateOption.textContent = player;
            teammateSelect.appendChild(teammateOption);
        });
    }

    // Filter players based on search input
    function filterPlayers(query, targetElement) {
        if (targetElement === playerList) {
            // Clear and repopulate the checkbox list
            playerList.innerHTML = '';
            
            const filteredPlayers = allPlayers.filter(player => 
                player.toLowerCase().includes(query.toLowerCase())
            );
            
            filteredPlayers.slice(0, 20).forEach(player => {
                const item = createCheckboxItem(player, player, 'player');
                playerList.appendChild(item);
            });
        } else if (targetElement === opponentSelect || targetElement === teammateSelect) {
            // Filter options in the dropdown
            const options = targetElement.options;
            const firstOption = options[0]; // Save the first "Select..." option
            
            targetElement.innerHTML = ''; // Clear all options
            targetElement.appendChild(firstOption); // Add back the first option
            
            const filteredPlayers = allPlayers.filter(player => 
                player.toLowerCase().includes(query.toLowerCase())
            );
            
            filteredPlayers.forEach(player => {
                const option = document.createElement('option');
                option.value = player;
                option.textContent = player;
                targetElement.appendChild(option);
            });
        }
    }

    // Toggle between date and patch selectors
    function toggleSelectors(type) {
        if (type === 'date') {
            dateBtn.classList.add('active');
            patchBtn.classList.remove('active');
            dateSelector.classList.remove('hidden');
            patchSelector.classList.add('hidden');
            currentSelections.dateRange = true;
        } else {
            dateBtn.classList.remove('active');
            patchBtn.classList.add('active');
            dateSelector.classList.add('hidden');
            patchSelector.classList.remove('hidden');
            currentSelections.dateRange = false;
        }
    }

    // Toggle between players, opponent, and teammate selectors
    function togglePlayerSelectors(type) {
        // Remove active class and hide all selectors
        playersBtn.classList.remove('active');
        opponentBtn.classList.remove('active');
        teammateBtn.classList.remove('active');
        playersSelector.classList.add('hidden');
        opponentSelector.classList.add('hidden');
        teammateSelector.classList.add('hidden');
        
        // Show and activate the selected one
        if (type === 'players') {
            playersBtn.classList.add('active');
            playersSelector.classList.remove('hidden');
        } else if (type === 'opponent') {
            opponentBtn.classList.add('active');
            opponentSelector.classList.remove('hidden');
        } else if (type === 'teammate') {
            teammateBtn.classList.add('active');
            teammateSelector.classList.remove('hidden');
        }
    }

    // Apply date range filter
    function applyDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (startDate && endDate) {
            currentSelections.startDate = new Date(startDate);
            currentSelections.endDate = new Date(endDate);
            console.log(`Date range set: ${startDate} to ${endDate}`);
        } else {
            alert('Please select both start and end dates.');
        }
    }

    // Handle patch checkbox changes
    function handlePatchChange(checkbox) {
        if (checkbox.checked) {
            currentSelections.patches.push(checkbox.value);
        } else {
            currentSelections.patches = currentSelections.patches.filter(patch => patch !== checkbox.value);
        }
        console.log('Selected patches:', currentSelections.patches);
    }

    // Handle tournament checkbox changes
    function handleTournamentChange(checkbox) {
        if (checkbox.checked) {
            currentSelections.tournaments.push(checkbox.value);
        } else {
            currentSelections.tournaments = currentSelections.tournaments.filter(t => t !== checkbox.value);
        }
        console.log('Selected tournaments:', currentSelections.tournaments);
    }

    // Handle player checkbox changes
    function handlePlayerChange(checkbox) {
        if (checkbox.checked) {
            currentSelections.players.push(checkbox.value);
        } else {
            currentSelections.players = currentSelections.players.filter(p => p !== checkbox.value);
        }
        console.log('Selected players:', currentSelections.players);
    }

    // Handle opponent selection
    function handleOpponentChange() {
        currentSelections.opponent = opponentSelect.value;
        currentSelections.players = [];
        console.log('Selected opponent:', currentSelections.opponent);
        
        // Clear player checkboxes when an opponent is selected
        const playerCheckboxes = playerList.querySelectorAll('input[type="checkbox"]');
        playerCheckboxes.forEach(cb => {
            cb.checked = false;
        });
    }

    // Handle teammate selection
    function handleTeammateChange() {
        currentSelections.teammate = teammateSelect.value;
        console.log('Selected teammate:', currentSelections.teammate);
    }

    // Switch between tabs
    function switchTab(tabId) {
        // Update active tab button
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabId) {
                button.classList.add('active');
            }
        });
        
        // Show selected tab content, hide others
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabId}Tab`).classList.remove('hidden');
        
        // Update current active tab
        currentSelections.activeTab = tabId;
    }

    // Setup show more/less buttons
    function setupShowMoreLessButtons() {
        document.getElementById('showMorePlayers').addEventListener('click', () => {
            showMoreItems(playerList, 'player', 100);
            document.getElementById('showMorePlayers').classList.add('hidden');
            document.getElementById('showLessPlayers').classList.remove('hidden');
        });
        
        document.getElementById('showLessPlayers').addEventListener('click', () => {
            showLessItems(playerList, 'player', 20);
            document.getElementById('showMorePlayers').classList.remove('hidden');
            document.getElementById('showLessPlayers').classList.add('hidden');
        });
        
        document.getElementById('showMoreZombies').addEventListener('click', () => {
            showAllRows(zombieHeroTable);
            document.getElementById('showMoreZombies').classList.add('hidden');
            document.getElementById('showLessZombies').classList.remove('hidden');
        });
        
        document.getElementById('showLessZombies').addEventListener('click', () => {
            limitTableRows(zombieHeroTable, 5);
            document.getElementById('showMoreZombies').classList.remove('hidden');
            document.getElementById('showLessZombies').classList.add('hidden');
        });
        
        document.getElementById('showMorePlants').addEventListener('click', () => {
            showAllRows(plantHeroTable);
            document.getElementById('showMorePlants').classList.add('hidden');
            document.getElementById('showLessPlants').classList.remove('hidden');
        });
        
        document.getElementById('showLessPlants').addEventListener('click', () => {
            limitTableRows(plantHeroTable, 5);
            document.getElementById('showMorePlants').classList.remove('hidden');
            document.getElementById('showLessPlants').classList.add('hidden');
        });
        
        document.getElementById('showMoreWinratePlayers').addEventListener('click', () => {
            showAllRows(playerWinRateTable);
            document.getElementById('showMoreWinratePlayers').classList.add('hidden');
            document.getElementById('showLessWinratePlayers').classList.remove('hidden');
        });
        
        document.getElementById('showLessWinratePlayers').addEventListener('click', () => {
            limitTableRows(playerWinRateTable, 10);
            document.getElementById('showMoreWinratePlayers').classList.remove('hidden');
            document.getElementById('showLessWinratePlayers').classList.add('hidden');
        });
        
        document.getElementById('showMoreActivePlayers').addEventListener('click', () => {
            showAllRows(playerGamesTable);
            document.getElementById('showMoreActivePlayers').classList.add('hidden');
            document.getElementById('showLessActivePlayers').classList.remove('hidden');
        });
        
        document.getElementById('showLessActivePlayers').addEventListener('click', () => {
            limitTableRows(playerGamesTable, 10);
            document.getElementById('showMoreActivePlayers').classList.remove('hidden');
            document.getElementById('showLessActivePlayers').classList.add('hidden');
        });
    }

    // Show more items in a list
    function showMoreItems(container, type, count) {
        const currentCount = container.children.length;
        const remaining = allPlayers.slice(currentCount, currentCount + count);
        
        remaining.forEach(item => {
            const element = createCheckboxItem(item, item, type);
            container.appendChild(element);
        });
    }

    // Show fewer items in a list
    function showLessItems(container, type, count) {
        container.innerHTML = '';
        const items = allPlayers.slice(0, count);
        
        items.forEach(item => {
            const element = createCheckboxItem(item, item, type);
            container.appendChild(element);
        });
    }

    // Show all rows in a table
    function showAllRows(table) {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                row.classList.remove('hidden');
            });
        }
    }

    // Limit visible rows in a table
    function limitTableRows(table, limit) {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                if (index >= limit) {
                    row.classList.add('hidden');
                } else {
                    row.classList.remove('hidden');
                }
            });
        }
    }

    // Main data analysis function
    async function analyzeData() {
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        opponentAnalysis.classList.add('hidden');
        teammateAnalysis.classList.add('hidden');
        
        try {
            // Collect current filter selections
            const hero = deckHero.value;
            const deckSearchString = deckString.value.toLowerCase();
            
            // Reset game data
            gameData = [];
            
            // Load game data based on selections
            await loadGameData();
            
            // Process data based on current selections and active tab
            switch (currentSelections.activeTab) {
                case 'matchups':
                    generateMatchupTable();
                    break;
                case 'heroes':
                    generateHeroStats();
                    break;
                case 'players':
                    generatePlayerStats();
                    break;
                case 'decks':
                    generateDeckAnalysis(hero, deckSearchString);
                    break;
            }
            
            // Handle opponent or teammate selection if present
            if (currentSelections.opponent) {
                generateOpponentAnalysis();
            }
            
            if (currentSelections.teammate) {
                generateTeammateAnalysis();
            }
            
        } catch (error) {
            console.error('Error analyzing data:', error);
            alert('Error analyzing data. Please check the console for details.');
        } finally {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
        }
    }

    // Load game data from files
    async function loadGameData() {
        // Determine which data files to load based on selections
        let patchesToLoad = currentSelections.patches.length > 0 ? 
            currentSelections.patches : allPatches;
        
        let tournamentsToLoad = currentSelections.tournaments.length > 0 ?
            currentSelections.tournaments : allTournaments;
            
        // Load data from each file
        for (const patch of patchesToLoad) {
            for (const tournament of tournamentsToLoad) {
                try {
                    const url = `datafiles/${patch}/${encodeURIComponent(tournament)}.txt`;
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const text = await response.text();
                        const parsedData = parseGameData(text, patch, tournament);
                        gameData = gameData.concat(parsedData);
                    }
                } catch (error) {
                    console.warn(`Could not load data for ${patch}/${tournament}:`, error);
                }
            }
        }
        
        console.log(`Loaded ${gameData.length} game records`);
        
        // Filter by date range if selected
        if (currentSelections.dateRange && currentSelections.startDate && currentSelections.endDate) {
            gameData = gameData.filter(game => {
                const gameDate = new Date(game.timestamp);
                return gameDate >= currentSelections.startDate && gameDate <= currentSelections.endDate;
            });
            console.log(`Filtered to ${gameData.length} games by date range`);
        }
        
        // Filter by players if selected
        if (currentSelections.players.length > 0) {
            gameData = gameData.filter(game => 
                currentSelections.players.includes(game.winner) || 
                currentSelections.players.includes(game.loser)
            );
            console.log(`Filtered to ${gameData.length} games by player selection`);
        }
        
        // Filter by opponent if selected
        if (currentSelections.opponent) {
            gameData = gameData.filter(game => 
                game.winner === currentSelections.opponent || 
                game.loser === currentSelections.opponent
            );
            console.log(`Filtered to ${gameData.length} games by opponent ${currentSelections.opponent}`);
        }
        
        // Filter by teammate if selected
        if (currentSelections.teammate) {
            // For now, we don't have teammate data in the format
            // This would be implemented if the data included team games
            console.log(`Teammate filtering not yet implemented`);
        }
    }

    // Parse game data from file content
    function parseGameData(fileContent, patch, tournament) {
        const lines = fileContent.trim().split('\n');
        return lines.map(line => {
            const parts = line.split('|');
            if (parts.length >= 6) {
                return {
                    timestamp: parts[0],
                    winner: parts[1],
                    loser: parts[2],
                    winningHero: parts[3],
                    losingHero: parts[4],
                    winningDeck: parts[5],
                    losingDeck: parts.length > 6 ? parts[6] : 'Unknown',
                    patch: patch,
                    tournament: tournament
                };
            }
            return null;
        }).filter(game => game !== null);
    }

    // Generate the hero matchup table
    function generateMatchupTable() {
        // Create grid for matchups
        const matchupGrid = {};
        const heroPlayCounts = {};
        
        // Initialize grid
        zombieHeroes.forEach(zombie => {
            matchupGrid[zombie.code] = {};
            heroPlayCounts[zombie.code] = 0;
            
            plantHeroes.forEach(plant => {
                matchupGrid[zombie.code][plant.code] = {
                    zombieWins: 0,
                    plantWins: 0,
                    total: 0
                };
                heroPlayCounts[plant.code] = 0;
            });
        });
        
        // Fill grid with data
        gameData.forEach(game => {
            const { winningHero, losingHero, winner, loser } = game;
            
            // Update hero play counts
            heroPlayCounts[winningHero] = (heroPlayCounts[winningHero] || 0) + 1;
            heroPlayCounts[losingHero] = (heroPlayCounts[losingHero] || 0) + 1;
            
            // Determine if it's a zombie win or plant win
            const isZombieWin = zombieHeroes.some(hero => hero.code === winningHero);
            
            if (isZombieWin) {
                // Zombie won against plant
                if (matchupGrid[winningHero] && matchupGrid[winningHero][losingHero]) {
                    matchupGrid[winningHero][losingHero].zombieWins++;
                    matchupGrid[winningHero][losingHero].total++;
                }
            } else {
                // Plant won against zombie
                const zombieHero = losingHero;
                const plantHero = winningHero;
                
                if (matchupGrid[zombieHero] && matchupGrid[zombieHero][plantHero]) {
                    matchupGrid[zombieHero][plantHero].plantWins++;
                    matchupGrid[zombieHero][plantHero].total++;
                }
            }
        });
        
        // Generate the table
        let tableHTML = `
            <tr>
                <th></th>
                ${plantHeroes.map(hero => 
                    `<th class="plant-hero" title="${hero.fullName} (${heroPlayCounts[hero.code] || 0} games)">${hero.code.toUpperCase()}</th>`
                ).join('')}
                <th>Total</th>
            </tr>
        `;
        
        zombieHeroes.forEach(zombie => {
            let zombieTotalWins = 0;
            let zombieTotalGames = 0;
            
            const rowHTML = `
                <tr>
                    <th class="zombie-hero" title="${zombie.fullName} (${heroPlayCounts[zombie.code] || 0} games)">${zombie.code.toUpperCase()}</th>
                    ${plantHeroes.map(plant => {
                        const matchup = matchupGrid[zombie.code][plant.code];
                        const total = matchup.total;
                        
                        zombieTotalWins += matchup.zombieWins;
                        zombieTotalGames += total;
                        
                        if (total === 0) {
                            return `<td class="matchup-cell">-<span class="games-count">0</span></td>`;
                        }
                        
                        const winRate = (matchup.zombieWins / total * 100).toFixed(1);
                        const colorClass = getWinRateColorClass(winRate);
                        
                        return `<td class="matchup-cell ${colorClass}" title="${zombie.fullName} vs ${plant.fullName}: ${matchup.zombieWins} wins in ${total} games">
                            ${winRate}%<span class="games-count">${total}</span>
                        </td>`;
                    }).join('')}
                    <td class="matchup-cell ${getWinRateColorClass((zombieTotalWins / zombieTotalGames * 100) || 0)}">
                        ${zombieTotalGames > 0 ? (zombieTotalWins / zombieTotalGames * 100).toFixed(1) + '%' : '-'}
                        <span class="games-count">${zombieTotalGames}</span>
                    </td>
                </tr>
            `;
            
            tableHTML += rowHTML;
        });
        
        // Add total row
        let totalRowHTML = `<tr>
            <th>Total</th>`;
            
        plantHeroes.forEach(plant => {
            let plantTotalLosses = 0;
            let plantTotalGames = 0;
            
            zombieHeroes.forEach(zombie => {
                const matchup = matchupGrid[zombie.code][plant.code];
                plantTotalLosses += matchup.zombieWins;
                plantTotalGames += matchup.total;
            });
            
            const winRate = plantTotalGames > 0 ? (plantTotalLosses / plantTotalGames * 100).toFixed(1) : 0;
            const colorClass = getWinRateColorClass(winRate);
            
            totalRowHTML += `<td class="matchup-cell ${colorClass}">
                ${plantTotalGames > 0 ? winRate + '%' : '-'}
                <span class="games-count">${plantTotalGames}</span>
            </td>`;
        });
        
        // Calculate overall totals
        let overallZombieWins = 0;
        let overallGames = 0;
        
        zombieHeroes.forEach(zombie => {
            plantHeroes.forEach(plant => {
                const matchup = matchupGrid[zombie.code][plant.code];
                overallZombieWins += matchup.zombieWins;
                overallGames += matchup.total;
            });
        });
        
        const overallWinRate = overallGames > 0 ? (overallZombieWins / overallGames * 100).toFixed(1) : 0;
        const overallColorClass = getWinRateColorClass(overallWinRate);
        
        totalRowHTML += `<td class="matchup-cell ${overallColorClass}">
            ${overallGames > 0 ? overallWinRate + '%' : '-'}
            <span class="games-count">${overallGames}</span>
        </td>`;
        
        totalRowHTML += `</tr>`;
        tableHTML += totalRowHTML;
        
        // Update the table
        matchupTable.innerHTML = tableHTML;
    }

    // Generate hero statistics
    function generateHeroStats() {
        const heroStats = {};
        
        // Initialize hero stats
        zombieHeroes.concat(plantHeroes).forEach(hero => {
            heroStats[hero.code] = {
                wins: 0,
                losses: 0,
                total: 0,
                winRate: 0
            };
        });
        
        // Populate with data
        gameData.forEach(game => {
            const { winningHero, losingHero } = game;
            
            // Update winner stats
            if (heroStats[winningHero]) {
                heroStats[winningHero].wins++;
                heroStats[winningHero].total++;
            }
            
            // Update loser stats
            if (heroStats[losingHero]) {
                heroStats[losingHero].losses++;
                heroStats[losingHero].total++;
            }
        });
        
        // Calculate win rates
        Object.keys(heroStats).forEach(code => {
            const stats = heroStats[code];
            stats.winRate = stats.total > 0 ? stats.wins / stats.total * 100 : 0;
        });
        
        // Generate zombie hero table
        let zombieTableHTML = '';
        
        const sortedZombies = zombieHeroes
            .map(hero => ({
                code: hero.code,
                fullName: hero.fullName,
                stats: heroStats[hero.code]
            }))
            .sort((a, b) => b.stats.winRate - a.stats.winRate);
        
        sortedZombies.forEach((hero, index) => {
            const { code, fullName, stats } = hero;
            const winRateClass = getWinRateColorClass(stats.winRate);
            const hidden = index >= 5 ? 'class="hidden"' : '';
            
            zombieTableHTML += `
                <tr ${hidden}>
                    <td>${code.toUpperCase()}</td>
                    <td>${fullName}</td>
                    <td>${stats.total}</td>
                    <td class="win-rate-cell ${winRateClass}">${stats.winRate.toFixed(1)}%</td>
                </tr>
            `;
        });
        
        zombieHeroTable.querySelector('tbody').innerHTML = zombieTableHTML;
        
        // Generate plant hero table
        let plantTableHTML = '';
        
        const sortedPlants = plantHeroes
            .map(hero => ({
                code: hero.code,
                fullName: hero.fullName,
                stats: heroStats[hero.code]
            }))
            .sort((a, b) => b.stats.winRate - a.stats.winRate);
        
        sortedPlants.forEach((hero, index) => {
            const { code, fullName, stats } = hero;
            const winRateClass = getWinRateColorClass(stats.winRate);
            const hidden = index >= 5 ? 'class="hidden"' : '';
            
            plantTableHTML += `
                <tr ${hidden}>
                    <td>${code.toUpperCase()}</td>
                    <td>${fullName}</td>
                    <td>${stats.total}</td>
                    <td class="win-rate-cell ${winRateClass}">${stats.winRate.toFixed(1)}%</td>
                </tr>
            `;
        });
        
        plantHeroTable.querySelector('tbody').innerHTML = plantTableHTML;
    }

    // Generate player statistics
    function generatePlayerStats() {
        const playerStats = {};
        
        // Initialize player stats from game data
        gameData.forEach(game => {
            const { winner, loser } = game;
            
            if (!playerStats[winner]) {
                playerStats[winner] = { wins: 0, losses: 0, total: 0, winRate: 0 };
            }
            
            if (!playerStats[loser]) {
                playerStats[loser] = { wins: 0, losses: 0, total: 0, winRate: 0 };
            }
            
            playerStats[winner].wins++;
            playerStats[winner].total++;
            
            playerStats[loser].losses++;
            playerStats[loser].total++;
        });
        
        // Calculate win rates
        Object.keys(playerStats).forEach(player => {
            const stats = playerStats[player];
            stats.winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
        });
        
        // Prepare sorted player lists
        const players = Object.keys(playerStats).map(player => ({
            name: player,
            stats: playerStats[player]
        }));
        
        // Sort by win rate (minimum 5 games)
        const byWinRate = players
            .filter(player => player.stats.total >= 5)
            .sort((a, b) => b.stats.winRate - a.stats.winRate);
        
        // Sort by games played
        const byGamesPlayed = [...players].sort((a, b) => b.stats.total - a.stats.total);
        
        // Generate win rate table
        let winRateHTML = '';
        byWinRate.forEach((player, index) => {
            const { name, stats } = player;
            const winRateClass = getWinRateColorClass(stats.winRate);
            const hidden = index >= 10 ? 'class="hidden"' : '';
            
            winRateHTML += `
                <tr ${hidden}>
                    <td>${index + 1}</td>
                    <td>${name}</td>
                    <td>${stats.total}</td>
                    <td>${stats.wins}</td>
                    <td class="win-rate-cell ${winRateClass}">${stats.winRate.toFixed(1)}%</td>
                </tr>
            `;
        });
        
        playerWinRateTable.querySelector('tbody').innerHTML = winRateHTML;
        
        // Generate games played table
        let gamesPlayedHTML = '';
        byGamesPlayed.forEach((player, index) => {
            const { name, stats } = player;
            const winRateClass = getWinRateColorClass(stats.winRate);
            const hidden = index >= 10 ? 'class="hidden"' : '';
            
            gamesPlayedHTML += `
                <tr ${hidden}>
                    <td>${index + 1}</td>
                    <td>${name}</td>
                    <td>${stats.total}</td>
                    <td>${stats.wins}</td>
                    <td class="win-rate-cell ${winRateClass}">${stats.winRate.toFixed(1)}%</td>
                </tr>
            `;
        });
        
        playerGamesTable.querySelector('tbody').innerHTML = gamesPlayedHTML;
    }

    // Generate deck analysis for a specific player and hero/deck string
    function generateDeckAnalysis(hero, deckString) {
        // If no player is selected or there's no deck search criteria, show a message
        if (currentSelections.players.length === 0 && !currentSelections.opponent) {
            deckAnalysisContent.innerHTML = `
                <p class="empty-state">Please select at least one player and specify deck search criteria.</p>
            `;
            return;
        }
        
        // Get the relevant player(s)
        const players = currentSelections.players.length > 0 ? 
            currentSelections.players : [currentSelections.opponent];
        
        // Filter games by player and hero if specified
        let relevantGames = gameData.filter(game => 
            (players.includes(game.winner) || players.includes(game.loser))
        );
        
        if (hero) {
            relevantGames = relevantGames.filter(game => 
                (players.includes(game.winner) && game.winningHero === hero) || 
                (players.includes(game.loser) && game.losingHero === hero)
            );
        }
        
        if (relevantGames.length === 0) {
            deckAnalysisContent.innerHTML = `
                <p class="empty-state">No games found with the selected criteria.</p>
            `;
            return;
        }
        
        // Analyze deck performance
        const deckPerformance = {
            withString: { wins: 0, losses: 0, total: 0 },
            withoutString: { wins: 0, losses: 0, total: 0 }
        };
        
        relevantGames.forEach(game => {
            const isPlayerWinner = players.includes(game.winner);
            const deck = isPlayerWinner ? game.winningDeck : game.losingDeck;
            
            if (deckString && deck.toLowerCase().includes(deckString.toLowerCase())) {
                if (isPlayerWinner) {
                    deckPerformance.withString.wins++;
                } else {
                    deckPerformance.withString.losses++;
                }
                deckPerformance.withString.total++;
            } else {
                if (isPlayerWinner) {
                    deckPerformance.withoutString.wins++;
                } else {
                    deckPerformance.withoutString.losses++;
                }
                deckPerformance.withoutString.total++;
            }
        });
        
        // Calculate win rates
        const withStringWinRate = deckPerformance.withString.total > 0 ?
            (deckPerformance.withString.wins / deckPerformance.withString.total * 100).toFixed(1) : '0.0';
            
        const withoutStringWinRate = deckPerformance.withoutString.total > 0 ?
            (deckPerformance.withoutString.wins / deckPerformance.withoutString.total * 100).toFixed(1) : '0.0';
        
        // Get hero name if specified
        let heroName = "Any Hero";
        if (hero) {
            const foundZombieHero = zombieHeroes.find(h => h.code === hero);
            const foundPlantHero = plantHeroes.find(h => h.code === hero);
            if (foundZombieHero) heroName = foundZombieHero.fullName;
            if (foundPlantHero) heroName = foundPlantHero.fullName;
        }
        
        // Generate HTML
        let analysisHTML = `
            <div class="deck-analysis">
                <h4>Deck Analysis for ${players.join(', ')}</h4>
                <p>Hero: ${heroName}</p>
                <p>Deck String: ${deckString || 'None'}</p>
                
                <div class="deck-stats">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Deck Type</th>
                                <th>Games</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Win Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${deckString ? `Decks containing "${deckString}"` : 'All decks'}</td>
                                <td>${deckPerformance.withString.total}</td>
                                <td>${deckPerformance.withString.wins}</td>
                                <td>${deckPerformance.withString.losses}</td>
                                <td class="win-rate-cell ${getWinRateColorClass(withStringWinRate)}">${withStringWinRate}%</td>
                            </tr>`;
                            
        if (deckString) {
            analysisHTML += `
                <tr>
                    <td>Other decks</td>
                    <td>${deckPerformance.withoutString.total}</td>
                    <td>${deckPerformance.withoutString.wins}</td>
                    <td>${deckPerformance.withoutString.losses}</td>
                    <td class="win-rate-cell ${getWinRateColorClass(withoutStringWinRate)}">${withoutStringWinRate}%</td>
                </tr>`;
        }
        
        analysisHTML += `
                        </tbody>
                    </table>
                </div>
                
                <h4>Recent Games</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Result</th>
                            <th>Opponent</th>
                            <th>Hero</th>
                            <th>Vs Hero</th>
                            <th>Deck Name</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        // Add recent games
        relevantGames.slice(0, 10).forEach(game => {
            const isPlayerWinner = players.includes(game.winner);
            const playerHero = isPlayerWinner ? game.winningHero : game.losingHero;
            const opponentHero = isPlayerWinner ? game.losingHero : game.winningHero;
            const opponent = isPlayerWinner ? game.loser : game.winner;
            const deck = isPlayerWinner ? game.winningDeck : game.losingDeck;
            
            const playerHeroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === playerHero);
            const opponentHeroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === opponentHero);
            
            analysisHTML += `
                <tr>
                    <td>${formatDate(game.timestamp)}</td>
                    <td>${isPlayerWinner ? 'Win' : 'Loss'}</td>
                    <td>${opponent}</td>
                    <td title="${playerHeroObj ? playerHeroObj.fullName : ''}">${playerHero.toUpperCase()}</td>
                    <td title="${opponentHeroObj ? opponentHeroObj.fullName : ''}">${opponentHero.toUpperCase()}</td>
                    <td>${deck}</td>
                </tr>`;
        });
        
        analysisHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        deckAnalysisContent.innerHTML = analysisHTML;
    }

    // Generate opponent analysis
    function generateOpponentAnalysis() {
        if (!currentSelections.opponent) return;
        
        const opponent = currentSelections.opponent;
        selectedOpponentSpan.textContent = opponent;
        
        const opponentGames = gameData.filter(game => 
            game.winner === opponent || game.loser === opponent
        );
        
        if (opponentGames.length === 0) {
            opponentAnalysis.innerHTML = `
                <h2>Opponent Analysis: ${opponent}</h2>
                <p class="empty-state">No games found for this opponent.</p>
            `;
            opponentAnalysis.classList.remove('hidden');
            return;
        }
        
        // Count hero usage
        const heroUsage = {};
        
        opponentGames.forEach(game => {
            const isWinner = game.winner === opponent;
            const hero = isWinner ? game.winningHero : game.losingHero;
            
            if (!heroUsage[hero]) {
                heroUsage[hero] = {
                    total: 0,
                    wins: 0,
                    losses: 0,
                    winRate: 0
                };
            }
            
            heroUsage[hero].total++;
            if (isWinner) {
                heroUsage[hero].wins++;
            } else {
                heroUsage[hero].losses++;
            }
        });
        
        // Calculate win rates
        Object.keys(heroUsage).forEach(hero => {
            const stats = heroUsage[hero];
            stats.winRate = stats.total > 0 ? stats.wins / stats.total * 100 : 0;
        });
        
        // Sort heroes by usage and find worst matchups
        const sortedByUsage = Object.keys(heroUsage)
            .map(hero => ({ code: hero, stats: heroUsage[hero] }))
            .sort((a, b) => b.stats.total - a.stats.total);
            
        const sortedByWinRate = Object.keys(heroUsage)
            .filter(hero => heroUsage[hero].total >= 3) // Minimum 3 games
            .map(hero => ({ code: hero, stats: heroUsage[hero] }))
            .sort((a, b) => a.stats.winRate - b.stats.winRate);
        
        // Generate hero usage HTML
        let heroUsageHTML = '';
        sortedByUsage.slice(0, 6).forEach(item => {
            const { code, stats } = item;
            const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
            
            heroUsageHTML += `
                <div class="data-card">
                    <div class="hero" title="${heroObj ? heroObj.fullName : ''}">${code.toUpperCase()}</div>
                    <div class="value">${stats.total}</div>
                    <div class="label">games played</div>
                </div>
            `;
        });
        
        opponentHeroes.innerHTML = heroUsageHTML || '<p class="empty-state">No hero data available</p>';
        
        // Generate weakness HTML
        let weaknessHTML = '';
        sortedByWinRate.slice(0, 6).forEach(item => {
            const { code, stats } = item;
            const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
            
            weaknessHTML += `
                <div class="data-card">
                    <div class="hero" title="${heroObj ? heroObj.fullName : ''}">${code.toUpperCase()}</div>
                    <div class="value ${getWinRateColorClass(stats.winRate)}">${stats.winRate.toFixed(1)}%</div>
                    <div class="label">${stats.wins}W / ${stats.losses}L</div>
                </div>
            `;
        });
        
        opponentWeaknesses.innerHTML = weaknessHTML || '<p class="empty-state">No weakness data available</p>';
        
        // Show the opponent analysis
        opponentAnalysis.classList.remove('hidden');
    }

    // Generate teammate analysis
    function generateTeammateAnalysis() {
        if (!currentSelections.teammate) return;
        
        const teammate = currentSelections.teammate;
        selectedTeammateSpan.textContent = teammate;
        
        const teammateGames = gameData.filter(game => 
            game.winner === teammate || game.loser === teammate
        );
        
        if (teammateGames.length === 0) {
            teammateAnalysis.innerHTML = `
                <h2>Teammate Analysis: ${teammate}</h2>
                <p class="empty-state">No games found for this teammate.</p>
            `;
            teammateAnalysis.classList.remove('hidden');
            return;
        }
        
        // Count hero usage
        const heroUsage = {};
        
        teammateGames.forEach(game => {
            const isWinner = game.winner === teammate;
            const hero = isWinner ? game.winningHero : game.losingHero;
            
            if (!heroUsage[hero]) {
                heroUsage[hero] = {
                    total: 0,
                    wins: 0,
                    losses: 0,
                    winRate: 0
                };
            }
            
            heroUsage[hero].total++;
            if (isWinner) {
                heroUsage[hero].wins++;
            } else {
                heroUsage[hero].losses++;
            }
        });
        
        // Calculate win rates
        Object.keys(heroUsage).forEach(hero => {
            const stats = heroUsage[hero];
            stats.winRate = stats.total > 0 ? stats.wins / stats.total * 100 : 0;
        });
        
        // Sort heroes by win rate and usage
        const sortedByWinRate = Object.keys(heroUsage)
            .filter(hero => heroUsage[hero].total >= 3) // Minimum 3 games
            .map(hero => ({ code: hero, stats: heroUsage[hero] }))
            .sort((a, b) => b.stats.winRate - a.stats.winRate);
            
        const sortedByUsage = Object.keys(heroUsage)
            .map(hero => ({ code: hero, stats: heroUsage[hero] }))
            .sort((a, b) => b.stats.total - a.stats.total);
        
        // Generate best heroes HTML
        let bestHeroesHTML = '';
        sortedByWinRate.slice(0, 6).forEach(item => {
            const { code, stats } = item;
            const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
            
            bestHeroesHTML += `
                <div class="data-card">
                    <div class="hero" title="${heroObj ? heroObj.fullName : ''}">${code.toUpperCase()}</div>
                    <div class="value ${getWinRateColorClass(stats.winRate)}">${stats.winRate.toFixed(1)}%</div>
                    <div class="label">${stats.wins}W / ${stats.losses}L</div>
                </div>
            `;
        });
        
        teammateHeroes.innerHTML = bestHeroesHTML || '<p class="empty-state">No hero win rate data available</p>';
        
        // Generate most played heroes HTML
        let playedHeroesHTML = '';
        sortedByUsage.slice(0, 6).forEach(item => {
            const { code, stats } = item;
            const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
            
            playedHeroesHTML += `
                <div class="data-card">
                    <div class="hero" title="${heroObj ? heroObj.fullName : ''}">${code.toUpperCase()}</div>
                    <div class="value">${stats.total}</div>
                    <div class="label">games played</div>
                </div>
            `;
        });
        
        teammatePlayedHeroes.innerHTML = playedHeroesHTML || '<p class="empty-state">No hero usage data available</p>';
        
        // Show the teammate analysis
        teammateAnalysis.classList.remove('hidden');
    }

    // Helper function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // Helper function to get win rate color class
    function getWinRateColorClass(winRate) {
        winRate = parseFloat(winRate);
        
        if (winRate < 35) return 'wr-35-minus';
        if (winRate >= 65) return 'wr-65-plus';
        
        // Calculate class based on exact percentage
        // This ensures each win rate percentage has a slightly different color
        if (winRate >= 35 && winRate < 45) {
            const step = Math.floor(winRate) - 35;
            return `wr-${35 + step}-to-${36 + step}`;
        }
        else if (winRate >= 45 && winRate < 55) {
            const step = Math.floor(winRate) - 45;
            return `wr-${45 + step}-to-${46 + step}`;
        }
        else if (winRate >= 55 && winRate < 65) {
            const step = Math.floor(winRate) - 55;
            return `wr-${55 + step}-to-${56 + step}`;
        }
        
        return '';
    }

    // Call init when the page loads
    init();
});