import { TileType } from '../engine/tiles/Tile';

/**
 * Tile requirement specification for a hand pattern
 */
export interface TileRequirement {
  /** Type of tiles required */
  type: TileType | 'any' | 'same_suit';
  /** Number of tiles required */
  count: number;
  /** Whether tiles must be in sequence */
  sequence?: boolean;
  /** Specific values required (if applicable) */
  specific?: (number | string)[];
  /** Specific values for sequence patterns */
  values?: (number | string)[];
  /** Whether jokers can be used for this requirement */
  jokerAllowed: boolean;
}

/**
 * Represents a valid winning hand pattern
 */
export interface HandPattern {
  /** Unique identifier for the pattern */
  id: string;
  /** Display name of the pattern */
  name: string;
  /** Category the pattern belongs to */
  category: string;
  /** Point value of the pattern */
  points: number;
  /** Tile requirements for this pattern */
  tiles: TileRequirement[];
}

/**
 * Card configuration for a specific year
 */
export interface CardConfig {
  /** Year of the card */
  year: number;
  /** Version of the card configuration */
  version: string;
  /** List of valid hand patterns for this year */
  patterns: HandPattern[];
}
