import type { Tile, TileSet } from '../tiles/Tile';

/**
 * Current phase of a player's turn
 */
export const TurnPhase = {
  DRAW: 'draw',
  DISCARD: 'discard',
  CALL_OPPORTUNITY: 'call_opportunity',
  GAME_OVER: 'game_over'
} as const;

export type TurnPhase = typeof TurnPhase[keyof typeof TurnPhase];

/**
 * Overall status of the game
 */
export const GameStatus = {
  IN_PROGRESS: 'in_progress',
  WON: 'won',
  DRAW: 'draw'
} as const;

export type GameStatus = typeof GameStatus[keyof typeof GameStatus];

/**
 * Represents a player in the game
 */
export interface Player {
  /** Player identifier (0-3) */
  id: number;
  /** Whether this is the human player */
  isHuman: boolean;
  /** Tiles in the player's hand */
  hand: Tile[];
  /** Exposed sets (pung, kong, chow) */
  exposedSets: TileSet[];
  /** Tiles this player has discarded */
  discardedTiles: Tile[];
}

/**
 * Complete game state
 */
export interface GameState {
  /** Unique identifier for this game session */
  gameId: string;
  /** Selected card year for this game */
  selectedCardYear: number;
  /** Index of the current player (0-3) */
  currentPlayer: number;
  /** All four players */
  players: Player[];
  /** Remaining tiles in the wall */
  wall: Tile[];
  /** All discarded tiles in the center */
  discardPile: Tile[];
  /** Current phase of the turn */
  turnPhase: TurnPhase;
  /** Overall game status */
  gameStatus: GameStatus;
  /** ID of the winning player (if game is won) */
  winnerId?: number;
}
