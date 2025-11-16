import React from 'react';
import './DrawDisplay.css';

interface DrawDisplayProps {
  onNewGame: () => void;
}

/**
 * DrawDisplay component shows when the game ends in a draw
 */
export const DrawDisplay: React.FC<DrawDisplayProps> = ({ onNewGame }) => {
  return (
    <div className="draw-display-overlay">
      <div className="draw-display-modal">
        <div className="draw-display-header">
          <h2 className="draw-display-title">Game Draw</h2>
        </div>

        <div className="draw-display-content">
          <div className="draw-icon">🀄</div>
          <p className="draw-message">
            The wall has been exhausted with no winner.
          </p>
          <p className="draw-submessage">
            Better luck next time!
          </p>
        </div>

        <div className="draw-display-actions">
          <button className="new-game-button" onClick={onNewGame}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
