import React from 'react';
import type { Player } from '../../types';
import './PlayerIndicator.css';

interface PlayerIndicatorProps {
  player: Player;
  isActive: boolean;
  position: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * PlayerIndicator component displays information about a player
 * including their exposed sets and active turn status
 */
export const PlayerIndicator: React.FC<PlayerIndicatorProps> = ({
  player,
  isActive,
  position
}) => {
  const playerLabel = player.isHuman ? 'You' : `AI Player ${player.id}`;
  const tileCount = player.hand.length;

  return (
    <div
      className={`player-indicator player-indicator-${position} ${
        isActive ? 'player-indicator-active' : ''
      }`}
    >
      <div className="player-info">
        <div className="player-label">{playerLabel}</div>
        <div className="player-tile-count">{tileCount} tiles</div>
        {isActive && <div className="player-turn-indicator">● TURN</div>}
      </div>

      {/* Exposed Sets */}
      {player.exposedSets.length > 0 && (
        <div className="player-exposed-sets">
          <div className="exposed-sets-label">Exposed:</div>
          <div className="exposed-sets-list">
            {player.exposedSets.map((set, index) => (
              <div key={index} className={`player-set player-set-${set.type}`}>
                <div className="set-type-badge">{set.type.toUpperCase()}</div>
                <div className="set-tiles">
                  {set.tiles.map((tile, tileIndex) => (
                    <div key={`${index}-${tileIndex}`} className="set-tile">
                      <span className="set-tile-type">{tile.type}</span>
                      <span className="set-tile-value">{tile.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
