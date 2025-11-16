import type { Tile, TileSet } from '../tiles/Tile';
import type { CardConfig } from '../../config/CardTypes';
import { HandEvaluator, type HandEvaluation } from './HandEvaluator';
import { CallType, type CallOpportunity } from '../validation/RuleEngine';
import { HandValidator } from '../validation/HandValidator';

/**
 * Decision on whether to make a call
 */
export interface CallDecision {
  /** Whether to make the call */
  shouldCall: boolean;
  /** The type of call to make (if shouldCall is true) */
  callType?: CallType;
  /** Reasoning for the decision (for debugging) */
  reason: string;
}

/**
 * Difficulty level for AI strategy
 */
export const Difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

/**
 * Strategy class implements AI decision-making logic
 * Determines which tiles to discard and when to make calls
 */
export class Strategy {
  private handEvaluator: HandEvaluator;
  private handValidator: HandValidator;
  private difficulty: Difficulty;

  /**
   * Creates a new Strategy instance
   * @param cardConfig - The card configuration with valid patterns
   * @param difficulty - AI difficulty level (default: MEDIUM)
   */
  constructor(cardConfig: CardConfig, difficulty: Difficulty = Difficulty.MEDIUM) {
    this.handEvaluator = new HandEvaluator(cardConfig);
    this.handValidator = new HandValidator(cardConfig);
    this.difficulty = difficulty;
  }

  /**
   * Selects the best tile to discard from the hand
   * @param hand - The player's concealed tiles
   * @param exposedSets - The player's exposed tile sets
   * @returns The tile to discard
   */
  selectDiscard(hand: Tile[], exposedSets: TileSet[]): Tile {
    // Use hand evaluator to find the least useful tile
    const usefulness = this.handEvaluator.evaluateTileUsefulness(hand, exposedSets);

    if (usefulness.length === 0) {
      // Fallback: return first tile
      return hand[0];
    }

    // Apply difficulty-based randomness
    const discardIndex = this.applyDifficultyRandomness(usefulness.length);
    
    // Return the tile at the selected index (counting from least useful)
    return usefulness[usefulness.length - 1 - discardIndex].tile;
  }

  /**
   * Decides whether to make a call on a discarded tile
   * @param opportunity - The call opportunity
   * @param hand - The player's current hand
   * @param exposedSets - The player's exposed tile sets
   * @returns Decision on whether to make the call
   */
  decideCall(
    opportunity: CallOpportunity,
    hand: Tile[],
    exposedSets: TileSet[]
  ): CallDecision {
    const { callType, tile } = opportunity;

    // Always call mahjong if it results in a valid winning hand
    if (callType === CallType.MAHJONG) {
      return this.decideMahjongCall(tile, hand, exposedSets);
    }

    // Evaluate whether pung/kong calls are beneficial
    if (callType === CallType.KONG) {
      return this.decideKongCall(tile, hand, exposedSets);
    }

    if (callType === CallType.PUNG) {
      return this.decidePungCall(tile, hand, exposedSets);
    }

    return {
      shouldCall: false,
      reason: 'Unknown call type'
    };
  }

  /**
   * Decides whether to call mahjong
   * @param tile - The discarded tile
   * @param hand - The player's hand
   * @param exposedSets - The player's exposed sets
   * @returns Call decision
   */
  private decideMahjongCall(
    tile: Tile,
    hand: Tile[],
    exposedSets: TileSet[]
  ): CallDecision {
    // Validate that the hand is actually a winning hand
    const testHand = [...hand, tile];
    console.log('decideMahjongCall: Testing hand with', testHand.length, 'tiles');
    console.log('Hand tiles:', testHand.map(t => `${t.type}:${t.value}`).join(', '));
    const validation = this.handValidator.validateHand(testHand, exposedSets);
    console.log('Validation result:', validation);

    if (validation.isValid) {
      return {
        shouldCall: true,
        callType: CallType.MAHJONG,
        reason: `Valid winning hand: ${validation.matchedPattern?.name}`
      };
    }

    return {
      shouldCall: false,
      reason: 'Hand does not form a valid winning pattern'
    };
  }

  /**
   * Decides whether to call kong
   * @param tile - The discarded tile
   * @param hand - The player's hand
   * @param exposedSets - The player's exposed sets
   * @returns Call decision
   */
  private decideKongCall(
    tile: Tile,
    hand: Tile[],
    exposedSets: TileSet[]
  ): CallDecision {
    // Evaluate hand with and without the kong
    const currentEval = this.handEvaluator.evaluateHand(hand, exposedSets);
    
    // Simulate having the kong
    const simulatedHand = hand.filter(t => !(t.type === tile.type && t.value === tile.value));
    const simulatedSets = [...exposedSets, {
      type: 'kong' as const,
      tiles: [tile, tile, tile, tile]
    }];
    const kongEval = this.handEvaluator.evaluateHand(simulatedHand, simulatedSets);

    // Get best pattern evaluations
    const currentBest = currentEval[0];
    const kongBest = kongEval[0];

    // Call kong if it improves or maintains proximity to winning
    if (kongBest && currentBest) {
      const improvesPosition = kongBest.tilesNeeded <= currentBest.tilesNeeded;
      
      // For medium/hard difficulty, always call if it improves
      // For easy difficulty, add some randomness
      let shouldCall = improvesPosition;
      if (this.difficulty === Difficulty.EASY && improvesPosition) {
        shouldCall = Math.random() > 0.3; // 70% chance to call
      }

      return {
        shouldCall,
        callType: CallType.KONG,
        reason: shouldCall 
          ? `Kong improves position (${kongBest.tilesNeeded} tiles needed)`
          : `Kong does not improve position significantly`
      };
    }

    return {
      shouldCall: false,
      reason: 'Unable to evaluate kong benefit'
    };
  }

  /**
   * Decides whether to call pung
   * @param tile - The discarded tile
   * @param hand - The player's hand
   * @param exposedSets - The player's exposed sets
   * @returns Call decision
   */
  private decidePungCall(
    tile: Tile,
    hand: Tile[],
    exposedSets: TileSet[]
  ): CallDecision {
    // Evaluate hand with and without the pung
    const currentEval = this.handEvaluator.evaluateHand(hand, exposedSets);
    
    // Simulate having the pung
    const simulatedHand = hand.filter(t => !(t.type === tile.type && t.value === tile.value));
    const simulatedSets = [...exposedSets, {
      type: 'pung' as const,
      tiles: [tile, tile, tile]
    }];
    const pungEval = this.handEvaluator.evaluateHand(simulatedHand, simulatedSets);

    // Get best pattern evaluations
    const currentBest = currentEval[0];
    const pungBest = pungEval[0];

    // Call pung if it improves or maintains proximity to winning
    if (pungBest && currentBest) {
      // Call pung if it reduces tiles needed or keeps it the same (more aggressive)
      const improvesPosition = pungBest.tilesNeeded <= currentBest.tilesNeeded;
      
      // For medium/hard difficulty, always call if it improves
      // For easy difficulty, add some randomness
      let shouldCall = improvesPosition;
      if (this.difficulty === Difficulty.EASY && improvesPosition) {
        shouldCall = Math.random() > 0.3; // 70% chance to call
      }

      return {
        shouldCall,
        callType: CallType.PUNG,
        reason: shouldCall 
          ? `Pung improves position (${pungBest.tilesNeeded} tiles needed)`
          : `Pung does not improve position significantly`
      };
    }

    return {
      shouldCall: false,
      reason: 'Unable to evaluate pung benefit'
    };
  }

  /**
   * Applies difficulty-based randomness to tile selection
   * @param maxIndex - Maximum index (array length)
   * @returns Selected index
   */
  private applyDifficultyRandomness(maxIndex: number): number {
    switch (this.difficulty) {
      case Difficulty.EASY:
        // 50% chance to pick randomly from bottom 50%
        if (Math.random() < 0.5) {
          return Math.floor(Math.random() * Math.ceil(maxIndex / 2));
        }
        return 0;

      case Difficulty.MEDIUM:
        // 20% chance to make a suboptimal choice
        if (Math.random() < 0.2) {
          return Math.floor(Math.random() * Math.min(3, maxIndex));
        }
        return 0;

      case Difficulty.HARD:
        // Always pick the optimal tile
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Applies difficulty-based decision making for calls
   * @param isOptimal - Whether the call is optimal
   * @returns Whether to make the call
   */
  private applyDifficultyDecision(isOptimal: boolean): boolean {
    if (!isOptimal) {
      return false;
    }

    switch (this.difficulty) {
      case Difficulty.EASY:
        // 70% chance to make optimal call
        return Math.random() < 0.7;

      case Difficulty.MEDIUM:
        // 90% chance to make optimal call
        return Math.random() < 0.9;

      case Difficulty.HARD:
        // Always make optimal call
        return true;

      default:
        return true;
    }
  }

  /**
   * Selects the target pattern to pursue
   * @param hand - The player's hand
   * @param exposedSets - The player's exposed sets
   * @returns The best pattern to pursue
   */
  selectTargetPattern(hand: Tile[], exposedSets: TileSet[]): HandEvaluation | null {
    const evaluations = this.handEvaluator.evaluateHand(hand, exposedSets);
    
    if (evaluations.length === 0) {
      return null;
    }

    // Return the pattern closest to completion
    return evaluations[0];
  }

  /**
   * Updates the card configuration
   * @param cardConfig - New card configuration
   */
  updateCardConfig(cardConfig: CardConfig): void {
    this.handEvaluator.updateCardConfig(cardConfig);
    this.handValidator.updateCardConfig(cardConfig);
  }

  /**
   * Gets the current difficulty level
   * @returns Current difficulty
   */
  getDifficulty(): Difficulty {
    return this.difficulty;
  }

  /**
   * Sets the difficulty level
   * @param difficulty - New difficulty level
   */
  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }

  /**
   * Updates the difficulty level
   * @param difficulty - New difficulty level
   */
  updateDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }
}
