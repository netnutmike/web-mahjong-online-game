/**
 * Central export file for all type definitions
 */

// Tile types
export { TileType, SetType } from '../engine/tiles/Tile';
export type { Tile, TileSet, SerializedTile } from '../engine/tiles/Tile';
export { TileClass } from '../engine/tiles/Tile';
export { Wall } from '../engine/tiles/Wall';
export { TileSetClass } from '../engine/tiles/TileSet';

// Card configuration types
export type { TileRequirement, HandPattern, CardConfig } from '../config/CardTypes';

// Game state types
export { TurnPhase, GameStatus } from '../engine/game/GameState';
export type { Player, GameState } from '../engine/game/GameState';

// Error types
export { ErrorType, GameError } from '../engine/game/GameError';

// Validation types
export { HandValidator } from '../engine/validation/HandValidator';
export type { ValidationResult } from '../engine/validation/HandValidator';
export { RuleEngine, CallType } from '../engine/validation/RuleEngine';
export type { CallValidationResult, CallOpportunity } from '../engine/validation/RuleEngine';

// AI types
export { AIPlayer } from '../engine/ai/AIPlayer';
export { HandEvaluator } from '../engine/ai/HandEvaluator';
export type { HandEvaluation, TileUsefulness } from '../engine/ai/HandEvaluator';
export { Strategy, Difficulty } from '../engine/ai/Strategy';
export type { CallDecision } from '../engine/ai/Strategy';

// Game engine types
export { GameEngine } from '../engine/game/GameEngine';

// React context and hooks
export { GameProvider } from '../hooks/GameContext';
export type { GameContextValue } from '../hooks/GameContext';
export { GameActionType } from '../hooks/gameActions';
export type { GameAction } from '../hooks/gameActions';
export { useGame, useGameState, useGameDispatch, useGameEngine } from '../hooks/useGameHooks';
