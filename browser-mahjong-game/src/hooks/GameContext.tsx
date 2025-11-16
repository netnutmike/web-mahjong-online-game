import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { GameEngine } from '../engine/game/GameEngine';
import type { GameState } from '../engine/game/GameState';
import type { CardConfig } from '../config/CardTypes';
import { CallType } from '../engine/validation/RuleEngine';
import { GameActionType, type GameAction } from './gameActions';

/**
 * Game context value
 */
export interface GameContextValue {
  state: GameState;
  engine: GameEngine | null;
  dispatch: React.Dispatch<GameAction>;
}

/**
 * Game context
 */
export const GameContext = createContext<GameContextValue | undefined>(undefined);

/**
 * Game reducer function
 * Processes game actions and updates state
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  // Handle UPDATE_STATE action
  if (action.type === GameActionType.UPDATE_STATE) {
    return action.payload.state;
  }
  
  // For other actions, state is managed by the engine
  return state;
}

/**
 * Game context provider props
 */
interface GameProviderProps {
  children: ReactNode;
  initialCardConfig: CardConfig;
}

/**
 * Game context provider component
 * Manages game state and provides access to game engine
 */
export function GameProvider({ children, initialCardConfig }: GameProviderProps) {
  // Initialize game engine
  const [engine] = React.useState(() => {
    const gameEngine = new GameEngine(initialCardConfig);
    gameEngine.initializeGame(); // Initialize the game immediately
    return gameEngine;
  });
  
  // Initialize state from engine
  const [state, dispatch] = useReducer(gameReducer, engine.getState());

  // Custom dispatch that handles game engine operations
  const enhancedDispatch = React.useCallback(
    async (action: GameAction) => {
      try {
        switch (action.type) {
          case GameActionType.INITIALIZE_GAME: {
            engine.updateCardConfig(action.payload.cardConfig);
            engine.initializeGame();
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            
            // Process AI turns if game starts with AI player
            setTimeout(async () => {
              await engine.processTurn();
              dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            }, 100);
            break;
          }

          case GameActionType.DRAW_TILE: {
            const tile = engine.drawTile(action.payload.playerId);
            if (tile) {
              dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
              
              // Check if human player won after drawing
              const player = engine.getPlayer(action.payload.playerId);
              if (player?.isHuman && engine.checkWinCondition(action.payload.playerId)) {
                // Human can declare mahjong - UI will show the option
              }
            } else {
              // Wall exhausted
              dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            }
            break;
          }

          case GameActionType.DISCARD_TILE: {
            engine.discardTile(action.payload.playerId, action.payload.tile);
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });

            // Check for call opportunities
            if (engine.hasCallOpportunities()) {
              // Process AI call decisions
              const lastDiscard = engine.getState().discardPile[engine.getState().discardPile.length - 1];
              const opportunities = engine.evaluateCallOpportunity(lastDiscard);
              
              // Give UI time to update before processing AI decisions
              setTimeout(async () => {
                try {
                  const aiCall = await engine.processAICallDecisions(opportunities);

                  if (aiCall) {
                    // AI wants to call
                    engine.processCall(aiCall.playerId, aiCall.callType, aiCall.tile);
                    dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });

                    // If not mahjong, AI needs to discard
                    if (aiCall.callType !== CallType.MAHJONG) {
                      setTimeout(async () => {
                        try {
                          await engine.processTurn();
                          dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
                        } catch (err) {
                          console.error('Error processing AI turn after call:', err);
                        }
                      }, 500);
                    }
                  } else {
                    // No AI calls, check if human has opportunities
                    const humanOpportunities = engine.getHumanCallOpportunities();
                    if (humanOpportunities.length === 0) {
                      // No one wants to call, advance turn
                      engine.declineCallOpportunities();
                      dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });

                      // Process next turn if it's an AI
                      setTimeout(async () => {
                        try {
                          await engine.processTurn();
                          dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
                        } catch (err) {
                          console.error('Error processing next turn:', err);
                        }
                      }, 500);
                    }
                    // If human has opportunities, UI will show them
                  }
                } catch (err) {
                  console.error('Error processing AI call decisions:', err);
                  // Fallback: decline and advance
                  try {
                    engine.declineCallOpportunities();
                    dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
                    setTimeout(async () => {
                      await engine.processTurn();
                      dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
                    }, 500);
                  } catch (fallbackErr) {
                    console.error('Error in fallback:', fallbackErr);
                  }
                }
              }, 300);
            } else {
              // No call opportunities, process next turn
              setTimeout(async () => {
                try {
                  await engine.processTurn();
                  dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
                } catch (err) {
                  console.error('Error processing next turn:', err);
                }
              }, 500);
            }
            break;
          }

          case GameActionType.CALL_TILE: {
            engine.processCall(action.payload.playerId, action.payload.callType, action.payload.tile);
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            
            // After human calls (non-mahjong), they need to discard
            // The turn phase will be set to DISCARD by the engine
            break;
          }

          case GameActionType.DECLINE_CALL: {
            engine.declineCallOpportunities();
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });

            // Process next turn if it's an AI
            setTimeout(async () => {
              await engine.processTurn();
              dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            }, 500);
            break;
          }

          case GameActionType.DECLARE_MAHJONG: {
            engine.declareMahjong(action.payload.playerId, action.payload.tile);
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            break;
          }

          case GameActionType.ADVANCE_TURN: {
            engine.advanceTurn();
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });

            // Process next turn if it's an AI
            setTimeout(async () => {
              await engine.processTurn();
              dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            }, 500);
            break;
          }

          case GameActionType.END_GAME: {
            engine.endGame(action.payload?.winnerId);
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            break;
          }

          case GameActionType.SELECT_CARD_YEAR: {
            engine.updateCardConfig(action.payload.cardConfig);
            engine.initializeGame();
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            
            // Process AI turns if game starts with AI player
            setTimeout(async () => {
              await engine.processTurn();
              dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            }, 100);
            break;
          }

          case GameActionType.UPDATE_STATE: {
            dispatch(action);
            break;
          }

          default:
            console.warn('Unknown action type:', action);
        }
      } catch (error) {
        console.error('Error processing game action:', error);
        // Re-throw to allow error boundaries to catch
        throw error;
      }
    },
    [engine]
  );

  // Sync state with engine state
  useEffect(() => {
    const engineState = engine.getState();
    if (JSON.stringify(engineState) !== JSON.stringify(state)) {
      dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engineState } });
    }
  }, [engine, state]);

  const value: GameContextValue = {
    state,
    engine,
    dispatch: enhancedDispatch
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
