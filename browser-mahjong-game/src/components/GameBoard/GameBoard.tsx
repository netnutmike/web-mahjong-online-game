import React, { useState, useEffect } from 'react';
import { useGameState, useGameDispatch, useGameEngine } from '../../hooks/useGameHooks';
import { GameActionType } from '../../hooks/gameActions';
import { TileRack } from '../TileRack';
import { DiscardPile } from '../DiscardPile';
import { PlayerIndicator } from '../PlayerIndicator';
import { CardSelector } from '../CardSelector';
import { DifficultySelector } from '../DifficultySelector';
import { GameControls } from '../GameControls';
import { WinnerDisplay } from '../WinnerDisplay';
import { DrawDisplay } from '../DrawDisplay';
import { ErrorMessage } from '../ErrorMessage';
import { cardLoader } from '../../config/CardLoader';
import { saveSelectedYear } from '../../utils/storage';
import { GameStatus, TurnPhase, CallType } from '../../types';
import { Difficulty } from '../../engine/ai/Strategy';
import type { Tile } from '../../types';
import './GameBoard.css';

/**
 * GameBoard component is the main game interface
 * Composes all child components and handles user interactions
 */
export const GameBoard: React.FC = () => {
  const state = useGameState();
  const dispatch = useGameDispatch();
  const engine = useGameEngine();

  const [selectedTile, setSelectedTile] = useState<Tile | undefined>(undefined);
  const [error, setError] = useState<Error | string | null>(null);

  // Find the human player (player 0)
  const humanPlayer = state.players?.[0];
  const isHumanTurn = state.currentPlayer === 0;

  // Get call opportunities for human player
  // Recalculate whenever state changes
  const humanCallOpportunities = React.useMemo(() => {
    const opportunities = engine?.getHumanCallOpportunities() || [];
    console.log('GameBoard: humanCallOpportunities recalculated:', opportunities.length, 'Phase:', state.turnPhase, 'Discard pile:', state.discardPile.length);
    if (opportunities.length > 0) {
      console.log('GameBoard: FOUND OPPORTUNITIES!', opportunities);
    }
    return opportunities;
  }, [engine, state.turnPhase, state.discardPile.length]);

  // Handle tile selection from rack
  const handleTileSelect = (tile: Tile) => {
    if (!isHumanTurn || state.turnPhase !== TurnPhase.DISCARD) {
      return;
    }
    setSelectedTile(tile);
  };

  // Handle tile discard
  const handleTileDiscard = async () => {
    if (!selectedTile || !isHumanTurn) {
      return;
    }

    try {
      setError(null);
      await dispatch({
        type: GameActionType.DISCARD_TILE,
        payload: { playerId: 0, tile: selectedTile }
      });
      setSelectedTile(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : 'Failed to discard tile');
      console.error('Error discarding tile:', err);
    }
  };

  // Handle call action
  const handleCall = async (callType: CallType) => {
    try {
      setError(null);
      const lastDiscard = state.discardPile[state.discardPile.length - 1];
      
      if (callType === CallType.MAHJONG) {
        await dispatch({
          type: GameActionType.DECLARE_MAHJONG,
          payload: { playerId: 0, tile: lastDiscard }
        });
      } else {
        await dispatch({
          type: GameActionType.CALL_TILE,
          payload: { playerId: 0, callType, tile: lastDiscard }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : 'Failed to process call');
      console.error('Error processing call:', err);
    }
  };

  // Handle decline call
  const handleDeclineCall = async () => {
    try {
      setError(null);
      await dispatch({
        type: GameActionType.DECLINE_CALL
      });
    } catch (err) {
      setError(err instanceof Error ? err : 'Failed to decline call');
      console.error('Error declining call:', err);
    }
  };

  // Handle new game
  const handleNewGame = async () => {
    try {
      setError(null);
      setSelectedTile(undefined);
      const cardConfig = await cardLoader.loadCardConfig(state.selectedCardYear);
      await dispatch({
        type: GameActionType.INITIALIZE_GAME,
        payload: { cardConfig }
      });
    } catch (err) {
      setError(err instanceof Error ? err : 'Failed to start new game');
      console.error('Error starting new game:', err);
    }
  };

  // Handle year selection
  const handleYearSelect = async (year: number) => {
    try {
      setError(null);
      setSelectedTile(undefined);
      const cardConfig = await cardLoader.loadCardConfig(year);
      
      // Save the selected year to localStorage
      saveSelectedYear(year);
      
      await dispatch({
        type: GameActionType.SELECT_CARD_YEAR,
        payload: { year, cardConfig }
      });
    } catch (err) {
      setError(err instanceof Error ? err : 'Failed to load card configuration');
      console.error('Error loading card config:', err);
    }
  };

  // Handle difficulty selection
  const handleDifficultySelect = (difficulty: Difficulty) => {
    if (engine) {
      engine.updateDifficulty(difficulty);
      // Force a re-render to update the UI
      dispatch({
        type: GameActionType.UPDATE_STATE,
        payload: { state: engine.getState() }
      });
    }
  };

  // Auto-draw tile when it's human player's turn and phase is DRAW
  useEffect(() => {
    if (isHumanTurn && state.turnPhase === TurnPhase.DRAW && state.gameStatus === GameStatus.IN_PROGRESS) {
      const drawTile = async () => {
        try {
          await dispatch({
            type: GameActionType.DRAW_TILE,
            payload: { playerId: 0 }
          });
        } catch (err) {
          setError(err instanceof Error ? err : 'Failed to draw tile');
          console.error('Error drawing tile:', err);
        }
      };
      drawTile();
    }
  }, [isHumanTurn, state.turnPhase, state.gameStatus, dispatch]);



  // Get other players for indicators
  const topPlayer = state.players?.[2];
  const rightPlayer = state.players?.[1];
  const leftPlayer = state.players?.[3];

  // Get winner information if game is won
  const winnerInfo = state.gameStatus === GameStatus.WON && engine ? engine.getWinnerInfo() : null;

  // If game is not initialized yet, show loading state
  if (!humanPlayer) {
    return (
      <div className="game-board">
        <div className="game-board-header">
          <h1 className="game-title">American Mahjong</h1>
        </div>
        <div className="game-board-main">
          <div className="loading-message">Initializing game...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-board">
      {/* Winner Display Modal */}
      {winnerInfo && (
        <WinnerDisplay
          winner={winnerInfo.player}
          validationResult={winnerInfo.validationResult}
          onNewGame={handleNewGame}
        />
      )}

      {/* Draw Display Modal */}
      {state.gameStatus === GameStatus.DRAW && (
        <DrawDisplay onNewGame={handleNewGame} />
      )}
      {/* Header Section */}
      <div className="game-board-header">
        <h1 className="game-title">American Mahjong</h1>
        <div className="turn-indicator">
          <span className="turn-label">Current Turn:</span>
          <span className={`turn-player ${isHumanTurn ? 'turn-player-human' : 'turn-player-ai'}`}>
            {isHumanTurn ? 'Your Turn' : `AI Player ${state.currentPlayer}`}
          </span>
          {state.turnPhase && (
            <span className="turn-phase">({state.turnPhase})</span>
          )}
        </div>
        <div className="game-settings">
          <CardSelector
            selectedYear={state.selectedCardYear}
            onYearSelect={handleYearSelect}
          />
          <DifficultySelector
            selectedDifficulty={engine?.getDifficulty() || Difficulty.MEDIUM}
            onDifficultySelect={handleDifficultySelect}
          />
        </div>
      </div>

      {/* Error Display */}
      <ErrorMessage 
        error={error} 
        onDismiss={() => setError(null)}
        autoDismiss={true}
        autoDismissDelay={5000}
      />

      {/* Main Game Area */}
      <div className="game-board-main">
        {/* Top Player */}
        <div className="game-board-top">
          <PlayerIndicator
            player={topPlayer}
            isActive={state.currentPlayer === 2}
            position="top"
          />
        </div>

        {/* Middle Row: Left Player, Center Area, Right Player */}
        <div className="game-board-middle">
          <div className="game-board-left">
            <PlayerIndicator
              player={leftPlayer}
              isActive={state.currentPlayer === 3}
              position="left"
            />
          </div>

          <div className="game-board-center">
            <DiscardPile discardedTiles={state.discardPile} />
            
            {/* Game Info */}
            <div className="game-info">
              <div className="game-info-item">
                <span className="info-label">Wall:</span>
                <span className="info-value">{state.wall.length} tiles</span>
              </div>
              {state.winnerId !== undefined && (
                <div className="game-info-item">
                  <span className="info-label">Winner:</span>
                  <span className="info-value">
                    {state.winnerId === 0 ? 'You!' : `AI Player ${state.winnerId}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="game-board-right">
            <PlayerIndicator
              player={rightPlayer}
              isActive={state.currentPlayer === 1}
              position="right"
            />
          </div>
        </div>

        {/* Bottom Section: Human Player */}
        <div className="game-board-bottom">
          <TileRack
            tiles={humanPlayer.hand}
            exposedSets={humanPlayer.exposedSets}
            onTileSelect={handleTileSelect}
            selectedTile={selectedTile}
            isPlayerTurn={isHumanTurn && state.turnPhase === TurnPhase.DISCARD}
          />

          {/* Discard Button */}
          {isHumanTurn && state.turnPhase === TurnPhase.DISCARD && selectedTile && (
            <button
              className="discard-button"
              onClick={handleTileDiscard}
            >
              Discard Selected Tile
            </button>
          )}
        </div>
      </div>

      {/* Controls Section */}
      <div className="game-board-controls">
        <GameControls
          gameStatus={state.gameStatus}
          turnPhase={state.turnPhase}
          callOpportunities={humanCallOpportunities}
          humanPlayerId={0}
          onNewGame={handleNewGame}
          onCall={handleCall}
          onDeclineCall={handleDeclineCall}
        />
      </div>
    </div>
  );
};
