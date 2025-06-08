# Plants vs Zombies Heroes: Winrate Battle Reports

A web-based tool for analyzing player and hero win rates in Plants vs Zombies Heroes tournaments and matchups.

## Overview

This web application processes game reports from tournament files and provides detailed win rate analysis across multiple dimensions:

- Hero vs. Hero matchup statistics with interactive visualizations
- Player rankings and performance metrics
- Hero performance for individual players
- Deck analysis and tracking (experimental feature)

## Data Structure

The application reads data from text files with the following structure:

- `/datafiles/{patch_name}/{tournament_name}.txt` - Game reports for specific tournaments and patches
- `/playernames.txt` - List of player names

Each line in a tournament file represents a single game with the format:
```
2024-12-21 20:22:27|mono|tqm|eb|gk|midrange|control
```

Where the fields represent:
- Date and time of the game
- Winning player's name
- Losing player's name
- Winning hero code
- Losing hero code
- Winning deck name
- Losing deck name

## Features

### Data Filtering Options

- **Patch Selection**: Choose which patch versions to include in the analysis
- **Custom Date Range**: Analyze games within a specific date window
- **Tournament Selection**: Filter data by specific tournaments
- **Player Selection**: Focus analysis on specific players

### Display Options

1. **Players Default**: Show winrates for selected players in the default hero vs. hero grid
2. **Player Stats**: View detailed statistics for a single player, including:
   - Most played heroes
   - Best and worst performing heroes
   - Overall win rate and record
3. **Custom Battles**: Analyze only games played between the selected players

### Hero Winrate Visualization

The main visualization is a hero-vs-hero grid that shows:
- The winrate from the plant hero's perspective in the top-left of each cell
- The winrate from the zombie hero's perspective in the bottom-right of each cell
- Color-coded cells based on winrate percentages:
  - ≤35%: Dark Red
  - 35-45%: Orange
  - 45-55%: Yellow
  - 55-65%: Light Green
  - ≥65%: Dark Green

### Experimental Features

The "Experimental" section provides deck analysis capabilities:
- Create a custom deck library
- Add aliases for different deck naming variations
- Track deck performance statistics across players
- Save and load your deck library for future use

## Usage Instructions

1. **Basic Analysis**:
   - Select patches, tournaments, and players (or leave unselected to include all)
   - Choose the display type (Players Default, Player Stats, or Custom Battles)
   - Click "Generate Report"

2. **Advanced Filtering**:
   - Enable "Use Custom Date Range" to filter by specific dates
   - Use the search box to quickly find specific players

3. **Understanding Results**:
   - Navigate between tabs to view different aspects of the data
   - Hover over cells to see detailed information
   - Use the "Export CSV" button to download the data for further analysis

4. **Deck Analysis** (Experimental):
   - Click "Experimental Features" to open the deck analysis modal
   - Add decks and their aliases to your library
   - Select filters and generate a report to see deck performance statistics

## Browser Compatibility

This application works best in modern browsers that support ES6+ JavaScript features:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

The application is built using vanilla JavaScript, HTML, and CSS without external dependencies. The code is organized as follows:

- `index.html` - Main application structure
- `css/styles.css` - Styling and themes
- `js/utils.js` - Utility functions
- `js/data-processing.js` - Core data processing logic
- `js/ui-handlers.js` - User interface event handlers
- `js/main.js` - Main application logic