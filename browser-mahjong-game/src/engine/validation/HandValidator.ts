import { TileType, type Tile, type TileSet } from '../tiles/Tile';
import type { CardConfig, HandPattern, TileRequirement } from '../../config/CardTypes';

/**
 * Result of hand validation
 */
export interface ValidationResult {
  /** Whether the hand is valid */
  isValid: boolean;
  /** The matched pattern (if valid) */
  matchedPattern?: HandPattern;
  /** Score of the hand (if valid) */
  score?: number;
  /** Error message (if invalid) */
  error?: string;
}

/**
 * HandValidator validates winning hands against card patterns
 * Implements pattern matching with joker substitution logic
 */
export class HandValidator {
  private cardConfig: CardConfig;

  /**
   * Creates a new HandValidator instance
   * @param cardConfig - The card configuration to validate against
   */
  constructor(cardConfig: CardConfig) {
    this.cardConfig = cardConfig;
  }

  /**
   * Validates a complete hand against all patterns in the card configuration
   * @param hand - The player's concealed tiles
   * @param exposedSets - The player's exposed tile sets
   * @returns Validation result with matched pattern and score
   */
  validateHand(hand: Tile[], exposedSets: TileSet[]): ValidationResult {
    // Combine hand and exposed sets into a single tile array
    const allTiles = [...hand];
    for (const set of exposedSets) {
      allTiles.push(...set.tiles);
    }

    // American Mahjong requires exactly 14 tiles
    if (allTiles.length !== 14) {
      return {
        isValid: false,
        error: `Invalid hand size: ${allTiles.length} tiles (expected 14)`
      };
    }

    // Try to match against each pattern
    for (const pattern of this.cardConfig.patterns) {
      if (this.matchPattern(allTiles, pattern)) {
        return {
          isValid: true,
          matchedPattern: pattern,
          score: this.calculateScore(pattern)
        };
      }
    }

    return {
      isValid: false,
      error: 'Hand does not match any valid pattern'
    };
  }

  /**
   * Attempts to match a set of tiles against a specific hand pattern
   * @param tiles - The tiles to match
   * @param pattern - The pattern to match against
   * @returns True if the tiles match the pattern
   */
  matchPattern(tiles: Tile[], pattern: HandPattern): boolean {
    // Create a working copy of tiles
    const availableTiles = [...tiles];
    
    // Try to satisfy each tile requirement in the pattern
    for (const requirement of pattern.tiles) {
      const matched = this.matchRequirement(availableTiles, requirement);
      if (!matched) {
        return false;
      }
    }

    // All requirements satisfied and no tiles left over
    return availableTiles.length === 0;
  }

  /**
   * Attempts to match tiles against a single requirement
   * Removes matched tiles from the available tiles array
   * @param availableTiles - Mutable array of available tiles
   * @param requirement - The requirement to satisfy
   * @returns True if requirement is satisfied
   */
  private matchRequirement(availableTiles: Tile[], requirement: TileRequirement): boolean {
    const { type, count, sequence, specific, values, jokerAllowed } = requirement;

    if (sequence) {
      return this.matchSequence(availableTiles, requirement);
    }

    // For non-sequence requirements with count > 1, we need IDENTICAL tiles (pung/pair)
    // This means tiles with the same type AND value
    
    // Collect jokers separately
    const jokers: Tile[] = [];
    for (let i = availableTiles.length - 1; i >= 0; i--) {
      if (availableTiles[i].type === TileType.JOKER) {
        jokers.push(availableTiles[i]);
        availableTiles.splice(i, 1);
      }
    }

    // Group tiles by type:value
    const tileGroups = new Map<string, Tile[]>();
    for (const tile of availableTiles) {
      if (this.tileMatchesRequirement(tile, type, specific, values)) {
        const key = `${tile.type}:${tile.value}`;
        if (!tileGroups.has(key)) {
          tileGroups.set(key, []);
        }
        tileGroups.get(key)!.push(tile);
      }
    }

    // Try to find a group with enough identical tiles
    for (const [key, group] of tileGroups) {
      const availableCount = group.length;
      const jokersNeeded = Math.max(0, count - availableCount);
      
      if (availableCount + jokers.length >= count) {
        // We can satisfy this requirement with this group
        // Remove the tiles from availableTiles
        for (let i = 0; i < Math.min(count, availableCount); i++) {
          const tileIndex = availableTiles.indexOf(group[i]);
          if (tileIndex !== -1) {
            availableTiles.splice(tileIndex, 1);
          }
        }
        
        // Use jokers if needed
        if (jokersNeeded > 0 && jokerAllowed) {
          jokers.splice(0, jokersNeeded);
        }
        
        // Put unused jokers back
        availableTiles.push(...jokers);
        return true;
      }
    }

    // Couldn't satisfy requirement, restore jokers
    availableTiles.push(...jokers);
    return false;
  }

  /**
   * Matches a sequence requirement (consecutive tiles)
   * @param availableTiles - Mutable array of available tiles
   * @param requirement - The sequence requirement
   * @returns True if sequence is matched
   */
  private matchSequence(availableTiles: Tile[], requirement: TileRequirement): boolean {
    const { type, values, jokerAllowed } = requirement;

    if (!values || values.length === 0) {
      return false;
    }

    // For same_suit sequences, we need to find tiles of the same suit
    if (type === 'same_suit') {
      // Try each suit
      for (const suitType of [TileType.BAMBOO, TileType.CHARACTER, TileType.DOT]) {
        const result = this.matchSequenceForSuit(availableTiles, suitType, values, jokerAllowed);
        if (result) {
          return true;
        }
      }
      return false;
    }

    // For specific type sequences
    if (type !== 'any') {
      return this.matchSequenceForSuit(availableTiles, type as TileType, values, jokerAllowed);
    }

    return false;
  }

  /**
   * Matches a sequence for a specific suit
   * @param availableTiles - Mutable array of available tiles
   * @param suitType - The suit type to match
   * @param values - The sequence values
   * @param jokerAllowed - Whether jokers can be used
   * @returns True if sequence is matched
   */
  private matchSequenceForSuit(
    availableTiles: Tile[],
    suitType: TileType,
    values: (number | string)[],
    jokerAllowed: boolean
  ): boolean {
    const matchedTiles: Tile[] = [];
    const jokers: Tile[] = [];
    const neededValues = new Set(values);

    // Collect tiles and jokers
    for (let i = availableTiles.length - 1; i >= 0; i--) {
      const tile = availableTiles[i];
      
      if (tile.type === TileType.JOKER) {
        jokers.push(tile);
        availableTiles.splice(i, 1);
      } else if (tile.type === suitType && neededValues.has(tile.value)) {
        matchedTiles.push(tile);
        neededValues.delete(tile.value);
        availableTiles.splice(i, 1);
      }
    }

    // Check if we have all values (with jokers if allowed)
    const missingCount = neededValues.size;
    
    if (missingCount === 0) {
      // Perfect match without jokers
      return true;
    }

    if (jokerAllowed && jokers.length >= missingCount) {
      // Use jokers to fill gaps
      jokers.splice(0, missingCount);
      availableTiles.push(...jokers);
      return true;
    }

    // Couldn't match, restore tiles
    availableTiles.push(...matchedTiles, ...jokers);
    return false;
  }

  /**
   * Checks if a tile matches a requirement's type and value constraints
   * @param tile - The tile to check
   * @param type - The required type
   * @param specific - Specific values allowed
   * @param values - Values allowed
   * @returns True if tile matches
   */
  private tileMatchesRequirement(
    tile: Tile,
    type: TileType | 'any' | 'same_suit',
    specific?: (number | string)[],
    values?: (number | string)[]
  ): boolean {
    // Jokers are handled separately
    if (tile.type === TileType.JOKER) {
      return false;
    }

    // Check type constraint
    if (type !== 'any' && type !== 'same_suit') {
      if (tile.type !== type) {
        return false;
      }
    }

    // Check value constraints
    const valueList = specific || values;
    if (valueList && valueList.length > 0) {
      return valueList.includes(tile.value);
    }

    return true;
  }

  /**
   * Calculates the score for a matched pattern
   * @param pattern - The matched pattern
   * @returns The score value
   */
  calculateScore(pattern: HandPattern): number {
    return pattern.points;
  }

  /**
   * Updates the card configuration
   * @param cardConfig - New card configuration
   */
  updateCardConfig(cardConfig: CardConfig): void {
    this.cardConfig = cardConfig;
  }

  /**
   * Gets the current card configuration
   * @returns The current card configuration
   */
  getCardConfig(): CardConfig {
    return this.cardConfig;
  }
}
