import type { Tile, TileSet } from '../tiles/Tile';
import type { CardConfig } from '../../config/CardTypes';
import { Strategy, Difficulty, type CallDecision } from './Strategy';
import { HandEvaluator, type HandEvaluation } from './HandEvaluator';
import type { CallOpportunity } from '../validation/RuleEngine';

/**
 * AIPlayer represents a computer-controlled player
 * Makes decisions on tile discards and calls using strategy and hand evaluation
 */
export class AIPlayer {
  private playerId: number;
  private strategy: Strategy;
  private handEvaluator: HandEvaluator;
  private difficulty: Difficulty;

  /**
   * Creates a new AIPlayer instance
   * @param playerId - The player's ID (0-3)
   * @param cardConfig - The card configuration with valid patterns
   * @param difficulty - AI difficulty level (default: MEDIUM)
   */
  constructor(
    playerId: number,
    cardConfig: CardConfig,
    difficulty: Difficulty = Difficulty.MEDIUM
  ) {
    this.playerId = playerId;
    this.difficulty = difficulty;
    this.strategy = new Strategy(cardConfig, difficulty);
    this.handEvaluator = new HandEvaluator(cardConfig);
  }

  /**
   * Selects a tile to discard from the hand
   * Ensures decision completes within 2 seconds
   * @param hand - The player's concealed tiles
   * @param exposedSets - The player's exposed tile sets
   * @returns The tile to discard
   */
  selectDiscard(hand: Tile[], exposedSets: TileSet[]): Tile {
    const startTime = Date.now();

    try {
      // Use strategy to select the best discard
      const discard = this.strategy.selectDiscard(hand, exposedSets);

      // Log decision time for monitoring
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > 2000) {
        console.warn(`AI Player ${this.playerId} took ${elapsedTime}ms to select discard`);
      }

      return discard;
    } catch (error) {
      // Fallback: return first tile if strategy fails
      console.error(`AI Player ${this.playerId} error in selectDiscard:`, error);
      return hand[0];
    }
  }

  /**
   * Evaluates whether to make a call on a discarded tile
   * Ensures decision completes within 2 seconds
   * @param opportunity - The call opportunity
   * @param hand - The player's current hand
   * @param exposedSets - The player's exposed tile sets
   * @returns Decision on whether to make the call
   */
  evaluateCall(
    opportunity: CallOpportunity,
    hand: Tile[],
    exposedSets: TileSet[]
  ): CallDecision {
    const startTime = Date.now();

    try {
      // Use strategy to decide on the call
      const decision = this.strategy.decideCall(opportunity, hand, exposedSets);

      // Log decision time for monitoring
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > 2000) {
        console.warn(`AI Player ${this.playerId} took ${elapsedTime}ms to evaluate call`);
      }

      return decision;
    } catch (error) {
      // Fallback: don't make the call if evaluation fails
      console.error(`AI Player ${this.playerId} error in evaluateCall:`, error);
      return {
        shouldCall: false,
        reason: 'Error during call evaluation'
      };
    }
  }

  /**
   * Selects the target pattern to pursue
   * @param hand - The player's hand
   * @param exposedSets - The player's exposed sets
   * @returns The best pattern to pursue, or null if none available
   */
  selectTargetPattern(hand: Tile[], exposedSets: TileSet[]): HandEvaluation | null {
    try {
      return this.strategy.selectTargetPattern(hand, exposedSets);
    } catch (error) {
      console.error(`AI Player ${this.playerId} error in selectTargetPattern:`, error);
      return null;
    }
  }

  /**
   * Evaluates the current hand's proximity to winning
   * @param hand - The player's hand
   * @param exposedSets - The player's exposed sets
   * @returns Array of hand evaluations sorted by proximity
   */
  evaluateHand(hand: Tile[], exposedSets: TileSet[]): HandEvaluation[] {
    return this.handEvaluator.evaluateHand(hand, exposedSets);
  }

  /**
   * Gets the player's ID
   * @returns Player ID
   */
  getPlayerId(): number {
    return this.playerId;
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
    this.strategy.setDifficulty(difficulty);
  }

  /**
   * Updates the card configuration
   * @param cardConfig - New card configuration
   */
  updateCardConfig(cardConfig: CardConfig): void {
    this.strategy.updateCardConfig(cardConfig);
    this.handEvaluator.updateCardConfig(cardConfig);
  }

  /**
   * Simulates thinking time for more realistic gameplay
   * Returns a promise that resolves after a brief delay
   * @param minMs - Minimum delay in milliseconds (default: 500)
   * @param maxMs - Maximum delay in milliseconds (default: 1500)
   * @returns Promise that resolves after the delay
   */
  async simulateThinkingTime(minMs: number = 500, maxMs: number = 1500): Promise<void> {
    const delay = minMs + Math.random() * (maxMs - minMs);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Makes a complete turn decision (draw and discard)
   * This is a convenience method that combines evaluation and selection
   * @param hand - The player's hand after drawing
   * @param exposedSets - The player's exposed sets
   * @returns The tile to discard
   */
  async makeTurnDecision(hand: Tile[], exposedSets: TileSet[]): Promise<Tile> {
    // Simulate thinking time for realism
    await this.simulateThinkingTime();

    // Select and return the discard
    return this.selectDiscard(hand, exposedSets);
  }

  /**
   * Makes a call decision with simulated thinking time
   * @param opportunity - The call opportunity
   * @param hand - The player's hand
   * @param exposedSets - The player's exposed sets
   * @returns Promise resolving to the call decision
   */
  async makeCallDecision(
    opportunity: CallOpportunity,
    hand: Tile[],
    exposedSets: TileSet[]
  ): Promise<CallDecision> {
    // Shorter thinking time for calls (more reactive)
    await this.simulateThinkingTime(200, 800);

    // Evaluate and return the decision
    return this.evaluateCall(opportunity, hand, exposedSets);
  }
}
