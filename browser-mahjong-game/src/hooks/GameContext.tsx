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
    // Create a new object reference to ensure React detects the change
    return { ...action.payload.state };
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

  // Use refs to store functions so they can call each other
  const processCallOpportunitiesRef = React.useRef<(() => Promise<void>) | null>(null);
  const continueGameFlowRef = React.useRef<(() => Promise<void>) | null>(null);

  // Helper function to continue game flow (process AI turns until human or call opportunity)
  React.useEffect(() => {
    continueGameFlowRef.current = async () => {
      const state = engine.getState();
      
      // If in draw phase and current player is AI, process their turn
      if (state.turnPhase === 'draw') {
        const currentPlayer = engine.getPlayer(state.currentPlayer);
        if (currentPlayer && !currentPlayer.isHuman) {
          await engine.processTurn();
          dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
          
          // Recursively continue game flow
          setTimeout(() => continueGameFlowRef.current?.(), 300);
          return;
        }
      }
      
      // If in call_opportunity phase, process call opportunities
      if (state.turnPhase === 'call_opportunity') {
        setTimeout(() => processCallOpportunitiesRef.current?.(), 300);
      }
    };
  }, [engine]);

  // Helper function to process call opportunities after a discard
  React.useEffect(() => {
    processCallOpportunitiesRef.current = async () => {
      console.log('processCallOpportunities called. Phase:', engine.getState().turnPhase, 'hasCallOpportunities:', engine.hasCallOpportunities());
      
      if (!engine.hasCallOpportunities()) {
        console.log('No call opportunities, returning');
        return;
      }

      const lastDiscard = engine.getState().discardPile[engine.getState().discardPile.length - 1];
      const opportunities = engine.evaluateCallOpportunity(lastDiscard);
      console.log('Call opportunities found:', opportunities.length);

      try {
        console.log('Calling processAICallDecisions...');
        const aiCall = await engine.processAICallDecisions(opportunities);
        console.log('processAICallDecisions returned:', aiCall);

        if (aiCall) {
          // AI wants to call
          console.log('AI is making a call:', aiCall.callType, 'Player:', aiCall.playerId);
          engine.processCall(aiCall.playerId, aiCall.callType, aiCall.tile);
          const newState = engine.getState();
          console.log('After processCall - Game status:', newState.gameStatus, 'Winner:', newState.winnerId);
          dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: newState } });

          // If not mahjong, AI needs to discard
          if (aiCall.callType !== CallType.MAHJONG) {
            setTimeout(async () => {
              try {
                // AI is now in discard phase, need to make discard decision
                const aiPlayer = engine.getAIPlayers().find(ai => ai.getPlayerId() === aiCall.playerId);
                const player = engine.getPlayer(aiCall.playerId);
                
                if (aiPlayer && player) {
                  // AI decides which tile to discard
                  const tileToDiscard = await aiPlayer.makeTurnDecision(player.hand, player.exposedSets);
                  engine.discardTile(aiCall.playerId, tileToDiscard);
                  dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
                  
                  // Continue game flow after discard
                  setTimeout(() => continueGameFlowRef.current?.(), 300);
                }
              } catch (err) {
                console.error('Error processing AI discard after call:', err);
              }
            }, 500);
          }
        } else {
          // No AI calls, check if human has opportunities
          const humanOpportunities = engine.getHumanCallOpportunities();
          console.log('No AI calls. Human opportunities:', humanOpportunities.length);
          console.log('Human opportunities details:', humanOpportunities);
          if (humanOpportunities.length === 0) {
            // No one wants to call, advance turn
            console.log('Declining call opportunities and advancing turn');
            engine.declineCallOpportunities();
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });

            // Process next turn
            setTimeout(async () => {
              try {
                console.log('Processing next turn after decline');
                await engine.processTurn();
                const newState = engine.getState();
                console.log('Dispatching state update. New current player:', newState.currentPlayer, 'Phase:', newState.turnPhase);
                dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: newState } });
                
                // Continue game flow
                setTimeout(() => continueGameFlowRef.current?.(), 300);
              } catch (err) {
                console.error('Error processing next turn:', err);
              }
            }, 500);
          } else {
            // Human has opportunities - just update state and wait for UI interaction
            const currentState = engine.getState();
            console.log('Human has call opportunities, waiting for user input');
            console.log('Current state - Phase:', currentState.turnPhase, 'Current Player:', currentState.currentPlayer);
            console.log('Discard pile length:', currentState.discardPile.length);
            console.log('Last discard:', currentState.discardPile[currentState.discardPile.length - 1]);
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: currentState } });
            console.log('State dispatched, GameBoard should re-render now');
          }
        }
      } catch (err) {
        console.error('Error processing call opportunities:', err);
        // Fallback: decline and advance
        try {
          engine.declineCallOpportunities();
          dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
          setTimeout(async () => {
            await engine.processTurn();
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
            setTimeout(() => processCallOpportunitiesRef.current?.(), 300);
          }, 500);
        } catch (fallbackErr) {
          console.error('Error in fallback:', fallbackErr);
        }
      }
    };
  }, [engine]);

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
            console.log('DISCARD_TILE: Before discard, phase:', engine.getState().turnPhase);
            engine.discardTile(action.payload.playerId, action.payload.tile);
            console.log('DISCARD_TILE: After discard, phase:', engine.getState().turnPhase);
            dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });

            // Check for call opportunities and process them
            console.log('DISCARD_TILE: hasCallOpportunities?', engine.hasCallOpportunities());
            if (engine.hasCallOpportunities()) {
              // Give UI time to update before processing
              setTimeout(() => {
                console.log('setTimeout fired - processing call opportunities');
                processCallOpportunitiesRef.current?.();
              }, 300);
            } else {
              // No call opportunities, process next turn
              setTimeout(async () => {
                try {
                  await engine.processTurn();
                  dispatch({ type: GameActionType.UPDATE_STATE, payload: { state: engine.getState() } });
                  
                  // Continue game flow
                  setTimeout(() => continueGameFlowRef.current?.(), 300);
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
              
              // Check if the next turn created call opportunities
              setTimeout(() => processCallOpportunitiesRef.current?.(), 300);
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
