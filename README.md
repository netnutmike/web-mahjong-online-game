# Browser Mahjong Game

A browser-based American Mahjong practice game where you can play against three AI opponents. Practice your skills with different yearly card configurations without needing other players or server connectivity.

## Features

- **Single-Player Practice**: Play complete games against three AI opponents
- **Multiple Card Years**: Switch between different yearly card configurations (2024, 2025, etc.)
- **Client-Side Only**: No backend required - everything runs in your browser
- **Smart AI Opponents**: AI players make strategic decisions and follow official rules
- **Standard Mahjong Rules**: Full implementation of American Mahjong gameplay
- **Persistent Preferences**: Your card year selection is saved locally
- **Modern UI**: Built with React and TypeScript for a smooth experience

## Technology Stack

- React 19+ with TypeScript
- Vite for fast development and builds
- CSS Modules for styling
- LocalStorage for preferences
- GPL-3.0 License

## Setup and Installation

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd web-mahjong-online-game/browser-mahjong-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory. You can preview the production build with:

```bash
npm run preview
```

## How to Play

### Starting a Game

1. When you first open the game, you'll see the card year selector
2. Choose which year's card you want to play with (e.g., 2024 or 2025)
3. The game will automatically deal tiles and start

### Playing Your Turn

1. **Draw Phase**: A tile is automatically drawn for you at the start of your turn
2. **Discard Phase**: Click on a tile in your rack to discard it
3. The game will then process the three AI opponents' turns

### Calling Tiles

When another player discards a tile you can use:

- **Pung**: If you have two matching tiles, you can call "Pung" to claim the discard
- **Kong**: If you have three matching tiles, you can call "Kong" to claim the discard
- **Mahjong**: If the discard completes your winning hand, call "Mahjong" to win

Call buttons will appear automatically when you have a valid call opportunity.

### Winning the Game

- Complete a valid hand pattern from the selected year's card
- Declare "Mahjong" when you have a winning hand
- The game will validate your hand and display the winning pattern
- Click "New Game" to start another round

### Game Controls

- **New Game**: Start a fresh game with the same card year
- **Card Selector**: Change to a different year's card (starts a new game)

## Adding New Card Configurations

You can add new yearly card configurations by creating JSON files in the `public/cards/` directory.

### Creating a Card Configuration File

1. Create a new file named `YYYY.json` (e.g., `2026.json`) in `public/cards/`
2. Follow the card configuration format (see `docs/CARD_FORMAT.md` for details)
3. The new year will automatically appear in the card selector

### Basic Card Format

```json
{
  "year": 2026,
  "version": "1.0",
  "patterns": [
    {
      "id": "unique_pattern_id",
      "name": "Pattern Name",
      "category": "Category Name",
      "points": 25,
      "tiles": [
        {
          "type": "bamboo",
          "count": 4,
          "sequence": false,
          "values": [1, 2, 3, 4],
          "jokerAllowed": true
        }
      ]
    }
  ]
}
```

### Card Configuration Guidelines

- Each pattern must have a unique ID
- Tile requirements must specify type, count, and whether jokers are allowed
- Patterns can include sequences (consecutive tiles) or sets (matching tiles)
- See `public/cards/card-schema.json` for the complete schema
- Refer to `docs/CARD_FORMAT.md` for detailed documentation and examples

### Validating Your Configuration

The game will automatically validate card configurations when loaded. If there's an error:

- Check the browser console for detailed error messages
- Ensure your JSON is properly formatted
- Verify all required fields are present
- Make sure tile counts and values are valid

## Project Structure

```
browser-mahjong-game/
├── public/
│   └── cards/          # Card configuration JSON files
├── src/
│   ├── components/     # React UI components
│   ├── engine/         # Game logic and AI
│   ├── config/         # Card loading and validation
│   ├── hooks/          # React hooks and state management
│   └── utils/          # Utility functions
├── docs/               # Additional documentation
└── README.md
```

## Documentation

- **CONTRIBUTING.md**: Guidelines for contributing to the project
- **docs/DEVELOPER.md**: Architecture and development guide
- **docs/CARD_FORMAT.md**: Detailed card configuration format documentation

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Code Style

This project uses ESLint with TypeScript rules. Please ensure your code passes linting before submitting changes.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Support

For issues, questions, or suggestions, please open an issue on the project repository.
