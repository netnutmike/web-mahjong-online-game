import React from 'react';
import type { Player, ValidationResult } from '../../types';
import './WinnerDisplay.css';

interface WinnerDisplayProps {
  winner: Player;
  validationResult: ValidationResult;
  onNewGame: () => void;
}

/**
 * WinnerDisplay component shows the winning hand and pattern information
 */
export const WinnerDisplay: React.FC<WinnerDisplayProps> = ({
  winner,
  validationResult,
  onNewGame
}) => {
  const isHumanWinner = winner.isHuman;
  const pattern = validationResult.matchedPattern;

  return (
    <div className="winner-display-overlay">
      <div className="winner-display-modal">
        <div className="winner-display-header">
          <h2 className="winner-display-title">
            {isHumanWinner ? '🎉 You Won! 🎉' : `AI Player ${winner.id} Won!`}
          </h2>
        </div>

        <div className="winner-display-content">
          {pattern && (
            <div className="winner-pattern-info">
              <div className="pattern-name">{pattern.name}</div>
              <div className="pattern-category">{pattern.category}</div>
              <div className="pattern-points">{pattern.points} points</div>
            </div>
          )}

          <div className="winner-hand-display">
            <h3 className="hand-title">Winning Hand:</h3>
            <div className="hand-tiles">
              {winner.hand.map((tile, index) => (
                <div key={`${tile.id}-${index}`} className="winner-tile">
                  <div className="tile-type">{tile.type}</div>
                  <div className="tile-value">{tile.value}</div>
                </div>
              ))}
            </div>

            {winner.exposedSets.length > 0 && (
              <div className="exposed-sets-section">
                <h4 className="exposed-sets-title">Exposed Sets:</h4>
                {winner.exposedSets.map((set, setIndex) => (
                  <div key={setIndex} className="exposed-set">
                    <div className="set-type">{set.type.toUpperCase()}</div>
                    <div className="set-tiles">
                      {set.tiles.map((tile, tileIndex) => (
                        <div key={`${tile.id}-${tileIndex}`} className="winner-tile">
                          <div className="tile-type">{tile.type}</div>
                          <div className="tile-value">{tile.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="winner-display-actions">
          <button className="new-game-button" onClick={onNewGame}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
