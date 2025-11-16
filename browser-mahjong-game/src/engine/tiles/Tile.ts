/**
 * Tile types in American Mahjong
 */
export const TileType = {
  BAMBOO: 'bamboo',
  CHARACTER: 'character',
  DOT: 'dot',
  WIND: 'wind',
  DRAGON: 'dragon',
  FLOWER: 'flower',
  JOKER: 'joker'
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

/**
 * Represents a single mahjong tile
 */
export interface Tile {
  /** Unique identifier for the tile */
  id: string;
  /** Type of the tile */
  type: TileType;
  /** Value of the tile (number for suited tiles, string for honors) */
  value: number | string;
  /** Whether the tile is exposed (part of a called set) */
  isExposed: boolean;
}

/**
 * Type of exposed tile set
 */
export const SetType = {
  PUNG: 'pung',   // Three identical tiles
  KONG: 'kong',   // Four identical tiles
  CHOW: 'chow'    // Three consecutive tiles of the same suit
} as const;

export type SetType = typeof SetType[keyof typeof SetType];

/**
 * Represents an exposed set of tiles
 */
export interface TileSet {
  /** Type of the set */
  type: SetType;
  /** Tiles in the set */
  tiles: Tile[];
}

/**
 * Serialized tile data for storage and transmission
 */
export interface SerializedTile {
  type: TileType;
  value: number | string;
  isExposed: boolean;
}

/**
 * Tile class with creation, comparison, and serialization methods
 */
export class TileClass implements Tile {
  public readonly id: string;
  public readonly type: TileType;
  public readonly value: number | string;
  public isExposed: boolean;

  /**
   * Creates a new Tile instance
   * @param type - The type of the tile
   * @param value - The value of the tile
   * @param isExposed - Whether the tile is exposed (default: false)
   * @param id - Optional custom ID (auto-generated if not provided)
   */
  constructor(type: TileType, value: number | string, isExposed: boolean = false, id?: string) {
    this.type = type;
    this.value = value;
    this.isExposed = isExposed;
    this.id = id || TileClass.generateId(type, value);
  }

  /**
   * Generates a unique ID for a tile based on type and value
   * @param type - The tile type
   * @param value - The tile value
   * @returns A unique identifier string
   */
  private static generateId(type: TileType, value: number | string): string {
    return `${type}-${value}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Creates a tile from serialized data
   * @param data - Serialized tile data
   * @returns A new Tile instance
   */
  static fromSerialized(data: SerializedTile): TileClass {
    return new TileClass(data.type, data.value, data.isExposed);
  }

  /**
   * Serializes the tile to a plain object
   * @returns Serialized tile data
   */
  serialize(): SerializedTile {
    return {
      type: this.type,
      value: this.value,
      isExposed: this.isExposed
    };
  }

  /**
   * Compares this tile with another tile for equality (ignoring ID and exposure status)
   * @param other - The tile to compare with
   * @returns True if tiles have the same type and value
   */
  equals(other: Tile): boolean {
    return this.type === other.type && this.value === other.value;
  }

  /**
   * Checks if this tile matches another tile exactly (including exposure status)
   * @param other - The tile to compare with
   * @returns True if tiles are identical
   */
  exactMatch(other: Tile): boolean {
    return this.equals(other) && this.isExposed === other.isExposed;
  }

  /**
   * Checks if this tile is a joker
   * @returns True if the tile is a joker
   */
  isJoker(): boolean {
    return this.type === TileType.JOKER;
  }

  /**
   * Checks if this tile is a suited tile (Bamboo, Character, or Dot)
   * @returns True if the tile is suited
   */
  isSuited(): boolean {
    return this.type === TileType.BAMBOO || 
           this.type === TileType.CHARACTER || 
           this.type === TileType.DOT;
  }

  /**
   * Checks if this tile is an honor tile (Wind, Dragon, or Flower)
   * @returns True if the tile is an honor tile
   */
  isHonor(): boolean {
    return this.type === TileType.WIND || 
           this.type === TileType.DRAGON || 
           this.type === TileType.FLOWER;
  }

  /**
   * Checks if this tile can form a sequence with other tiles
   * @returns True if the tile is suited (sequences only work with suited tiles)
   */
  canFormSequence(): boolean {
    return this.isSuited() && typeof this.value === 'number';
  }

  /**
   * Gets the numeric value of the tile (for suited tiles)
   * @returns The numeric value or null if not applicable
   */
  getNumericValue(): number | null {
    return typeof this.value === 'number' ? this.value : null;
  }

  /**
   * Creates a copy of this tile
   * @param overrides - Optional properties to override
   * @returns A new Tile instance
   */
  clone(overrides?: Partial<{ isExposed: boolean }>): TileClass {
    return new TileClass(
      this.type,
      this.value,
      overrides?.isExposed ?? this.isExposed
    );
  }

  /**
   * Returns a string representation of the tile
   * @returns String representation
   */
  toString(): string {
    const exposedStr = this.isExposed ? ' (exposed)' : '';
    return `${this.type}:${this.value}${exposedStr}`;
  }
}
