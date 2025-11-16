# Developer Documentation

This document provides an in-depth look at the Browser Mahjong Game architecture, design decisions, and guidance for extending the system.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Components](#core-components)
- [Game Flow](#game-flow)
- [State Management](#state-management)
- [AI System](#ai-system)
- [Card Configuration System](#card-configuration-system)
- [Extending the System](#extending-the-system)

## Architecture Overview

The Browser Mahjong Game follows a layered architecture with clear separation of concerns:

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

### Design Principles

1. **Client-Side Only**: All logic runs in the browser with no backend dependencies
2. **Type Safety**: TypeScript throughout for compile-time error detection
3. **Immutable State**: State updates create new objects rather than mutating
4. **Component Isolation**: Each component has a single, well-defined responsibility
5. **Testability**: Pure functions and dependency injection for easy testing

## Core Components

### Tile Engine (`src/engine/tiles/`)

The tile engine manages the fundamental game pieces.

#### Tile Class

Represents a single mahjong tile with type, value, and state.

```typescript
class Tile {
  id: string;
  type: TileType;
  value: number | string;
  isExposed: boolean;

  constructor(type: TileType, value: number | string);
  equals(other: Tile): boolean;
  canFormSet(tiles: Tile[], setType: SetType): boolean;
  serialize(): string;
  static deserialize(data: string): Tile;
}
```

**Key Methods:**
- `equals()`: Compares tiles for matching (ignores ID)
- `canFormSet()`: Checks if tiles can form a pung, kong, or chow
- `serialize()/deserialize()`: For storage and transmission

#### Wall Class

Manages the tile wall (144 tiles) with shuffling and drawing.

```typescript
class Wall {
  private tiles: Tile[];
  
  constructor();
  shuffle(): void;
  draw(): Tile | null;
  remainingCount(): number;
  reset(): void;
}
```

**Implementation Details:**
- Initializes with standard 144-tile set (4 of each tile)
- Fisher-Yates shuffle algorithm for randomization
- Tracks remaining tiles for draw detection

#### TileSet Class

Represents exposed sets (pung, kong, chow).

```typescript
class TileSet {
  type: SetType;
  tiles: Tile[];
  
  constructor(type: SetType, tiles: Tile[]);
  validate(): boolean;
  static createPung(tile: Tile, hand: Tile[]): TileSet | null;
  static createKong(tile: Tile, hand: Tile[]): TileSet | null;
}
```

### Game Engine (`src/engine/game/`)

The game engine orchestrates gameplay and enforces rules.

#### GameEngine Class

Central controller for game logic.

```typescript
class GameEngine {
  private state: GameState;
  private cardConfig: CardConfig;
  private aiPlayers: AIPlayer[];
  private ruleEngine: RuleEngine;
  private handValidator: HandValidator;
  
  constructor(cardConfig: CardConfig);
  
  // Game lifecycle
  initializeGame(): void;
  dealTiles(): void;
  endGame(winnerId?: number): void;
  
  // Turn management
  processTurn(playerId: number): void;
  drawTile(playerId: number): Tile;
  discardTile(playerId: number, tile: Tile): void;
  
  // Call system
  evaluateCallOpportunity(discardedTile: Tile): CallOpportunity[];
  processCall(playerId: number, callType: CallType, tile: Tile): void;
  
  // Win detection
  checkWinCondition(playerId: number): boolean;
}
```

**Key Responsibilities:**
- Initialize game with proper tile distribution
- Manage turn order and phase transitions
- Coordinate AI player actions
- Validate moves and enforce rules
- Detect win conditions and game end

#### GameState Interface

Represents the complete game state at any point.

```typescript
interface GameState {
  gameId: string;
  selectedCardYear: number;
  currentPlayer: number;
  players: Player[];
  wall: Tile[];
  discardPile: Tile[];
  turnPhase: TurnPhase;
  gameStatus: GameStatus;
  lastDiscard?: Tile;
  callOpportunities?: CallOpportunity[];
}
```

### Validation System (`src/engine/validation/`)

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

**Pattern Matching Algorithm:**

1. Combine hand tiles with exposed sets
2. For each pattern in card configuration:
   - Check if tile counts match requirements
   - Validate sequences and specific values
   - Handle joker substitutions
   - Return first matching pattern
3. Return null if no patterns match

**Joker Handling:**
- Jokers can substitute for any tile where allowed
- Track joker positions for validation
- Ensure joker usage follows pattern rules

#### RuleEngine Class

Enforces standard mahjong rules.

```typescript
class RuleEngine {
  validateMove(state: GameState, action: GameAction): boolean;
  canCallPung(tile: Tile, hand: Tile[]): boolean;
  canCallKong(tile: Tile, hand: Tile[]): boolean;
  canCallMahjong(tile: Tile, hand: Tile[], exposedSets: TileSet[]): boolean;
  determineTurnOrder(currentPlayer: number, callType?: CallType): number;
}
```

**Rule Implementations:**
- Turn order: Clockwise rotation (0 → 1 → 2 → 3 → 0)
- Call priority: Mahjong > Kong > Pung
- Pung requires 2 matching tiles in hand
- Kong requires 3 matching tiles in hand
- Mahjong requires complete valid hand

## Game Flow

### Turn Sequence

```
┌─────────────────┐
│  Player's Turn  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Draw Tile     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Discard Tile   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Calls     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Call?      No
    │         │
    ▼         ▼
 Process   Next Player
  Call
    │
    └─────────┘
```

### Call Opportunity Flow

When a tile is discarded:

1. **Evaluate Opportunities**: Check all other players for valid calls
2. **Priority Resolution**: Mahjong > Kong > Pung
3. **Display Options**: Show call buttons to human player if applicable
4. **AI Decision**: AI players evaluate and decide within 2 seconds
5. **Process Call**: If called, interrupt turn order and process
6. **Continue**: If not called, proceed to next player

### Win Detection

```typescript
// After any tile is drawn or called
if (checkWinCondition(currentPlayer)) {
  const result = handValidator.validateHand(
    player.hand,
    player.exposedSets
  );
  
  if (result.isValid) {
    endGame(currentPlayer);
    displayWinner(currentPlayer, result.pattern);
  } else {
    showError("Invalid hand declaration");
  }
}
```

## State Management

### React Context + useReducer Pattern

The game uses React's Context API with useReducer for predictable state management.

#### GameContext

```typescript
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);
```

#### Game Actions

```typescript
type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { cardConfig: CardConfig } }
  | { type: 'DRAW_TILE'; payload: { playerId: number; tile: Tile } }
  | { type: 'DISCARD_TILE'; payload: { playerId: number; tile: Tile } }
  | { type: 'CALL_TILE'; payload: { playerId: number; callType: CallType } }
  | { type: 'ADVANCE_TURN' }
  | { type: 'END_GAME'; payload: { winnerId?: number } }
  | { type: 'SELECT_CARD_YEAR'; payload: { year: number } };
```

#### Reducer Function

```typescript
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return initializeGameState(action.payload.cardConfig);
    
    case 'DRAW_TILE':
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === action.payload.playerId
            ? { ...p, hand: [...p.hand, action.payload.tile] }
            : p
        ),
        turnPhase: TurnPhase.DISCARD
      };
    
    // ... other cases
    
    default:
      return state;
  }
}
```

**Benefits:**
- Predictable state updates
- Easy to test reducers
- Time-travel debugging possible
- Clear action history

## AI System

### Architecture

The AI system consists of three main components:

1. **HandEvaluator**: Analyzes hand proximity to winning patterns
2. **Strategy**: Makes tactical decisions based on evaluation
3. **AIPlayer**: Coordinates evaluation and strategy for decisions

### HandEvaluator Class

```typescript
class HandEvaluator {
  evaluateHand(hand: Tile[], patterns: HandPattern[]): HandEvaluation;
  calculateTileUsefulness(tile: Tile, hand: Tile[]): number;
  findBestPattern(hand: Tile[], patterns: HandPattern[]): HandPattern | null;
}
```

**Evaluation Metrics:**
- **Completion**: How close to completing a pattern (0-100%)
- **Flexibility**: Number of tiles that could help
- **Tile Usefulness**: Value of each tile toward winning

### Strategy Class

```typescript
class Strategy {
  selectDiscard(hand: Tile[], evaluation: HandEvaluation): Tile;
  shouldCallPung(tile: Tile, hand: Tile[], evaluation: HandEvaluation): boolean;
  shouldCallKong(tile: Tile, hand: Tile[], evaluation: HandEvaluation): boolean;
}
```

**Decision Logic:**

Discard Selection:
1. Identify tiles not useful for any pattern
2. Prefer tiles with lowest usefulness score
3. Avoid discarding tiles needed for target pattern
4. Consider defensive play (don't feed opponents)

Call Decisions:
- **Pung**: Call if tile completes a set for target pattern
- **Kong**: Call if tile completes kong for target pattern
- **Mahjong**: Always call if hand is valid

### AIPlayer Class

```typescript
class AIPlayer {
  private playerId: number;
  private strategy: Strategy;
  private handEvaluator: HandEvaluator;
  
  selectDiscard(hand: Tile[], patterns: HandPattern[]): Tile {
    const evaluation = this.handEvaluator.evaluateHand(hand, patterns);
    return this.strategy.selectDiscard(hand, evaluation);
  }
  
  evaluateCall(
    tile: Tile,
    hand: Tile[],
    callType: CallType,
    patterns: HandPattern[]
  ): boolean {
    const evaluation = this.handEvaluator.evaluateHand(hand, patterns);
    
    switch (callType) {
      case CallType.PUNG:
        return this.strategy.shouldCallPung(tile, hand, evaluation);
      case CallType.KONG:
        return this.strategy.shouldCallKong(tile, hand, evaluation);
      case CallType.MAHJONG:
        return this.canWin(tile, hand);
    }
  }
}
```

## Card Configuration System

### CardLoader Class

Loads and validates card configurations from JSON files.

```typescript
class CardLoader {
  async loadCardConfig(year: number): Promise<CardConfig> {
    const response = await fetch(`/cards/${year}.json`);
    const data = await response.json();
    return this.validateCardConfig(data);
  }
  
  async getAvailableYears(): Promise<number[]> {
    const manifest = await fetch('/cards/manifest.json');
    return manifest.years;
  }
  
  validateCardConfig(config: unknown): CardConfig {
    // Validate against schema
    // Throw error if invalid
    return config as CardConfig;
  }
}
```

### Card Configuration Format

See `CARD_FORMAT.md` for detailed documentation.

## Extending the System

### Adding New Tile Types

1. Add new type to `TileType` enum:
```typescript
enum TileType {
  // ... existing types
  SEASON = 'season'
}
```

2. Update `Wall` class to include new tiles:
```typescript
private initializeTiles(): void {
  // ... existing tiles
  
  // Add season tiles
  for (let i = 1; i <= 4; i++) {
    this.tiles.push(new Tile(TileType.SEASON, i));
  }
}
```

3. Update `HandValidator` to handle new type in patterns

### Adding New Call Types

1. Add to `CallType` enum:
```typescript
enum CallType {
  PUNG = 'pung',
  KONG = 'kong',
  MAHJONG = 'mahjong',
  CHOW = 'chow'  // New call type
}
```

2. Implement validation in `RuleEngine`:
```typescript
canCallChow(tile: Tile, hand: Tile[]): boolean {
  // Check if hand contains tiles for sequence
  // Return true if valid chow possible
}
```

3. Add UI button in `GameControls` component

4. Update AI strategy to handle new call type

### Adding New AI Difficulty Levels

1. Create difficulty enum:
```typescript
enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}
```

2. Modify `Strategy` class to accept difficulty:
```typescript
class Strategy {
  constructor(private difficulty: Difficulty) {}
  
  selectDiscard(hand: Tile[], evaluation: HandEvaluation): Tile {
    if (this.difficulty === Difficulty.EASY) {
      // Simple random selection
    } else if (this.difficulty === Difficulty.MEDIUM) {
      // Basic strategy
    } else {
      // Advanced strategy
    }
  }
}
```

3. Add difficulty selector to UI

### Adding Animations

Example: Tile discard animation

```typescript
// In DiscardPile component
const [animatingTile, setAnimatingTile] = useState<Tile | null>(null);

useEffect(() => {
  if (lastDiscard) {
    setAnimatingTile(lastDiscard);
    setTimeout(() => setAnimatingTile(null), 500);
  }
}, [lastDiscard]);

return (
  <div className="discard-pile">
    {discardPile.map(tile => (
      <TileComponent
        key={tile.id}
        tile={tile}
        className={tile === animatingTile ? 'animating' : ''}
      />
    ))}
  </div>
);
```

```css
.tile.animating {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Adding Sound Effects

1. Create sound utility:
```typescript
class SoundManager {
  private sounds: Map<string, HTMLAudioElement>;
  
  play(soundName: string): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }
}
```

2. Integrate into game actions:
```typescript
function discardTile(tile: Tile): void {
  soundManager.play('discard');
  dispatch({ type: 'DISCARD_TILE', payload: { tile } });
}
```

## Performance Optimization

### Memoization

Use React.memo for expensive components:

```typescript
export const TileRack = React.memo<TileRackProps>(({ tiles, onTileSelect }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.tiles.length === nextProps.tiles.length;
});
```

### Lazy Loading

Load card configurations on demand:

```typescript
const [cardConfig, setCardConfig] = useState<CardConfig | null>(null);

useEffect(() => {
  cardLoader.loadCardConfig(selectedYear).then(setCardConfig);
}, [selectedYear]);
```

### Virtual Scrolling

For large discard piles, implement virtual scrolling to render only visible tiles.

## Testing

### Unit Test Example

```typescript
describe('HandValidator', () => {
  it('should validate a simple pung hand', () => {
    const validator = new HandValidator(mockCardConfig);
    const hand = [
      new Tile(TileType.BAMBOO, 1),
      new Tile(TileType.BAMBOO, 1),
      new Tile(TileType.BAMBOO, 1),
      // ... complete hand
    ];
    
    const result = validator.validateHand(hand, []);
    expect(result.isValid).toBe(true);
    expect(result.pattern.name).toBe('Simple Pung');
  });
});
```

### Integration Test Example

```typescript
describe('Game Flow', () => {
  it('should complete a full game', () => {
    const engine = new GameEngine(mockCardConfig);
    engine.initializeGame();
    
    // Simulate turns until win
    while (engine.state.gameStatus === GameStatus.IN_PROGRESS) {
      const currentPlayer = engine.state.currentPlayer;
      const tile = engine.drawTile(currentPlayer);
      const discard = selectRandomTile(engine.state.players[currentPlayer].hand);
      engine.discardTile(currentPlayer, discard);
    }
    
    expect(engine.state.gameStatus).toBe(GameStatus.WON);
  });
});
```

## Debugging Tips

1. **State Inspection**: Use React DevTools to inspect game state
2. **Action Logging**: Log all dispatched actions for debugging
3. **AI Decisions**: Add console logs to AI decision-making process
4. **Pattern Matching**: Log pattern matching attempts in HandValidator
5. **Performance**: Use Chrome DevTools Performance tab to identify bottlenecks

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [American Mahjong Rules](https://www.nationalmahjonggleague.org/)
