import { useContext } from 'react';
import type { GameState } from '../engine/game/GameState';
import { GameEngine } from '../engine/game/GameEngine';
import type { GameAction } from './gameActions';
import { GameContext } from './GameContext';

/**
 * Hook to access game context
 * @returns Game context value
 * @throws Error if used outside GameProvider
 */
export function useGame() {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}

/**
 * Hook to access game state
 * @returns Current game state
 */
export function useGameState(): GameState {
  const { state } = useGame();
  return state;
}

/**
 * Hook to access game dispatch
 * @returns Game action dispatcher
 */
export function useGameDispatch(): React.Dispatch<GameAction> {
  const { dispatch } = useGame();
  return dispatch;
}

/**
 * Hook to access game engine
 * @returns Game engine instance
 */
export function useGameEngine(): GameEngine | null {
  const { engine } = useGame();
  return engine;
}
