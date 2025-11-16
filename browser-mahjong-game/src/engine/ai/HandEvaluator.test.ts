import { describe, it, expect, beforeEach } from 'vitest';
import { HandEvaluator } from './HandEvaluator';
import { TileClass, TileType } from '../tiles/Tile';
import type { CardConfig } from '../../config/CardTypes';

describe('HandEvaluator', () => {
  let evaluator: HandEvaluator;
  let mockCardConfig: CardConfig;

  beforeEach(() => {
    mockCardConfig = {
      year: 2024,
      version: '1.0',
      patterns: [
        {
          id: 'simple_pattern',
          name: 'Simple Pattern',
          category: 'Test',
          points: 25,
          tiles: [
            {
              type: TileType.BAMBOO,
              count: 4,
              specific: [1],
              jokerAllowed: true
            },
            {
              type: TileType.BAMBOO,
              count: 4,
              specific: [2],
              jokerAllowed: true
            },
            {
              type: TileType.BAMBOO,
              count: 4,
              specific: [3],
              jokerAllowed: true
            },
            {
              type: TileType.BAMBOO,
              count: 2,
              specific: [4],
              jokerAllowed: true
            }
          ]
        },
        {
          id: 'dragon_pattern',
          name: 'Dragon Pattern',
          category: 'Test',
          points: 30,
          tiles: [
            {
              type: TileType.DRAGON,
              count: 14,
              specific: ['Red'],
              jokerAllowed: false
            }
          ]
        }
      ]
    };

    evaluator = new HandEvaluator(mockCardConfig);
  });

  describe('evaluateHand', () => {
    it('should evaluate hand proximity to patterns', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 2)
      ];

      const evaluations = evaluator.evaluateHand(hand, []);

      expect(evaluations.length).toBe(2);
      expect(evaluations[0].pattern).toBeDefined();
      expect(evaluations[0].tilesNeeded).toBeGreaterThanOrEqual(0);
      expect(evaluations[0].proximityScore).toBeGreaterThanOrEqual(0);
    });

    it('should sort patterns by proximity', () => {
      const hand = [
        // 4 Bamboo 1s
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        // 3 Bamboo 2s
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 2)
      ];

      const evaluations = evaluator.evaluateHand(hand, []);

      // First evaluation should be the closest to completion
      expect(evaluations[0].tilesNeeded).toBeLessThanOrEqual(evaluations[1].tilesNeeded);
    });

    it('should identify useful tiles for patterns', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2)
      ];

      const evaluations = evaluator.evaluateHand(hand, []);

      expect(evaluations[0].usefulTiles.size).toBeGreaterThan(0);
    });
  });

  describe('evaluateTileUsefulness', () => {
    it('should evaluate usefulness of each tile', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 3),
        new TileClass(TileType.WIND, 'N')
      ];

      const usefulness = evaluator.evaluateTileUsefulness(hand, []);

      expect(usefulness.length).toBe(4);
      expect(usefulness[0].tile).toBeDefined();
      expect(usefulness[0].score).toBeGreaterThanOrEqual(0);
      expect(usefulness[0].patternCount).toBeGreaterThanOrEqual(0);
    });

    it('should rank jokers as highly useful', () => {
      const hand = [
        new TileClass(TileType.JOKER, 'Joker'),
        new TileClass(TileType.WIND, 'N')
      ];

      const usefulness = evaluator.evaluateTileUsefulness(hand, []);

      // Joker should be ranked higher
      expect(usefulness[0].tile.type).toBe(TileType.JOKER);
      expect(usefulness[0].score).toBe(100);
      expect(usefulness[0].isCritical).toBe(true);
    });

    it('should sort tiles by usefulness score', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.WIND, 'N'),
        new TileClass(TileType.WIND, 'E')
      ];

      const usefulness = evaluator.evaluateTileUsefulness(hand, []);

      // Scores should be in descending order
      for (let i = 1; i < usefulness.length; i++) {
        expect(usefulness[i - 1].score).toBeGreaterThanOrEqual(usefulness[i].score);
      }
    });
  });

  describe('findBestDiscard', () => {
    it('should return the least useful tile', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.WIND, 'N')
      ];

      const discard = evaluator.findBestDiscard(hand, []);

      expect(discard).toBeDefined();
      expect(hand.some(t => t.id === discard.id)).toBe(true);
    });

    it('should not discard jokers when other tiles available', () => {
      const hand = [
        new TileClass(TileType.JOKER, 'Joker'),
        new TileClass(TileType.WIND, 'N')
      ];

      const discard = evaluator.findBestDiscard(hand, []);

      // Should discard the Wind tile, not the joker
      expect(discard.type).toBe(TileType.WIND);
    });

    it('should handle empty hand gracefully', () => {
      const hand = [new TileClass(TileType.BAMBOO, 1)];

      const discard = evaluator.findBestDiscard(hand, []);

      expect(discard).toBeDefined();
    });
  });

  describe('updateCardConfig', () => {
    it('should update the card configuration', () => {
      const newConfig: CardConfig = {
        year: 2025,
        version: '2.0',
        patterns: []
      };

      evaluator.updateCardConfig(newConfig);

      const evaluations = evaluator.evaluateHand([], []);
      expect(evaluations.length).toBe(0);
    });
  });
});
