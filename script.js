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
        firstPlayer: '',
        secondPlayer: '',
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
    const opponentResults = document.getElementById('opponentResults');
    const teammateResults = document.getElementById('teammateResults');
    const playerSearch = document.getElementById('playerSearch');
    const opponentSearch = document.getElementById('opponentSearch');
    const teammateSearch = document.getElementById('teammateSearch');
    const firstPlayerSearch = document.getElementById('firstPlayerSearch');
    const secondPlayerSearch = document.getElementById('secondPlayerSearch');
    const firstPlayerResults = document.getElementById('firstPlayerResults');
    const secondPlayerResults = document.getElementById('secondPlayerResults');
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
    const pvpAnalysisContent = document.getElementById('pvpAnalysisContent');
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

    // Capitalize the first letter of each word in a name
    function capitalizePlayerName(name) {
        return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
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
        playerSearch.addEventListener('input', () => filterPlayers(playerSearch.value, playerList, 'checkbox'));
        opponentSearch.addEventListener('input', () => filterPlayers(opponentSearch.value, opponentResults, 'clickable'));
        teammateSearch.addEventListener('input', () => filterPlayers(teammateSearch.value, teammateResults, 'clickable'));
        firstPlayerSearch.addEventListener('input', () => filterPlayers(firstPlayerSearch.value, firstPlayerResults, 'clickable'));
        secondPlayerSearch.addEventListener('input', () => filterPlayers(secondPlayerSearch.value, secondPlayerResults, 'clickable'));
        
        // Apply date range
        document.getElementById('applyDateBtn').addEventListener('click', applyDateRange);
        
        // Analyze button
        analyzeBtn.addEventListener('click', analyzeData);
        
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                switchTab(button.dataset.tab);
                analyzeData(); // Automatically analyze when switching tabs
            });
        });
        
        // Show more/less buttons
        setupShowMoreLessButtons();
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
        opponentResults.innerHTML = '';
        teammateResults.innerHTML = '';
        firstPlayerResults.innerHTML = '';
        secondPlayerResults.innerHTML = '';
        
        // Filter players if needed
        const filteredPlayers = filter ? 
            allPlayers.filter(player => player.toLowerCase().includes(filter.toLowerCase())) : 
            allPlayers;
        
        // Add to checkbox list for player selection
        filteredPlayers.forEach(player => {
            const displayName = capitalizePlayerName(player);
            const item = createCheckboxItem(player, displayName, 'player');
            playerList.appendChild(item);
        });
        
        // Add clickable items to opponent results
        filteredPlayers.forEach(player => {
            const displayName = capitalizePlayerName(player);
            const item = document.createElement('div');
            item.className = 'player-result-item';
            item.textContent = displayName;
            item.dataset.value = player;
            item.addEventListener('click', () => {
                handleOpponentSelection(player);
            });
            opponentResults.appendChild(item);
        });
        
        // Add clickable items to teammate results
        filteredPlayers.forEach(player => {
            const displayName = capitalizePlayerName(player);
            const item = document.createElement('div');
            item.className = 'player-result-item';
            item.textContent = displayName;
            item.dataset.value = player;
            item.addEventListener('click', () => {
                handleTeammateSelection(player);
            });
            teammateResults.appendChild(item);
        });
        
        // Add clickable items to first player results
        filteredPlayers.forEach(player => {
            const displayName = capitalizePlayerName(player);
            const item = document.createElement('div');
            item.className = 'player-result-item';
            item.textContent = displayName;
            item.dataset.value = player;
            item.addEventListener('click', () => {
                currentSelections.firstPlayer = player;
                firstPlayerSearch.value = displayName;
                firstPlayerResults.querySelectorAll('.player-result-item').forEach(el => {
                    el.classList.remove('selected');
                });
                item.classList.add('selected');
            });
            firstPlayerResults.appendChild(item);
        });
        
        // Add clickable items to second player results
        filteredPlayers.forEach(player => {
            const displayName = capitalizePlayerName(player);
            const item = document.createElement('div');
            item.className = 'player-result-item';
            item.textContent = displayName;
            item.dataset.value = player;
            item.addEventListener('click', () => {
                currentSelections.secondPlayer = player;
                secondPlayerSearch.value = displayName;
                secondPlayerResults.querySelectorAll('.player-result-item').forEach(el => {
                    el.classList.remove('selected');
                });
                item.classList.add('selected');
            });
            secondPlayerResults.appendChild(item);
        });
    }

    // Filter players based on search input
    function filterPlayers(query, targetElement, type) {
        targetElement.innerHTML = '';
        
        const filteredPlayers = allPlayers.filter(player => 
            player.toLowerCase().includes(query.toLowerCase())
        );
        
        if (type === 'checkbox') {
            // For checkbox list (player selection)
            filteredPlayers.forEach(player => {
                const displayName = capitalizePlayerName(player);
                const item = createCheckboxItem(player, displayName, 'player');
                targetElement.appendChild(item);
            });
        } 
        else if (type === 'clickable') {
            // For clickable items (opponent, teammate, pvp)
            filteredPlayers.forEach(player => {
                const displayName = capitalizePlayerName(player);
                const item = document.createElement('div');
                item.className = 'player-result-item';
                item.textContent = displayName;
                item.dataset.value = player;
                
                if (targetElement === opponentResults) {
                    item.addEventListener('click', () => handleOpponentSelection(player));
                    if (player === currentSelections.opponent) {
                        item.classList.add('selected');
                    }
                } 
                else if (targetElement === teammateResults) {
                    item.addEventListener('click', () => handleTeammateSelection(player));
                    if (player === currentSelections.teammate) {
                        item.classList.add('selected');
                    }
                }
                else if (targetElement === firstPlayerResults) {
                    item.addEventListener('click', () => {
                        currentSelections.firstPlayer = player;
                        firstPlayerSearch.value = displayName;
                        firstPlayerResults.querySelectorAll('.player-result-item').forEach(el => {
                            el.classList.remove('selected');
                        });
                        item.classList.add('selected');
                    });
                    if (player === currentSelections.firstPlayer) {
                        item.classList.add('selected');
                    }
                }
                else if (targetElement === secondPlayerResults) {
                    item.addEventListener('click', () => {
                        currentSelections.secondPlayer = player;
                        secondPlayerSearch.value = displayName;
                        secondPlayerResults.querySelectorAll('.player-result-item').forEach(el => {
                            el.classList.remove('selected');
                        });
                        item.classList.add('selected');
                    });
                    if (player === currentSelections.secondPlayer) {
                        item.classList.add('selected');
                    }
                }
                
                targetElement.appendChild(item);
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
    function handleOpponentSelection(player) {
        currentSelections.opponent = player;
        opponentSearch.value = capitalizePlayerName(player);
        
        // Mark as selected in the UI
        opponentResults.querySelectorAll('.player-result-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.value === player) {
                item.classList.add('selected');
            }
        });
        
        // Clear player checkboxes when an opponent is selected
        const playerCheckboxes = playerList.querySelectorAll('input[type="checkbox"]');
        playerCheckboxes.forEach(cb => {
            cb.checked = false;
        });
        currentSelections.players = [];
        
        console.log('Selected opponent:', currentSelections.opponent);
    }

    // Handle teammate selection
    function handleTeammateSelection(player) {
        currentSelections.teammate = player;
        teammateSearch.value = capitalizePlayerName(player);
        
        // Mark as selected in the UI
        teammateResults.querySelectorAll('.player-result-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.value === player) {
                item.classList.add('selected');
            }
        });
        
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
        
        // Opponent analysis show more/less buttons
        document.getElementById('showMoreOpponentHeroes').addEventListener('click', () => {
            showMoreCards(opponentHeroes);
            document.getElementById('showMoreOpponentHeroes').classList.add('hidden');
            document.getElementById('showLessOpponentHeroes').classList.remove('hidden');
        });
        
        document.getElementById('showLessOpponentHeroes').addEventListener('click', () => {
            showLessCards(opponentHeroes, 6);
            document.getElementById('showMoreOpponentHeroes').classList.remove('hidden');
            document.getElementById('showLessOpponentHeroes').classList.add('hidden');
        });
        
        document.getElementById('showMoreOpponentWeaknesses').addEventListener('click', () => {
            showMoreCards(opponentWeaknesses);
            document.getElementById('showMoreOpponentWeaknesses').classList.add('hidden');
            document.getElementById('showLessOpponentWeaknesses').classList.remove('hidden');
        });
        
        document.getElementById('showLessOpponentWeaknesses').addEventListener('click', () => {
            showLessCards(opponentWeaknesses, 6);
            document.getElementById('showMoreOpponentWeaknesses').classList.remove('hidden');
            document.getElementById('showLessOpponentWeaknesses').classList.add('hidden');
        });
        
        // Teammate analysis show more/less buttons
        document.getElementById('showMoreTeammateHeroes').addEventListener('click', () => {
            showMoreCards(teammateHeroes);
            document.getElementById('showMoreTeammateHeroes').classList.add('hidden');
            document.getElementById('showLessTeammateHeroes').classList.remove('hidden');
        });
        
        document.getElementById('showLessTeammateHeroes').addEventListener('click', () => {
            showLessCards(teammateHeroes, 6);
            document.getElementById('showMoreTeammateHeroes').classList.remove('hidden');
            document.getElementById('showLessTeammateHeroes').classList.add('hidden');
        });
        
        document.getElementById('showMoreTeammatePlayedHeroes').addEventListener('click', () => {
            showMoreCards(teammatePlayedHeroes);
            document.getElementById('showMoreTeammatePlayedHeroes').classList.add('hidden');
            document.getElementById('showLessTeammatePlayedHeroes').classList.remove('hidden');
        });
        
        document.getElementById('showLessTeammatePlayedHeroes').addEventListener('click', () => {
            showLessCards(teammatePlayedHeroes, 6);
            document.getElementById('showMoreTeammatePlayedHeroes').classList.remove('hidden');
            document.getElementById('showLessTeammatePlayedHeroes').classList.add('hidden');
        });
    }

    // Show more cards for hero analysis
    function showMoreCards(container) {
        const allCards = container.querySelectorAll('.data-card');
        allCards.forEach(card => {
            card.classList.remove('hidden');
        });
    }
    
    // Show fewer cards for hero analysis
    function showLessCards(container, count) {
        const allCards = container.querySelectorAll('.data-card');
        allCards.forEach((card, index) => {
            if (index >= count) {
                card.classList.add('hidden');
            } else {
                card.classList.remove('hidden');
            }
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
        loadingIndicator.classList.add('visible');
        
        try {
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
                case 'pvp':
                    generatePvPAnalysis();
                    break;
            }
            
            // Handle opponent or teammate selection if present
            if (currentSelections.opponent) {
                generateOpponentAnalysis();
                teammateAnalysis.classList.add('hidden');
            } else {
                opponentAnalysis.classList.add('hidden');
            }
            
            if (currentSelections.teammate) {
                generateTeammateAnalysis();
                opponentAnalysis.classList.add('hidden');
            } else {
                teammateAnalysis.classList.add('hidden');
            }
            
        } catch (error) {
            console.error('Error analyzing data:', error);
            alert('Error analyzing data. Please check the console for details.');
        } finally {
            // Hide loading indicator
            loadingIndicator.classList.remove('visible');
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
                            return `<td class="matchup-cell"><span class="cell-top na-text">N/A</span><span class="cell-bottom na-text">N/A</span></td>`;
                        }
                        
                        // Calculate win rates from both perspectives
                        const zombieWinRate = (matchup.zombieWins / total * 100).toFixed(1);
                        const plantWinRate = (matchup.plantWins / total * 100).toFixed(1);
                        
                        const zombieColorClass = getWinRateColorClass(zombieWinRate);
                        const plantColorClass = getWinRateColorClass(plantWinRate);
                        
                        return `<td class="matchup-cell" title="${plant.fullName} vs ${zombie.fullName}: ${total} games">
                            <span class="cell-top ${plantColorClass}">${plantWinRate}%</span>
                            <span class="cell-bottom ${zombieColorClass}">${zombieWinRate}%</span>
                        </td>`;
                    }).join('')}
                    <td class="matchup-cell">
                        <span class="cell-top">${zombieTotalGames > 0 ? ((zombieTotalGames - zombieTotalWins) / zombieTotalGames * 100).toFixed(1) + '%' : 'N/A'}</span>
                        <span class="cell-bottom">${zombieTotalGames > 0 ? (zombieTotalWins / zombieTotalGames * 100).toFixed(1) + '%' : 'N/A'}</span>
                    </td>
                </tr>
            `;
            
            tableHTML += rowHTML;
        });
        
        // Add total row
        let totalRowHTML = `<tr>
            <th>Total</th>`;
            
        plantHeroes.forEach(plant => {
            let plantTotalWins = 0;
            let plantTotalGames = 0;
            
            zombieHeroes.forEach(zombie => {
                const matchup = matchupGrid[zombie.code][plant.code];
                plantTotalWins += matchup.plantWins;
                plantTotalGames += matchup.total;
            });
            
            const plantWinRate = plantTotalGames > 0 ? (plantTotalWins / plantTotalGames * 100).toFixed(1) : 0;
            const zombieWinRate = plantTotalGames > 0 ? ((plantTotalGames - plantTotalWins) / plantTotalGames * 100).toFixed(1) : 0;
            
            totalRowHTML += `<td class="matchup-cell">
                <span class="cell-top">${plantTotalGames > 0 ? plantWinRate + '%' : 'N/A'}</span>
                <span class="cell-bottom">${plantTotalGames > 0 ? zombieWinRate + '%' : 'N/A'}</span>
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
        
        const overallZombieWinRate = overallGames > 0 ? (overallZombieWins / overallGames * 100).toFixed(1) : 0;
        const overallPlantWinRate = overallGames > 0 ? ((overallGames - overallZombieWins) / overallGames * 100).toFixed(1) : 0;
        
        totalRowHTML += `<td class="matchup-cell">
            <span class="cell-top">${overallGames > 0 ? overallPlantWinRate + '%' : 'N/A'}</span>
            <span class="cell-bottom">${overallGames > 0 ? overallZombieWinRate + '%' : 'N/A'}</span>
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
        
        // If a single player is selected, display them separately
        let selectedPlayerHTML = '';
        const selectedPlayerStats = currentSelections.players.length === 1 ? 
            playerStats[currentSelections.players[0]] : null;
        
        if (selectedPlayerStats) {
            const playerName = capitalizePlayerName(currentSelections.players[0]);
            selectedPlayerHTML = `
                <div class="selected-player-card">
                    <h3>${playerName}</h3>
                    <div class="selected-player-stats">
                        <div class="selected-stat-item">
                            <div class="selected-stat-label">Games</div>
                            <div class="selected-stat-value">${selectedPlayerStats.total}</div>
                        </div>
                        <div class="selected-stat-item">
                            <div class="selected-stat-label">Wins</div>
                            <div class="selected-stat-value">${selectedPlayerStats.wins}</div>
                        </div>
                        <div class="selected-stat-item">
                            <div class="selected-stat-label">Losses</div>
                            <div class="selected-stat-value">${selectedPlayerStats.losses}</div>
                        </div>
                        <div class="selected-stat-item">
                            <div class="selected-stat-label">Win Rate</div>
                            <div class="selected-stat-value">${selectedPlayerStats.winRate.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove the selected player from the stats object for the tables
            delete playerStats[currentSelections.players[0]];
        }
        
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
        
        // Insert the selected player's stats if exists
        if (selectedPlayerHTML) {
            const container = document.createElement('div');
            container.innerHTML = selectedPlayerHTML;
            playerWinRateTable.parentNode.insertBefore(container, playerWinRateTable);
        }
        
        // Generate win rate table
        let winRateHTML = '';
        byWinRate.forEach((player, index) => {
            const { name, stats } = player;
            const displayName = capitalizePlayerName(name);
            const winRateClass = getWinRateColorClass(stats.winRate);
            const hidden = index >= 10 ? 'class="hidden"' : '';
            
            winRateHTML += `
                <tr ${hidden}>
                    <td>${index + 1}</td>
                    <td>${displayName}</td>
                    <td>${stats.total}</td>
                    <td>${stats.wins}</td>
                    <td class="win-rate-cell ${winRateClass}">${stats.winRate.toFixed(1)}%</td>
                </tr>
            `;
        });
        
        playerWinRateTable.querySelector('tbody').innerHTML = winRateHTML || '<tr><td colspan="5" class="empty-state">No qualifying players (minimum 5 games)</td></tr>';
        
        // Generate games played table
        let gamesPlayedHTML = '';
        byGamesPlayed.forEach((player, index) => {
            const { name, stats } = player;
            const displayName = capitalizePlayerName(name);
            const winRateClass = getWinRateColorClass(stats.winRate);
            const hidden = index >= 10 ? 'class="hidden"' : '';
            
            gamesPlayedHTML += `
                <tr ${hidden}>
                    <td>${index + 1}</td>
                    <td>${displayName}</td>
                    <td>${stats.total}</td>
                    <td>${stats.wins}</td>
                    <td class="win-rate-cell ${winRateClass}">${stats.winRate.toFixed(1)}%</td>
                </tr>
            `;
        });
        
        playerGamesTable.querySelector('tbody').innerHTML = gamesPlayedHTML || '<tr><td colspan="5" class="empty-state">No players found</td></tr>';
    }

    // Generate player vs player analysis
    function generatePvPAnalysis() {
        // Check if both players are selected
        if (!currentSelections.firstPlayer || !currentSelections.secondPlayer) {
            pvpAnalysisContent.innerHTML = `
                <p class="empty-state">Please select both players to see head-to-head statistics.</p>
            `;
            return;
        }
        
        const player1 = currentSelections.firstPlayer;
        const player2 = currentSelections.secondPlayer;
        const displayName1 = capitalizePlayerName(player1);
        const displayName2 = capitalizePlayerName(player2);
        
        // Find all games between these two players
        const headToHeadGames = gameData.filter(game => 
            (game.winner === player1 && game.loser === player2) || 
            (game.winner === player2 && game.loser === player1)
        );
        
        if (headToHeadGames.length === 0) {
            pvpAnalysisContent.innerHTML = `
                <p class="empty-state">No games found between ${displayName1} and ${displayName2}.</p>
            `;
            return;
        }
        
        // Calculate stats
        const player1Wins = headToHeadGames.filter(game => game.winner === player1).length;
        const player2Wins = headToHeadGames.filter(game => game.winner === player2).length;
        const player1WinRate = (player1Wins / headToHeadGames.length * 100).toFixed(1);
        const player2WinRate = (player2Wins / headToHeadGames.length * 100).toFixed(1);
        
        // Get hero usage for each player
        const player1Heroes = {};
        const player2Heroes = {};
        
        headToHeadGames.forEach(game => {
            if (game.winner === player1) {
                if (!player1Heroes[game.winningHero]) player1Heroes[game.winningHero] = { wins: 0, losses: 0 };
                player1Heroes[game.winningHero].wins++;
                
                if (!player2Heroes[game.losingHero]) player2Heroes[game.losingHero] = { wins: 0, losses: 0 };
                player2Heroes[game.losingHero].losses++;
            } else {
                if (!player2Heroes[game.winningHero]) player2Heroes[game.winningHero] = { wins: 0, losses: 0 };
                player2Heroes[game.winningHero].wins++;
                
                if (!player1Heroes[game.losingHero]) player1Heroes[game.losingHero] = { wins: 0, losses: 0 };
                player1Heroes[game.losingHero].losses++;
            }
        });
        
        // Generate HTML
        let analysisHTML = `
            <div class="pvp-analysis">
                <h4>${displayName1} vs ${displayName2} - Head to Head</h4>
                
                <div class="pvp-stats">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Games</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Win Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${displayName1}</td>
                                <td>${headToHeadGames.length}</td>
                                <td>${player1Wins}</td>
                                <td>${player2Wins}</td>
                                <td class="win-rate-cell ${getWinRateColorClass(player1WinRate)}">${player1WinRate}%</td>
                            </tr>
                            <tr>
                                <td>${displayName2}</td>
                                <td>${headToHeadGames.length}</td>
                                <td>${player2Wins}</td>
                                <td>${player1Wins}</td>
                                <td class="win-rate-cell ${getWinRateColorClass(player2WinRate)}">${player2WinRate}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="pvp-hero-stats">
                    <h4>Heroes Used</h4>
                    <div class="player-hero-grid">
                        <div class="player-hero-column">
                            <h5>${displayName1}'s Heroes</h5>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Hero</th>
                                        <th>Games</th>
                                        <th>Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generatePlayerHeroesHTML(player1Heroes)}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="player-hero-column">
                            <h5>${displayName2}'s Heroes</h5>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Hero</th>
                                        <th>Games</th>
                                        <th>Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generatePlayerHeroesHTML(player2Heroes)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <h4>Recent Games</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Winner</th>
                            <th>Winner Hero</th>
                            <th>Loser</th>
                            <th>Loser Hero</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        // Add recent games
        headToHeadGames.slice(0, 10).forEach(game => {
            const winnerHeroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === game.winningHero);
            const loserHeroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === game.losingHero);
            
            analysisHTML += `
                <tr>
                    <td>${formatDate(game.timestamp)}</td>
                    <td>${capitalizePlayerName(game.winner)}</td>
                    <td title="${winnerHeroObj ? winnerHeroObj.fullName : ''}">${game.winningHero.toUpperCase()}</td>
                    <td>${capitalizePlayerName(game.loser)}</td>
                    <td title="${loserHeroObj ? loserHeroObj.fullName : ''}">${game.losingHero.toUpperCase()}</td>
                </tr>`;
        });
        
        analysisHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        pvpAnalysisContent.innerHTML = analysisHTML;
        
        // Helper function to generate hero stats HTML
        function generatePlayerHeroesHTML(heroStats) {
            const heroEntries = Object.entries(heroStats).map(([code, stats]) => {
                const total = stats.wins + stats.losses;
                const winRate = total > 0 ? (stats.wins / total * 100).toFixed(1) : '0.0';
                const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
                const heroName = heroObj ? heroObj.fullName : code.toUpperCase();
                
                return {
                    code,
                    fullName: heroName,
                    total,
                    winRate
                };
            }).sort((a, b) => b.total - a.total);
            
            if (heroEntries.length === 0) {
                return '<tr><td colspan="3" class="empty-state">No hero data available</td></tr>';
            }
            
            return heroEntries.map(hero => {
                const winRateClass = getWinRateColorClass(hero.winRate);
                return `
                    <tr>
                        <td title="${hero.fullName}">${hero.code.toUpperCase()}</td>
                        <td>${hero.total}</td>
                        <td class="win-rate-cell ${winRateClass}">${hero.winRate}%</td>
                    </tr>`;
            }).join('');
        }
    }

    // Generate opponent analysis
    function generateOpponentAnalysis() {
        if (!currentSelections.opponent) return;
        
        const opponent = currentSelections.opponent;
        selectedOpponentSpan.textContent = capitalizePlayerName(opponent);
        
        const opponentGames = gameData.filter(game => 
            game.winner === opponent || game.loser === opponent
        );
        
        if (opponentGames.length === 0) {
            opponentAnalysis.innerHTML = `
                <h2>Opponent Analysis: ${capitalizePlayerName(opponent)}</h2>
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
        sortedByUsage.forEach((item, index) => {
            const { code, stats } = item;
            const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
            const hiddenClass = index >= 6 ? 'hidden' : '';
            
            heroUsageHTML += `
                <div class="data-card ${hiddenClass}">
                    <div class="hero" title="${heroObj ? heroObj.fullName : ''}">${code.toUpperCase()}</div>
                    <div class="value">${stats.total}</div>
                    <div class="label">games played</div>
                </div>
            `;
        });
        
        opponentHeroes.innerHTML = heroUsageHTML || '<p class="empty-state">No hero data available</p>';
        
        // Generate weakness HTML
        let weaknessHTML = '';
        sortedByWinRate.forEach((item, index) => {
            const { code, stats } = item;
            const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
            const hiddenClass = index >= 6 ? 'hidden' : '';
            
            weaknessHTML += `
                <div class="data-card ${hiddenClass}">
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
        selectedTeammateSpan.textContent = capitalizePlayerName(teammate);
        
        const teammateGames = gameData.filter(game => 
            game.winner === teammate || game.loser === teammate
        );
        
        if (teammateGames.length === 0) {
            teammateAnalysis.innerHTML = `
                <h2>Teammate Analysis: ${capitalizePlayerName(teammate)}</h2>
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
        sortedByWinRate.forEach((item, index) => {
            const { code, stats } = item;
            const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
            const hiddenClass = index >= 6 ? 'hidden' : '';
            
            bestHeroesHTML += `
                <div class="data-card ${hiddenClass}">
                    <div class="hero" title="${heroObj ? heroObj.fullName : ''}">${code.toUpperCase()}</div>
                    <div class="value ${getWinRateColorClass(stats.winRate)}">${stats.winRate.toFixed(1)}%</div>
                    <div class="label">${stats.wins}W / ${stats.losses}L</div>
                </div>
            `;
        });
        
        teammateHeroes.innerHTML = bestHeroesHTML || '<p class="empty-state">No hero win rate data available</p>';
        
        // Generate most played heroes HTML
        let playedHeroesHTML = '';
        sortedByUsage.forEach((item, index) => {
            const { code, stats } = item;
            const heroObj = [...zombieHeroes, ...plantHeroes].find(h => h.code === code);
            const hiddenClass = index >= 6 ? 'hidden' : '';
            
            playedHeroesHTML += `
                <div class="data-card ${hiddenClass}">
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
    
    // Add CSS to style the player-hero-grid
    const style = document.createElement('style');
    style.innerHTML = `
        .pvp-hero-stats {
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        .player-hero-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        
        .player-hero-column h5 {
            margin-top: 0;
            margin-bottom: 10px;
            color: var(--accent-color);
        }
    `;
    document.head.appendChild(style);
});