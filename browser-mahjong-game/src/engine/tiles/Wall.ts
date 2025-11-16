import { TileClass, TileType } from './Tile';

/**
 * Wall class manages the tile pool for a mahjong game
 * Handles initialization, shuffling, and drawing of tiles
 */
export class Wall {
  private tiles: TileClass[];
  private drawnCount: number;

  /**
   * Creates a new Wall instance
   * @param tiles - Optional array of tiles (for testing or custom initialization)
   */
  constructor(tiles?: TileClass[]) {
    this.tiles = tiles || [];
    this.drawnCount = 0;
    
    if (!tiles) {
      this.initialize();
    }
  }

  /**
   * Initializes the wall with 144 standard American Mahjong tiles
   * - 36 Bamboo tiles (1-9, four of each)
   * - 36 Character tiles (1-9, four of each)
   * - 36 Dot tiles (1-9, four of each)
   * - 16 Wind tiles (N, E, S, W, four of each)
   * - 12 Dragon tiles (Red, Green, White, four of each)
   * - 8 Joker tiles
   */
  private initialize(): void {
    this.tiles = [];
    this.drawnCount = 0;

    // Add suited tiles (Bamboo, Character, Dot)
    const suitedTypes = [TileType.BAMBOO, TileType.CHARACTER, TileType.DOT];
    for (const type of suitedTypes) {
      for (let value = 1; value <= 9; value++) {
        for (let copy = 0; copy < 4; copy++) {
          this.tiles.push(new TileClass(type, value));
        }
      }
    }

    // Add Wind tiles
    const winds = ['N', 'E', 'S', 'W'];
    for (const wind of winds) {
      for (let copy = 0; copy < 4; copy++) {
        this.tiles.push(new TileClass(TileType.WIND, wind));
      }
    }

    // Add Dragon tiles
    const dragons = ['Red', 'Green', 'White'];
    for (const dragon of dragons) {
      for (let copy = 0; copy < 4; copy++) {
        this.tiles.push(new TileClass(TileType.DRAGON, dragon));
      }
    }

    // Add Joker tiles
    for (let copy = 0; copy < 8; copy++) {
      this.tiles.push(new TileClass(TileType.JOKER, 'Joker'));
    }
  }

  /**
   * Shuffles the tiles in the wall using Fisher-Yates algorithm
   */
  shuffle(): void {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  /**
   * Draws a tile from the wall
   * @returns The drawn tile, or null if the wall is empty
   */
  draw(): TileClass | null {
    if (this.isEmpty()) {
      return null;
    }
    
    const tile = this.tiles[this.drawnCount];
    this.drawnCount++;
    return tile;
  }

  /**
   * Draws multiple tiles from the wall
   * @param count - Number of tiles to draw
   * @returns Array of drawn tiles (may be fewer than requested if wall runs out)
   */
  drawMultiple(count: number): TileClass[] {
    const drawn: TileClass[] = [];
    for (let i = 0; i < count; i++) {
      const tile = this.draw();
      if (tile === null) {
        break;
      }
      drawn.push(tile);
    }
    return drawn;
  }

  /**
   * Checks if the wall is empty (no more tiles to draw)
   * @returns True if no tiles remain
   */
  isEmpty(): boolean {
    return this.drawnCount >= this.tiles.length;
  }

  /**
   * Gets the number of tiles remaining in the wall
   * @returns Number of undrawn tiles
   */
  getRemainingCount(): number {
    return Math.max(0, this.tiles.length - this.drawnCount);
  }

  /**
   * Gets the total number of tiles in the wall
   * @returns Total tile count
   */
  getTotalCount(): number {
    return this.tiles.length;
  }

  /**
   * Gets the number of tiles that have been drawn
   * @returns Number of drawn tiles
   */
  getDrawnCount(): number {
    return this.drawnCount;
  }

  /**
   * Resets the wall to its initial state (all tiles available)
   * Does not re-shuffle
   */
  reset(): void {
    this.drawnCount = 0;
  }

  /**
   * Gets all tiles in the wall (for testing purposes)
   * @returns Array of all tiles
   */
  getAllTiles(): TileClass[] {
    return [...this.tiles];
  }

  /**
   * Gets all remaining (undrawn) tiles
   * @returns Array of remaining tiles
   */
  getRemainingTiles(): TileClass[] {
    return this.tiles.slice(this.drawnCount);
  }
}
