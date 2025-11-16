import { TileClass, SetType, type Tile } from './Tile';

/**
 * TileSet class represents an exposed set of tiles (Pung, Kong, or Chow)
 * Provides creation and validation logic for different set types
 */
export class TileSetClass {
  public readonly type: SetType;
  public readonly tiles: TileClass[];

  /**
   * Creates a new TileSet instance
   * @param type - The type of set (Pung, Kong, or Chow)
   * @param tiles - The tiles in the set
   * @throws Error if the set is invalid
   */
  constructor(type: SetType, tiles: TileClass[]) {
    this.type = type;
    this.tiles = tiles;

    if (!this.validate()) {
      throw new Error(`Invalid ${type} set: ${this.getValidationError()}`);
    }
  }

  /**
   * Creates a Pung set (three identical tiles)
   * @param tiles - Array of three tiles
   * @returns A new TileSet instance
   * @throws Error if tiles don't form a valid Pung
   */
  static createPung(tiles: TileClass[]): TileSetClass {
    return new TileSetClass(SetType.PUNG, tiles);
  }

  /**
   * Creates a Kong set (four identical tiles)
   * @param tiles - Array of four tiles
   * @returns A new TileSet instance
   * @throws Error if tiles don't form a valid Kong
   */
  static createKong(tiles: TileClass[]): TileSetClass {
    return new TileSetClass(SetType.KONG, tiles);
  }

  /**
   * Creates a Chow set (three consecutive suited tiles)
   * @param tiles - Array of three tiles
   * @returns A new TileSet instance
   * @throws Error if tiles don't form a valid Chow
   */
  static createChow(tiles: TileClass[]): TileSetClass {
    return new TileSetClass(SetType.CHOW, tiles);
  }

  /**
   * Validates the tile set according to its type
   * @returns True if the set is valid
   */
  private validate(): boolean {
    switch (this.type) {
      case SetType.PUNG:
        return this.validatePung();
      case SetType.KONG:
        return this.validateKong();
      case SetType.CHOW:
        return this.validateChow();
      default:
        return false;
    }
  }

  /**
   * Validates a Pung set (three identical tiles)
   * @returns True if valid
   */
  private validatePung(): boolean {
    if (this.tiles.length !== 3) {
      return false;
    }

    const firstTile = this.tiles[0];
    return this.tiles.every(tile => tile.equals(firstTile));
  }

  /**
   * Validates a Kong set (four identical tiles)
   * @returns True if valid
   */
  private validateKong(): boolean {
    if (this.tiles.length !== 4) {
      return false;
    }

    const firstTile = this.tiles[0];
    return this.tiles.every(tile => tile.equals(firstTile));
  }

  /**
   * Validates a Chow set (three consecutive suited tiles of the same suit)
   * @returns True if valid
   */
  private validateChow(): boolean {
    if (this.tiles.length !== 3) {
      return false;
    }

    // All tiles must be suited and of the same type
    if (!this.tiles.every(tile => tile.isSuited())) {
      return false;
    }

    const firstType = this.tiles[0].type;
    if (!this.tiles.every(tile => tile.type === firstType)) {
      return false;
    }

    // Get numeric values and sort
    const values = this.tiles
      .map(tile => tile.getNumericValue())
      .filter((v): v is number => v !== null)
      .sort((a, b) => a - b);

    if (values.length !== 3) {
      return false;
    }

    // Check if values are consecutive
    return values[1] === values[0] + 1 && values[2] === values[1] + 1;
  }

  /**
   * Gets a descriptive error message for validation failures
   * @returns Error message describing why the set is invalid
   */
  private getValidationError(): string {
    switch (this.type) {
      case SetType.PUNG: {
        if (this.tiles.length !== 3) {
          return `Pung requires exactly 3 tiles, got ${this.tiles.length}`;
        }
        return 'Pung requires three identical tiles';
      }
      
      case SetType.KONG: {
        if (this.tiles.length !== 4) {
          return `Kong requires exactly 4 tiles, got ${this.tiles.length}`;
        }
        return 'Kong requires four identical tiles';
      }
      
      case SetType.CHOW: {
        if (this.tiles.length !== 3) {
          return `Chow requires exactly 3 tiles, got ${this.tiles.length}`;
        }
        if (!this.tiles.every(tile => tile.isSuited())) {
          return 'Chow requires suited tiles only';
        }
        const firstType = this.tiles[0].type;
        if (!this.tiles.every(tile => tile.type === firstType)) {
          return 'Chow requires tiles of the same suit';
        }
        return 'Chow requires three consecutive tiles';
      }
      
      default:
        return 'Unknown set type';
    }
  }

  /**
   * Checks if a given array of tiles can form a valid Pung
   * @param tiles - Tiles to check
   * @returns True if tiles can form a Pung
   */
  static canFormPung(tiles: Tile[]): boolean {
    if (tiles.length !== 3) {
      return false;
    }
    return tiles.every(tile => 
      tile.type === tiles[0].type && tile.value === tiles[0].value
    );
  }

  /**
   * Checks if a given array of tiles can form a valid Kong
   * @param tiles - Tiles to check
   * @returns True if tiles can form a Kong
   */
  static canFormKong(tiles: Tile[]): boolean {
    if (tiles.length !== 4) {
      return false;
    }
    return tiles.every(tile => 
      tile.type === tiles[0].type && tile.value === tiles[0].value
    );
  }

  /**
   * Checks if a given array of tiles can form a valid Chow
   * @param tiles - Tiles to check
   * @returns True if tiles can form a Chow
   */
  static canFormChow(tiles: Tile[]): boolean {
    if (tiles.length !== 3) {
      return false;
    }

    // Check if all tiles are suited and of the same type
    const firstTile = tiles[0];
    if (!(firstTile.type === 'bamboo' || firstTile.type === 'character' || firstTile.type === 'dot')) {
      return false;
    }

    if (!tiles.every(tile => tile.type === firstTile.type)) {
      return false;
    }

    // Get numeric values and sort
    const values = tiles
      .map(tile => typeof tile.value === 'number' ? tile.value : null)
      .filter((v): v is number => v !== null)
      .sort((a, b) => a - b);

    if (values.length !== 3) {
      return false;
    }

    // Check if consecutive
    return values[1] === values[0] + 1 && values[2] === values[1] + 1;
  }

  /**
   * Gets the count of tiles in the set
   * @returns Number of tiles
   */
  getCount(): number {
    return this.tiles.length;
  }

  /**
   * Checks if the set contains a specific tile
   * @param tile - Tile to check
   * @returns True if the tile is in the set
   */
  contains(tile: Tile): boolean {
    return this.tiles.some(t => t.id === tile.id);
  }

  /**
   * Returns a string representation of the set
   * @returns String representation
   */
  toString(): string {
    const tileStr = this.tiles.map(t => t.toString()).join(', ');
    return `${this.type.toUpperCase()}: [${tileStr}]`;
  }
}
