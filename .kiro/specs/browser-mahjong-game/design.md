# Design Document

## Overview

The Browser Mahjong Game is a client-side web application that enables players to practice American Mahjong against three AI opponents. The system is built entirely in the browser with no backend dependencies, using modern web technologies for a responsive and performant experience.

### Technology Stack

- **Framework**: React 18+ with TypeScript for type safety and modern component architecture
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: React Context API with useReducer for game state
- **Styling**: CSS Modules or Tailwind CSS for component styling
- **Storage**: Browser LocalStorage for user preferences and game state persistence
- **Card Configurations**: JSON files stored in `/public/cards/` directory
- **Testing**: Vitest for unit tests
- **License**: GPL-3.0
- **Dependency Management**: Renovate for automated dependency updates

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Application                  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   UI Layer   │  │  Game Logic  │  │  AI Engine   │ │
│  │  (React)     │◄─┤   (Core)     │◄─┤  (Strategy)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         └──────────────────┼──────────────────┘         │
│                            │                            │
│                   ┌────────▼────────┐                   │
│                   │  State Manager  │                   │
│                   └────────┬────────┘                   │
│                            │                            │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼─────┐  │
│  │   Local     │  │  Card Config    │  │  Tile     │  │
│  │  Storage    │  │  Loader (JSON)  │  │  Engine   │  │
│  └─────────────┘  └─────────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
browser-mahjong-game/
├── public/
│   ├── cards/
│   │   ├── 2024.json
│   │   ├── 2025.json
│   │   └── card-schema.json
│   └── assets/
│       └── tiles/
├── src/
│   ├── components/
│   │   ├── GameBoard/
│   │   ├── TileRack/
│   │   ├── DiscardPile/
│   │   ├── PlayerIndicator/
│   │   ├── CardSelector/
│   │   └── GameControls/
│   ├── engine/
│   │   ├── game/
│   │   │   ├── GameState.ts
│   │   │   ├── GameEngine.ts
│   │   │   └── TurnManager.ts
│   │   ├── tiles/
│   │   │   ├── Tile.ts
│   │   │   ├── TileSet.ts
│   │   │   └── Wall.ts
│   │   ├── ai/
│   │   │   ├── AIPlayer.ts
│   │   │   ├── Strategy.ts
│   │   │   └── HandEvaluator.ts
│   │   └── validation/
│   │       ├── HandValidator.ts
│   │       └── RuleEngine.ts
│   ├── config/
│   │   ├── CardLoader.ts
│   │   └── CardTypes.ts
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   └── useCardConfig.ts
│   ├── utils/
│   │   └── storage.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   ├── DEVELOPER.md
│   └── CARD_FORMAT.md
├── .gitignore
├── LICENSE
├── README.md
├── CONTRIBUTING.md
├── package.json
├── renovate.json
├── tsconfig.json
└── vite.config.ts
```

## Components and Interfaces

### Core Data Models

#### Tile

```typescript
enum TileType {
  BAMBOO = 'bamboo',
  CHARACTER = 'character',
  DOT = 'dot',
  WIND = 'wind',
  DRAGON = 'dragon',
  FLOWER = 'flower',
  JOKER = 'joker'
}

interface Tile {
  id: string;
  type: TileType;
  value: number | string;
  isExposed: boolean;
}
```

#### Hand Pattern (from Card Configuration)

```typescript
interface HandPattern {
  id: string;
  name: string;
  category: string;
  points: number;
  tiles: TileRequirement[];
}

interface TileRequirement {
  type: TileType;
  count: number;
  sequence?: boolean;
  specific?: (number | string)[];
  jokerAllowed: boolean;
}
```

#### Card Configuration

```typescript
interface CardConfig {
  year: number;
  version: string;
  patterns: HandPattern[];
}
```

#### Game State

```typescript
interface GameState {
  gameId: string;
  selectedCardYear: number;
  currentPlayer: number; // 0-3
  players: Player[];
  wall: Tile[];
  discardPile: Tile[];
  turnPhase: TurnPhase;
  gameStatus: GameStatus;
}

enum TurnPhase {
  DRAW = 'draw',
  DISCARD = 'discard',
  CALL_OPPORTUNITY = 'call_opportunity',
  GAME_OVER = 'game_over'
}

enum GameStatus {
  IN_PROGRESS = 'in_progress',
  WON = 'won',
  DRAW = 'draw'
}

interface Player {
  id: number;
  isHuman: boolean;
  hand: Tile[];
  exposedSets: TileSet[];
  discardedTiles: Tile[];
}

interface TileSet {
  type: SetType;
  tiles: Tile[];
}

enum SetType {
  PUNG = 'pung',
  KONG = 'kong',
  CHOW = 'chow'
}
```

### UI Components

#### GameBoard Component

Main container component that orchestrates the entire game interface.

**Props:**
```typescript
interface GameBoardProps {
  gameState: GameState;
  onTileDiscard: (tile: Tile) => void;
  onTileCall: (callType: CallType) => void;
  onNewGame: () => void;
}
```

#### TileRack Component

Displays the player's tiles in an organized rack.

**Props:**
```typescript
interface TileRackProps {
  tiles: Tile[];
  exposedSets: TileSet[];
  onTileSelect: (tile: Tile) => void;
  selectedTile?: Tile;
  isPlayerTurn: boolean;
}
```

#### CardSelector Component

Allows player to select which year's card to use.

**Props:**
```typescript
interface CardSelectorProps {
  availableYears: number[];
  selectedYear: number;
  onYearSelect: (year: number) => void;
}
```

### Game Engine

#### GameEngine Class

Central game logic controller.

```typescript
class GameEngine {
  private state: GameState;
  private cardConfig: CardConfig;
  private aiPlayers: AIPlayer[];
  
  constructor(cardConfig: CardConfig);
  
  initializeGame(): void;
  dealTiles(): void;
  processTurn(playerId: number): void;
  drawTile(playerId: number): Tile;
  discardTile(playerId: number, tile: Tile): void;
  evaluateCallOpportunity(discardedTile: Tile): CallOpportunity[];
  processCall(playerId: number, callType: CallType, tile: Tile): void;
  checkWinCondition(playerId: number): boolean;
  endGame(winnerId?: number): void;
}
```

#### AIPlayer Class

Handles AI decision-making.

```typescript
class AIPlayer {
  private playerId: number;
  private strategy: Strategy;
  private handEvaluator: HandEvaluator;
  
  constructor(playerId: number, difficulty: Difficulty);
  
  selectDiscard(hand: Tile[], availablePatterns: HandPattern[]): Tile;
  evaluateCall(tile: Tile, hand: Tile[]): CallDecision;
  selectTargetPattern(hand: Tile[], patterns: HandPattern[]): HandPattern;
}
```

#### HandValidator Class

Validates winning hands against card patterns.

```typescript
class HandValidator {
  private cardConfig: CardConfig;
  
  constructor(cardConfig: CardConfig);
  
  validateHand(hand: Tile[], exposedSets: TileSet[]): ValidationResult;
  matchPattern(tiles: Tile[], pattern: HandPattern): boolean;
  calculateScore(pattern: HandPattern): number;
}
```

### Card Configuration Loader

#### CardLoader Class

Loads and parses card configuration files.

```typescript
class CardLoader {
  async loadCardConfig(year: number): Promise<CardConfig>;
  async getAvailableYears(): Promise<number[]>;
  validateCardConfig(config: unknown): CardConfig;
}
```

### State Management

Using React Context with useReducer pattern:

```typescript
interface GameAction {
  type: GameActionType;
  payload?: any;
}

enum GameActionType {
  INITIALIZE_GAME = 'INITIALIZE_GAME',
  DRAW_TILE = 'DRAW_TILE',
  DISCARD_TILE = 'DISCARD_TILE',
  CALL_TILE = 'CALL_TILE',
  ADVANCE_TURN = 'ADVANCE_TURN',
  END_GAME = 'END_GAME',
  SELECT_CARD_YEAR = 'SELECT_CARD_YEAR'
}

function gameReducer(state: GameState, action: GameAction): GameState;
```

## Data Models

### Card Configuration JSON Format

```json
{
  "year": 2025,
  "version": "1.0",
  "patterns": [
    {
      "id": "2468",
      "name": "2468",
      "category": "2025",
      "points": 25,
      "tiles": [
        {
          "type": "any",
          "values": [2, 4, 6, 8],
          "count": 4,
          "sequence": false,
          "jokerAllowed": true
        }
      ]
    },
    {
      "id": "consecutive_run",
      "name": "Consecutive Run",
      "category": "Consecutive",
      "points": 25,
      "tiles": [
        {
          "type": "same_suit",
          "count": 9,
          "sequence": true,
          "values": [1, 2, 3, 4, 5, 6, 7, 8, 9],
          "jokerAllowed": true
        }
      ]
    }
  ]
}
```

### LocalStorage Schema

```typescript
interface StoredPreferences {
  lastSelectedYear: number;
  soundEnabled: boolean;
  animationSpeed: number;
}

interface StoredGameState {
  gameId: string;
  timestamp: number;
  state: GameState;
}
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  INVALID_MOVE = 'invalid_move',
  CARD_LOAD_FAILED = 'card_load_failed',
  INVALID_CARD_CONFIG = 'invalid_card_config',
  GAME_STATE_ERROR = 'game_state_error'
}

class GameError extends Error {
  type: ErrorType;
  details?: any;
  
  constructor(type: ErrorType, message: string, details?: any);
}
```

### Error Handling Strategy

1. **Card Loading Errors**: Display user-friendly message and fall back to default year
2. **Invalid Move Errors**: Show inline validation message, prevent action
3. **Game State Errors**: Log to console, attempt state recovery, offer new game option
4. **Configuration Errors**: Display detailed error for administrators with file/line information

### User-Facing Error Messages

- Card load failure: "Unable to load card configuration for [year]. Please check the card file."
- Invalid hand: "This hand does not match any valid patterns for [year]."
- Invalid move: "This move is not allowed at this time."

## Testing Strategy

### Unit Tests

**Tile Engine Tests**
- Tile creation and manipulation
- Wall initialization and tile drawing
- Tile set validation

**Hand Validator Tests**
- Pattern matching for various hand types
- Joker substitution logic
- Edge cases (all jokers, no jokers, partial matches)

**AI Player Tests**
- Discard selection logic
- Call decision making
- Target pattern selection

**Card Loader Tests**
- JSON parsing and validation
- Error handling for malformed files
- Multiple year loading

### Integration Tests

**Game Flow Tests**
- Complete game from start to win
- Turn progression with AI players
- Call interruptions (pung, kong, mahjong)

**State Management Tests**
- State transitions through game actions
- State persistence and recovery
- Concurrent action handling

### Manual Testing Checklist

- [ ] Load game with different card years
- [ ] Play complete game to win
- [ ] Play complete game to draw
- [ ] Test all call types (pung, kong, mahjong)
- [ ] Verify AI makes reasonable decisions
- [ ] Test invalid hand declaration
- [ ] Test new game functionality
- [ ] Verify responsive layout on different screen sizes
- [ ] Test with malformed card configuration file

## Performance Considerations

### Optimization Strategies

1. **Tile Rendering**: Use React.memo for tile components to prevent unnecessary re-renders
2. **AI Computation**: Implement debouncing for AI decision-making to maintain 60fps
3. **State Updates**: Batch state updates where possible using React 18's automatic batching
4. **Asset Loading**: Lazy load tile images and card configurations
5. **Hand Evaluation**: Cache pattern matching results during a turn

### Performance Targets

- Initial load: < 3 seconds
- AI turn processing: < 2 seconds
- UI response to user action: < 100ms
- Frame rate during animations: 60fps
- Memory usage: < 100MB

## Accessibility Considerations

- Keyboard navigation for all game actions
- ARIA labels for tile images and game state
- High contrast mode support
- Screen reader announcements for turn changes and game events
- Focus management for modal dialogs

## Future Enhancements (Out of Scope)

- Multiplayer support
- Game statistics and history
- Hint system for beginners
- Undo/redo functionality
- Custom tile themes
- Sound effects and music
- Mobile responsive design
- Tutorial mode
