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

type SortMode = 'suit-value' | 'value';

/**
 * Get abbreviated tile type for display
 */
const getTileTypeAbbreviation = (type: string): string => {
  const abbreviations: Record<string, string> = {
    'bamboo': 'BAM',
    'character': 'CRAK',
    'dot': 'DOT',
    'wind': 'WIND',
    'dragon': 'DRAG',
    'flower': 'FLWR',
    'joker': 'JOKR'
  };
  return abbreviations[type.toLowerCase()] || type.toUpperCase().substring(0, 4);
};

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
  const [sortMode, setSortMode] = React.useState<SortMode>('suit-value');

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

  // Sort tiles based on current sort mode
  const sortedTiles = React.useMemo(() => {
    const tilesToSort = [...concealedTiles];
    
    if (sortMode === 'suit-value') {
      // Sort by suit (type) first, then by value
      return tilesToSort.sort((a, b) => {
        // Define suit order: bamboo, character, dot, wind, dragon, flower, joker
        const suitOrder: Record<string, number> = {
          bamboo: 0,
          character: 1,
          dot: 2,
          wind: 3,
          dragon: 4,
          flower: 5,
          joker: 6
        };
        
        const suitCompare = (suitOrder[a.type] || 99) - (suitOrder[b.type] || 99);
        if (suitCompare !== 0) return suitCompare;
        
        // Within same suit, sort by value
        const aValue = typeof a.value === 'number' ? a.value : String(a.value);
        const bValue = typeof b.value === 'number' ? b.value : String(b.value);
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        }
        return String(aValue).localeCompare(String(bValue));
      });
    } else {
      // Sort by value only
      return tilesToSort.sort((a, b) => {
        const aValue = typeof a.value === 'number' ? a.value : String(a.value);
        const bValue = typeof b.value === 'number' ? b.value : String(b.value);
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        }
        return String(aValue).localeCompare(String(bValue));
      });
    }
  }, [concealedTiles, sortMode]);

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
                      <span className="tile-type">{getTileTypeAbbreviation(tile.type)}</span>
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
        <div className="section-header">
          <div className="section-label">Your Hand</div>
          <div className="sort-buttons">
            <button
              className={`sort-button ${sortMode === 'suit-value' ? 'sort-button-active' : ''}`}
              onClick={() => setSortMode('suit-value')}
              title="Sort by suit, then value"
            >
              Sort by Suit
            </button>
            <button
              className={`sort-button ${sortMode === 'value' ? 'sort-button-active' : ''}`}
              onClick={() => setSortMode('value')}
              title="Sort by value only"
            >
              Sort by Value
            </button>
          </div>
        </div>
        <div className="concealed-tiles">
          {sortedTiles.map((tile) => (
            <div
              key={tile.id}
              className={`tile ${isSelected(tile) ? 'tile-selected' : ''} ${
                isPlayerTurn ? 'tile-clickable' : 'tile-disabled'
              }`}
              onClick={() => handleTileClick(tile)}
            >
              <div className="tile-content">
                <span className="tile-type">{getTileTypeAbbreviation(tile.type)}</span>
                <span className="tile-value">{tile.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
