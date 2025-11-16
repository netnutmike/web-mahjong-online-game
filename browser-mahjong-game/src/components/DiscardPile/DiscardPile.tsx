import React from 'react';
import type { Tile } from '../../types';
import './DiscardPile.css';

interface DiscardPileProps {
  discardedTiles: Tile[];
}

/**
 * DiscardPile component displays all discarded tiles in the center area
 * with the most recent discard highlighted
 */
export const DiscardPile: React.FC<DiscardPileProps> = ({ discardedTiles }) => {
  const mostRecentIndex = discardedTiles.length - 1;

  return (
    <div className="discard-pile">
      <div className="discard-pile-label">Discard Pile</div>
      <div className="discard-pile-tiles">
        {discardedTiles.length === 0 ? (
          <div className="discard-pile-empty">No tiles discarded yet</div>
        ) : (
          discardedTiles.map((tile, index) => (
            <div
              key={`${tile.id}-${index}`}
              className={`discard-tile ${
                index === mostRecentIndex ? 'discard-tile-recent' : ''
              }`}
            >
              <div className="discard-tile-content">
                <span className="discard-tile-type">{tile.type}</span>
                <span className="discard-tile-value">{tile.value}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
