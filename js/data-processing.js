/**
 * Data processing for PVZ Heroes Winrate Analyzer
 */

// Game data structure
class GameData {
  constructor() {
    this.games = [];
    this.players = new Set();
    this.heroes = new Set();
    this.decks = new Set();
    this.tournaments = new Set();
    this.patches = new Set();
  }

  async loadData(
    selectedPatches = [],
    selectedTournaments = [],
    startDate = null,
    endDate = null,
  ) {
    this.games = [];

    // If no patches selected, assume all
    if (!selectedPatches || selectedPatches.length === 0) {
      const allPatches = await getAllPatches();
      selectedPatches = allPatches;
    }

    // Get the global list of tournaments upfront
    const allTournaments = await this.fetchTournamentsForPatch("p1"); // We use p1 as the source of truth

    // Load data from each selected patch
    for (const patch of selectedPatches) {
      try {
        // For each tournament in the global list
        for (const tournament of allTournaments) {
          // Skip if not in selected tournaments (when filter is active)
          if (
            selectedTournaments &&
            selectedTournaments.length > 0 &&
            !selectedTournaments.includes(tournament)
          ) {
            continue;
          }

          // Load tournament data (will return empty array if file doesn't exist)
          const tournamentData = await this.fetchTournamentData(
            patch,
            tournament,
          );

          // Process each game
          for (const game of tournamentData) {
            // Filter by date if startDate and endDate are provided
            if (startDate || endDate) {
              if (!isDateInRange(game.time, startDate, endDate)) {
                continue;
              }
            }

            // Add to games array
            this.games.push(game);

            // Update sets
            this.players.add(game.winner);
            this.players.add(game.loser);
            this.heroes.add(game.winningHero);
            this.heroes.add(game.losingHero);
            this.decks.add(game.winningDeck);
            this.decks.add(game.losingDeck);
            this.tournaments.add(tournament);
            this.patches.add(patch);
          }
        }
      } catch (error) {
        console.warn(`Error loading data for patch ${patch}:`, error);
      }
    }

    return this.games;
  }

  async fetchTournamentsForPatch(patch) {
      try {
          // Use the tournaments.json file which contains all tournaments across all patches
          const response = await fetch("datafiles/tournaments.json");
          if (!response.ok) {
              throw new Error(`Failed to fetch tournaments list`);
          }
            
          const tournaments = await response.json();
            
          // Return all tournaments - we'll handle missing ones during data loading
          return tournaments;
      } catch (error) {
          console.warn(
            `Error fetching tournaments list, using fallback list:`,
            error,
          );
          // Fallback to hardcoded tournaments if available
          return ["Quicksand Live", "Quicksand Ranked"];
      }
  }

  async fetchTournamentData(patch, tournament) {
    try {
      const response = await fetch(`datafiles/${patch}/${tournament}.txt`);
      if (!response.ok) {
        console.warn(
          `Tournament file not found: datafiles/${patch}/${tournament}.txt`,
        );
        return []; // Return empty array for missing files
      }

      const text = await response.text();
      const games = [];

      // Process each line in the tournament data
      const lines = text.trim().split("\n");
      for (const line of lines) {
        const [
          time,
          winner,
          loser,
          winningHero,
          losingHero,
          winningDeck,
          losingDeck,
        ] = line.split("|");

        if (time && winner && loser && winningHero && losingHero) {
          games.push({
            time,
            winner,
            loser,
            winningHero,
            losingHero,
            winningDeck: winningDeck || "Unknown",
            losingDeck: losingDeck || "Unknown",
            patch,
            tournament,
          });
        }
      }

      return games;
    } catch (error) {
      console.warn(
        `Error fetching data for tournament ${tournament} in patch ${patch}:`,
        error,
      );
      return []; // Return empty array on any error
    }
  }

  getPlayerGames(playerName) {
    return this.games.filter(
      (game) =>
        game.winner.toLowerCase() === playerName.toLowerCase() ||
        game.loser.toLowerCase() === playerName.toLowerCase(),
    );
  }

  getPlayerWinRate(playerName) {
    const games = this.getPlayerGames(playerName);
    if (games.length === 0) return 0;

    const wins = games.filter(
      (game) => game.winner.toLowerCase() === playerName.toLowerCase(),
    ).length;
    return (wins / games.length) * 100;
  }

  getHeroMatchupData() {
    const matchups = {};
    const counts = {};

    // Initialize the matchup data structure
    for (const hero1 of this.heroes) {
      matchups[hero1] = {};
      counts[hero1] = {};

      for (const hero2 of this.heroes) {
        matchups[hero1][hero2] = { wins: 0, total: 0 };
        counts[hero1][hero2] = 0;
      }
    }

    // Populate with game data
    for (const game of this.games) {
      const { winningHero, losingHero } = game;

      // Update from winning hero's perspective
      if (!matchups[winningHero][losingHero]) {
        matchups[winningHero][losingHero] = { wins: 0, total: 0 };
      }
      matchups[winningHero][losingHero].wins++;
      matchups[winningHero][losingHero].total++;

      // Update from losing hero's perspective
      if (!matchups[losingHero][winningHero]) {
        matchups[losingHero][winningHero] = { wins: 0, total: 0 };
      }
      matchups[losingHero][winningHero].total++;
    }

    return matchups;
  }

  getHeroWinRates() {
    const winRates = {};

    for (const hero of this.heroes) {
      const wins = this.games.filter(
        (game) => game.winningHero === hero,
      ).length;
      const total = this.games.filter(
        (game) => game.winningHero === hero || game.losingHero === hero,
      ).length;

      winRates[hero] = {
        wins,
        total,
        winRate: total > 0 ? (wins / total) * 100 : 0,
      };
    }

    return winRates;
  }

  getPlayerHeroStats(playerName) {
    const games = this.getPlayerGames(playerName);
    const heroStats = {};

    for (const game of games) {
      let hero;
      let isWin = false;

      if (game.winner.toLowerCase() === playerName.toLowerCase()) {
        hero = game.winningHero;
        isWin = true;
      } else {
        hero = game.losingHero;
      }

      if (!heroStats[hero]) {
        heroStats[hero] = { played: 0, wins: 0 };
      }

      heroStats[hero].played++;
      if (isWin) {
        heroStats[hero].wins++;
      }
    }

    // Calculate win rates
    for (const hero in heroStats) {
      heroStats[hero].winRate =
        (heroStats[hero].wins / heroStats[hero].played) * 100;
    }

    return heroStats;
  }

  getPlayerDeckStats(playerName) {
    const games = this.getPlayerGames(playerName);
    const deckStats = {};

    for (const game of games) {
      let deck;
      let isWin = false;

      if (game.winner.toLowerCase() === playerName.toLowerCase()) {
        deck = game.winningDeck;
        isWin = true;
      } else {
        deck = game.losingDeck;
      }

      if (!deckStats[deck]) {
        deckStats[deck] = { played: 0, wins: 0 };
      }

      deckStats[deck].played++;
      if (isWin) {
        deckStats[deck].wins++;
      }
    }

    // Calculate win rates
    for (const deck in deckStats) {
      deckStats[deck].winRate =
        (deckStats[deck].wins / deckStats[deck].played) * 100;
    }

    return deckStats;
  }

  getPlayerHeroMatchups(playerName) {
    const games = this.getPlayerGames(playerName);
    const matchups = {};

    for (const game of games) {
      let ownHero, oppHero;
      let isWin = false;

      if (game.winner.toLowerCase() === playerName.toLowerCase()) {
        ownHero = game.winningHero;
        oppHero = game.losingHero;
        isWin = true;
      } else {
        ownHero = game.losingHero;
        oppHero = game.winningHero;
      }

      if (!matchups[ownHero]) {
        matchups[ownHero] = {};
      }

      if (!matchups[ownHero][oppHero]) {
        matchups[ownHero][oppHero] = { played: 0, wins: 0 };
      }

      matchups[ownHero][oppHero].played++;
      if (isWin) {
        matchups[ownHero][oppHero].wins++;
      }
    }

    // Calculate win rates
    for (const ownHero in matchups) {
      for (const oppHero in matchups[ownHero]) {
        matchups[ownHero][oppHero].winRate =
          (matchups[ownHero][oppHero].wins /
            matchups[ownHero][oppHero].played) *
          100;
      }
    }

    return matchups;
  }

  getPlayerRankings() {
    const players = Array.from(this.players);
    const rankings = [];

    for (const playerName of players) {
      const games = this.getPlayerGames(playerName);
      if (games.length === 0) continue;

      const wins = games.filter(
        (game) => game.winner.toLowerCase() === playerName.toLowerCase(),
      ).length;
      const winRate = (wins / games.length) * 100;

      rankings.push({
        name: playerName,
        games: games.length,
        wins,
        losses: games.length - wins,
        winRate,
      });
    }

    return rankings;
  }

  // Function to filter games for specific players
  filterGamesForPlayers(playerNames) {
    if (!playerNames || playerNames.length === 0) {
      return this.games;
    }

    // Convert player names to lowercase for case-insensitive comparison
    const lowerCaseNames = playerNames.map((name) => name.toLowerCase());

    return this.games.filter((game) => {
      const winnerLower = game.winner.toLowerCase();
      const loserLower = game.loser.toLowerCase();

      return (
        lowerCaseNames.includes(winnerLower) ||
        lowerCaseNames.includes(loserLower)
      );
    });
  }

  // Function to get only matches between specific players
  getMatchesBetweenPlayers(playerNames) {
    if (!playerNames || playerNames.length <= 1) {
      return [];
    }

    // Convert player names to lowercase for case-insensitive comparison
    const lowerCaseNames = playerNames.map((name) => name.toLowerCase());

    return this.games.filter((game) => {
      const winnerLower = game.winner.toLowerCase();
      const loserLower = game.loser.toLowerCase();

      return (
        lowerCaseNames.includes(winnerLower) &&
        lowerCaseNames.includes(loserLower)
      );
    });
  }

  getDeckStatsForPlayers(playerNames, deckLibrary) {
    if (
      !playerNames ||
      playerNames.length === 0 ||
      !deckLibrary ||
      deckLibrary.length === 0
    ) {
      return [];
    }

    // Filter to only the selected players' games
    const selectedGames = this.filterGamesForPlayers(playerNames);
    const deckResults = [];

    // Process each deck in the library
    deckLibrary.forEach((deck) => {
      const deckResult = {
        name: deck.name,
        played: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        players: {},
      };

      // Set of aliases including deck name
      const aliases = new Set([
        deck.name.toLowerCase(),
        ...(deck.aliases || []).map((a) => a.toLowerCase()),
      ]);

      // Look through games for matching decks
      selectedGames.forEach((game) => {
        const winningDeckLower = game.winningDeck.toLowerCase();
        const losingDeckLower = game.losingDeck.toLowerCase();

        // Check if this game involved our deck
        if (aliases.has(winningDeckLower) || aliases.has(losingDeckLower)) {
          let playerName, isWin;

          if (aliases.has(winningDeckLower)) {
            playerName = game.winner;
            isWin = true;
          } else {
            playerName = game.loser;
            isWin = false;
          }

          // Track overall stats
          deckResult.played++;
          if (isWin) {
            deckResult.wins++;
          } else {
            deckResult.losses++;
          }

          // Track per-player stats
          if (!deckResult.players[playerName]) {
            deckResult.players[playerName] = {
              played: 0,
              wins: 0,
              losses: 0,
              winRate: 0,
            };
          }

          deckResult.players[playerName].played++;
          if (isWin) {
            deckResult.players[playerName].wins++;
          } else {
            deckResult.players[playerName].losses++;
          }
        }
      });

      // Calculate win rates
      if (deckResult.played > 0) {
        deckResult.winRate = (deckResult.wins / deckResult.played) * 100;

        // Calculate player win rates
        for (const player in deckResult.players) {
          const stats = deckResult.players[player];
          if (stats.played > 0) {
            stats.winRate = (stats.wins / stats.played) * 100;
          }
        }

        deckResults.push(deckResult);
      }
    });

    return deckResults;
  }
}
