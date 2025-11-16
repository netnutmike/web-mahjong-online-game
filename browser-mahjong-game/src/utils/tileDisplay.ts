/**
 * Utility functions for displaying tiles with Unicode mahjong characters
 */

/**
 * Get Unicode mahjong character for a tile
 * @param type - Tile type
 * @param value - Tile value
 * @returns Unicode character or emoji representation
 */
export function getTileUnicode(type: string, value: string | number): string {
  const typeStr = type.toLowerCase();
  const valueStr = String(value).toUpperCase();

  // Bamboo tiles (🀐-🀘)
  if (typeStr === 'bamboo') {
    const bambooMap: Record<string, string> = {
      '1': '🀐', '2': '🀑', '3': '🀒', '4': '🀓', '5': '🀔',
      '6': '🀕', '7': '🀖', '8': '🀗', '9': '🀘'
    };
    return bambooMap[valueStr] || '🀐';
  }

  // Character/Crak tiles (🀇-🀏)
  if (typeStr === 'character') {
    const characterMap: Record<string, string> = {
      '1': '🀇', '2': '🀈', '3': '🀉', '4': '🀊', '5': '🀋',
      '6': '🀌', '7': '🀍', '8': '🀎', '9': '🀏'
    };
    return characterMap[valueStr] || '🀇';
  }

  // Dot tiles (🀙-🀡)
  if (typeStr === 'dot') {
    const dotMap: Record<string, string> = {
      '1': '🀙', '2': '🀚', '3': '🀛', '4': '🀜', '5': '🀝',
      '6': '🀞', '7': '🀟', '8': '🀠', '9': '🀡'
    };
    return dotMap[valueStr] || '🀙';
  }

  // Wind tiles (🀀-🀃)
  if (typeStr === 'wind') {
    const windMap: Record<string, string> = {
      'E': '🀀', 'EAST': '🀀',
      'S': '🀁', 'SOUTH': '🀁',
      'W': '🀂', 'WEST': '🀂',
      'N': '🀃', 'NORTH': '🀃'
    };
    return windMap[valueStr] || '🀀';
  }

  // Dragon tiles (🀄-🀆)
  if (typeStr === 'dragon') {
    const dragonMap: Record<string, string> = {
      'RED': '🀄',
      'GREEN': '🀅',
      'WHITE': '🀆'
    };
    return dragonMap[valueStr] || '🀄';
  }

  // Joker
  if (typeStr === 'joker') {
    return '🃏';
  }

  // Flower tiles
  if (typeStr === 'flower') {
    return '🀢';
  }

  // Default fallback
  return '🀫';
}

/**
 * Get abbreviated tile type for display
 */
export function getTileTypeAbbreviation(type: string): string {
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
}
