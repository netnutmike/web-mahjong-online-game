import React from 'react';
import type { Tile, TileSet } from '../../types';
import './TileRack.css';

interface TileRackProps {
  tiles: Tile[];
  exposedSets: TileSet[];
  onTileSelect: (tile: Tile) => void;
  selectedTile?: Tile;
  isPlayerTurn: boolean;
}

/**
 * TileRack component displays the player's tiles in an organized rack
 * with exposed sets displayed separately
 */
export const TileRack: React.FC<TileRackProps> = ({
  tiles,
  exposedSets,
  onTileSelect,
  selectedTile,
  isPlayerTurn
}) => {
  const handleTileClick = (tile: Tile) => {
    if (isPlayerTurn && !tile.isExposed) {
      onTileSelect(tile);
    }
  };

  const isSelected = (tile: Tile): boolean => {
    return selectedTile?.id === tile.id;
  };

  // Separate concealed tiles from exposed tiles
  const concealedTiles = tiles.filter(tile => !tile.isExposed);

  return (
    <div className="tile-rack">
      {/* Exposed Sets Section */}
      {exposedSets.length > 0 && (
        <div className="exposed-sets-section">
          <div className="section-label">Exposed Sets</div>
          <div className="exposed-sets">
            {exposedSets.map((set, setIndex) => (
              <div key={setIndex} className={`tile-set tile-set-${set.type}`}>
                {set.tiles.map((tile, tileIndex) => (
                  <div
                    key={`${setIndex}-${tileIndex}-${tile.id}`}
                    className="tile tile-exposed"
                  >
                    <div className="tile-content">
                      <span className="tile-type">{tile.type}</span>
                      <span className="tile-value">{tile.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concealed Tiles Section */}
      <div className="concealed-tiles-section">
        <div className="section-label">Your Hand</div>
        <div className="concealed-tiles">
          {concealedTiles.map((tile) => (
            <div
              key={tile.id}
              className={`tile ${isSelected(tile) ? 'tile-selected' : ''} ${
                isPlayerTurn ? 'tile-clickable' : 'tile-disabled'
              }`}
              onClick={() => handleTileClick(tile)}
            >
              <div className="tile-content">
                <span className="tile-type">{tile.type}</span>
                <span className="tile-value">{tile.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
