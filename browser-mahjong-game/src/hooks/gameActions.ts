import type { CardConfig } from '../config/CardTypes';
import type { Tile } from '../engine/tiles/Tile';
import type { GameState } from '../engine/game/GameState';
import { CallType } from '../engine/validation/RuleEngine';

/**
 * Game action types
 */
export const GameActionType = {
  INITIALIZE_GAME: 'INITIALIZE_GAME',
  DRAW_TILE: 'DRAW_TILE',
  DISCARD_TILE: 'DISCARD_TILE',
  CALL_TILE: 'CALL_TILE',
  DECLINE_CALL: 'DECLINE_CALL',
  DECLARE_MAHJONG: 'DECLARE_MAHJONG',
  ADVANCE_TURN: 'ADVANCE_TURN',
  END_GAME: 'END_GAME',
  SELECT_CARD_YEAR: 'SELECT_CARD_YEAR',
  UPDATE_STATE: 'UPDATE_STATE'
} as const;

/**
 * Game action definitions
 */
export type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { cardConfig: CardConfig } }
  | { type: 'DRAW_TILE'; payload: { playerId: number } }
  | { type: 'DISCARD_TILE'; payload: { playerId: number; tile: Tile } }
  | { type: 'CALL_TILE'; payload: { playerId: number; callType: CallType; tile: Tile } }
  | { type: 'DECLINE_CALL' }
  | { type: 'DECLARE_MAHJONG'; payload: { playerId: number; tile?: Tile } }
  | { type: 'ADVANCE_TURN' }
  | { type: 'END_GAME'; payload?: { winnerId?: number } }
  | { type: 'SELECT_CARD_YEAR'; payload: { year: number; cardConfig: CardConfig } }
  | { type: 'UPDATE_STATE'; payload: { state: GameState } };
