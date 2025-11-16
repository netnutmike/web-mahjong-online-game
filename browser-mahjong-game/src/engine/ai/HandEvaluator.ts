import type { Tile, TileSet } from '../tiles/Tile';
import { TileType } from '../tiles/Tile';
import type { HandPattern, TileRequirement, CardConfig } from '../../config/CardTypes';

/**
 * Evaluation result for a hand's proximity to winning patterns
 */
export interface HandEvaluation {
  /** The pattern being evaluated */
  pattern: HandPattern;
  /** Number of tiles needed to complete this pattern (0 = complete) */
  tilesNeeded: number;
  /** Score indicating how close the hand is to this pattern (higher is better) */
  proximityScore: number;
  /** Tiles that would help complete this pattern */
  usefulTiles: Set<string>;
}

/**
 * Evaluation of a single tile's usefulness
 */
export interface TileUsefulness {
  /** The tile being evaluated */
  tile: Tile;
  /** Overall usefulness score (higher is better) */
  score: number;
  /** Number of patterns this tile contributes to */
  patternCount: number;
  /** Whether this tile is critical for any near-complete pattern */
  isCritical: boolean;
}

/**
 * HandEvaluator analyzes hands to determine proximity to winning patterns
 * and evaluates tile usefulness for AI decision-making
 */
export class HandEvaluator {
  private cardConfig: CardConfig;

  /**
   * Creates a new HandEvaluator instance
   * @param cardConfig - The card configuration with valid patterns
   */
  constructor(cardConfig: CardConfig) {
    this.cardConfig = cardConfig;
  }

  /**
   * Evaluates a hand against all available patterns
   * Returns patterns sorted by proximity (closest to completion first)
   * @param hand - The player's concealed tiles
   * @param exposedSets - The player's exposed tile sets
   * @returns Array of hand evaluations sorted by proximity
   */
  evaluateHand(hand: Tile[], exposedSets: TileSet[]): HandEvaluation[] {
    const evaluations: HandEvaluation[] = [];

    for (const pattern of this.cardConfig.patterns) {
      const evaluation = this.evaluatePattern(hand, exposedSets, pattern);
      evaluations.push(evaluation);
    }

    // Sort by proximity score (descending) and tiles needed (ascending)
    evaluations.sort((a, b) => {
      if (a.tilesNeeded !== b.tilesNeeded) {
        return a.tilesNeeded - b.tilesNeeded;
      }
      return b.proximityScore - a.proximityScore;
    });

    return evaluations;
  }

  /**
   * Evaluates how close a hand is to completing a specific pattern
   * @param hand - The player's concealed tiles
   * @param exposedSets - The player's exposed tile sets
   * @param pattern - The pattern to evaluate against
   * @returns Evaluation result
   */
  private evaluatePattern(
    hand: Tile[],
    exposedSets: TileSet[],
    pattern: HandPattern
  ): HandEvaluation {
    // Combine hand and exposed sets
    const allTiles = [...hand];
    for (const set of exposedSets) {
      allTiles.push(...set.tiles);
    }

    const tileCounts = this.countTiles(allTiles);
    const jokerCount = tileCounts.get(this.getTileKey({ type: TileType.JOKER, value: 0 } as Tile)) || 0;

    let totalMatched = 0;
    let totalRequired = 0;
    const usefulTiles = new Set<string>();

    for (const requirement of pattern.tiles) {
      totalRequired += requirement.count;
      const matched = this.countMatchingTiles(tileCounts, requirement);
      totalMatched += matched;

      // Identify useful tiles for this requirement
      this.addUsefulTiles(usefulTiles, requirement);
    }

    // Calculate tiles needed (accounting for jokers if allowed)
    const tilesNeeded = Math.max(0, totalRequired - totalMatched - jokerCount);

    // Calculate proximity score (0-100)
    const completionRatio = totalMatched / totalRequired;
    const proximityScore = Math.round(completionRatio * 100);

    return {
      pattern,
      tilesNeeded,
      proximityScore,
      usefulTiles
    };
  }

  /**
   * Counts matching tiles for a specific requirement
   * @param tileCounts - Map of tile counts
   * @param requirement - The requirement to check
   * @returns Number of matching tiles
   */
  private countMatchingTiles(
    tileCounts: Map<string, number>,
    requirement: TileRequirement
  ): number {
    const { type, specific, values, sequence } = requirement;

    if (sequence) {
      return this.countSequenceTiles(tileCounts, requirement);
    }

    let count = 0;
    const valueList = specific || values || [];

    if (type === 'any') {
      // Count all non-joker tiles
      for (const [key, tileCount] of tileCounts) {
        if (!key.startsWith('joker-')) {
          count += tileCount;
        }
      }
    } else if (type === 'same_suit') {
      // Count tiles from any single suit
      const suitCounts = [TileType.BAMBOO, TileType.CHARACTER, TileType.DOT].map(suitType =>
        this.countTilesOfType(tileCounts, suitType, valueList)
      );
      count = Math.max(...suitCounts);
    } else {
      // Count tiles of specific type
      count = this.countTilesOfType(tileCounts, type as TileType, valueList);
    }

    return Math.min(count, requirement.count);
  }

  /**
   * Counts tiles for sequence requirements
   * @param tileCounts - Map of tile counts
   * @param requirement - The sequence requirement
   * @returns Number of tiles that contribute to the sequence
   */
  private countSequenceTiles(
    tileCounts: Map<string, number>,
    requirement: TileRequirement
  ): number {
    const { type, values } = requirement;

    if (!values || values.length === 0) {
      return 0;
    }

    if (type === 'same_suit') {
      // Find the suit with the most sequence tiles
      const suitCounts = [TileType.BAMBOO, TileType.CHARACTER, TileType.DOT].map(suitType => {
        let count = 0;
        for (const value of values) {
          const key = this.getTileKey({ type: suitType, value } as Tile);
          count += tileCounts.get(key) || 0;
        }
        return count;
      });
      return Math.max(...suitCounts);
    }

    // Count tiles for specific type sequence
    let count = 0;
    for (const value of values) {
      const key = this.getTileKey({ type: type as TileType, value } as Tile);
      count += tileCounts.get(key) || 0;
    }

    return count;
  }

  /**
   * Counts tiles of a specific type
   * @param tileCounts - Map of tile counts
   * @param tileType - The type to count
   * @param values - Optional specific values to count
   * @returns Count of matching tiles
   */
  private countTilesOfType(
    tileCounts: Map<string, number>,
    tileType: TileType,
    values?: (number | string)[]
  ): number {
    let count = 0;

    if (values && values.length > 0) {
      for (const value of values) {
        const key = this.getTileKey({ type: tileType, value } as Tile);
        count += tileCounts.get(key) || 0;
      }
    } else {
      // Count all tiles of this type
      for (const [key, tileCount] of tileCounts) {
        if (key.startsWith(`${tileType}-`)) {
          count += tileCount;
        }
      }
    }

    return count;
  }

  /**
   * Adds useful tiles for a requirement to the set
   * @param usefulTiles - Set to add useful tile keys to
   * @param requirement - The requirement
   */
  private addUsefulTiles(
    usefulTiles: Set<string>,
    requirement: TileRequirement
  ): void {
    const { type, specific, values } = requirement;
    const valueList = specific || values || [];

    if (type === 'any') {
      // All tiles are potentially useful
      return;
    }

    if (type === 'same_suit') {
      // Add all suited tiles with the required values
      for (const suitType of [TileType.BAMBOO, TileType.CHARACTER, TileType.DOT]) {
        for (const value of valueList) {
          usefulTiles.add(`${suitType}-${value}`);
        }
      }
    } else {
      // Add tiles of specific type and values
      for (const value of valueList) {
        usefulTiles.add(`${type}-${value}`);
      }
    }
  }

  /**
   * Evaluates the usefulness of each tile in the hand
   * @param hand - The player's concealed tiles
   * @param exposedSets - The player's exposed tile sets
   * @returns Array of tile usefulness evaluations sorted by score (descending)
   */
  evaluateTileUsefulness(hand: Tile[], exposedSets: TileSet[]): TileUsefulness[] {
    const handEvaluations = this.evaluateHand(hand, exposedSets);
    const tileScores = new Map<string, TileUsefulness>();

    // Evaluate each tile
    for (const tile of hand) {
      if (tile.type === TileType.JOKER) {
        // Jokers are always highly useful
        tileScores.set(tile.id, {
          tile,
          score: 100,
          patternCount: handEvaluations.length,
          isCritical: true
        });
        continue;
      }

      const tileKey = this.getTileKey(tile);
      let score = 0;
      let patternCount = 0;
      let isCritical = false;

      // Check how many patterns this tile contributes to
      for (const evaluation of handEvaluations) {
        if (evaluation.usefulTiles.has(tileKey)) {
          patternCount++;
          
          // Weight by proximity to completion
          const weight = evaluation.proximityScore / 100;
          score += weight * 10;

          // Mark as critical if it's needed for a near-complete pattern
          if (evaluation.tilesNeeded <= 2) {
            isCritical = true;
            score += 20;
          }
        }
      }

      tileScores.set(tile.id, {
        tile,
        score,
        patternCount,
        isCritical
      });
    }

    // Convert to array and sort by score (descending)
    const results = Array.from(tileScores.values());
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * Finds the best tile to discard from the hand
   * @param hand - The player's concealed tiles
   * @param exposedSets - The player's exposed tile sets
   * @returns The tile that should be discarded (least useful)
   */
  findBestDiscard(hand: Tile[], exposedSets: TileSet[]): Tile {
    const usefulness = this.evaluateTileUsefulness(hand, exposedSets);
    
    // Return the least useful tile (last in sorted array)
    if (usefulness.length === 0) {
      return hand[0]; // Fallback
    }

    return usefulness[usefulness.length - 1].tile;
  }

  /**
   * Counts tiles by type and value
   * @param tiles - Array of tiles to count
   * @returns Map of tile keys to counts
   */
  private countTiles(tiles: Tile[]): Map<string, number> {
    const counts = new Map<string, number>();

    for (const tile of tiles) {
      const key = this.getTileKey(tile);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return counts;
  }

  /**
   * Generates a unique key for a tile based on type and value
   * @param tile - The tile
   * @returns Unique key string
   */
  private getTileKey(tile: Tile): string {
    return `${tile.type}-${tile.value}`;
  }

  /**
   * Updates the card configuration
   * @param cardConfig - New card configuration
   */
  updateCardConfig(cardConfig: CardConfig): void {
    this.cardConfig = cardConfig;
  }
}
