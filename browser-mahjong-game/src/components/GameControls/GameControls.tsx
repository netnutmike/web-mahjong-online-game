import React from 'react';
import { CallType, GameStatus, TurnPhase } from '../../types';
import type { CallOpportunity } from '../../types';
import './GameControls.css';

interface GameControlsProps {
  gameStatus: GameStatus;
  turnPhase: TurnPhase;
  callOpportunities: CallOpportunity[];
  humanPlayerId: number;
  onNewGame: () => void;
  onCall: (callType: CallType) => void;
  onDeclineCall?: () => void;
}

/**
 * GameControls component provides game action buttons
 * including New Game and call action buttons (Pung, Kong, Mahjong)
 */
export const GameControls: React.FC<GameControlsProps> = ({
  gameStatus,
  turnPhase,
  callOpportunities,
  humanPlayerId,
  onNewGame,
  onCall,
  onDeclineCall
}) => {
  // Determine which call buttons to show
  const humanCallOpportunities = callOpportunities.filter(
    opp => opp.playerId === humanPlayerId
  );

  const canCallPung = humanCallOpportunities.some(
    opp => opp.callType === CallType.PUNG
  );
  const canCallKong = humanCallOpportunities.some(
    opp => opp.callType === CallType.KONG
  );
  const canCallMahjong = humanCallOpportunities.some(
    opp => opp.callType === CallType.MAHJONG
  );

  const showCallButtons = turnPhase === TurnPhase.CALL_OPPORTUNITY;
  const hasHumanOpportunities = humanCallOpportunities.length > 0;

  const showNewGameButton = gameStatus !== GameStatus.IN_PROGRESS;

  return (
    <div className="game-controls">
      {/* New Game Button */}
      {showNewGameButton && (
        <div className="game-controls-section">
          <button
            className="game-control-button game-control-new-game"
            onClick={onNewGame}
          >
            New Game
          </button>
        </div>
      )}

      {/* Call Action Buttons */}
      {showCallButtons && (
        <div className="game-controls-section">
          <div className="call-buttons-label">
            {hasHumanOpportunities ? 'Call Actions Available:' : 'Waiting for AI decisions...'}
          </div>
          <div className="call-buttons">
            {canCallMahjong && (
              <button
                className="game-control-button call-button call-button-mahjong"
                onClick={() => onCall(CallType.MAHJONG)}
              >
                Mahjong!
              </button>
            )}
            {canCallKong && (
              <button
                className="game-control-button call-button call-button-kong"
                onClick={() => onCall(CallType.KONG)}
              >
                Kong
              </button>
            )}
            {canCallPung && (
              <button
                className="game-control-button call-button call-button-pung"
                onClick={() => onCall(CallType.PUNG)}
              >
                Pung
              </button>
            )}
            {onDeclineCall && (
              <button
                className="game-control-button call-button call-button-decline"
                onClick={onDeclineCall}
              >
                {hasHumanOpportunities ? 'Pass' : 'Continue Game'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game Status Display */}
      {gameStatus !== GameStatus.IN_PROGRESS && (
        <div className="game-status-display">
          {gameStatus === GameStatus.WON && (
            <div className="game-status-won">Game Won!</div>
          )}
          {gameStatus === GameStatus.DRAW && (
            <div className="game-status-draw">Game Draw - Wall Exhausted</div>
          )}
        </div>
      )}
    </div>
  );
};
