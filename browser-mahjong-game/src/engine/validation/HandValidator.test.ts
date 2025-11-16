import { describe, it, expect, beforeEach } from 'vitest';
import { HandValidator } from './HandValidator';
import { TileClass, TileType } from '../tiles/Tile';
import type { CardConfig, HandPattern } from '../../config/CardTypes';

describe('HandValidator', () => {
  let validator: HandValidator;
  let mockCardConfig: CardConfig;

  beforeEach(() => {
    // Create a mock card configuration with test patterns
    mockCardConfig = {
      year: 2024,
      version: '1.0',
      patterns: [
        {
          id: 'all_pungs',
          name: 'All Pungs',
          category: 'Test',
          points: 25,
          tiles: [
            {
              type: TileType.BAMBOO,
              count: 3,
              jokerAllowed: false
            },
            {
              type: TileType.BAMBOO,
              count: 3,
              jokerAllowed: false
            },
            {
              type: TileType.BAMBOO,
              count: 3,
              jokerAllowed: false
            },
            {
              type: TileType.BAMBOO,
              count: 3,
              jokerAllowed: false
            },
            {
              type: TileType.BAMBOO,
              count: 2,
              jokerAllowed: false
            }
          ]
        },
        {
          id: 'with_jokers',
          name: 'Pattern with Jokers',
          category: 'Test',
          points: 30,
          tiles: [
            {
              type: TileType.CHARACTER,
              count: 4,
              specific: [1],
              jokerAllowed: true
            },
            {
              type: TileType.CHARACTER,
              count: 4,
              specific: [2],
              jokerAllowed: true
            },
            {
              type: TileType.CHARACTER,
              count: 4,
              specific: [3],
              jokerAllowed: true
            },
            {
              type: TileType.CHARACTER,
              count: 2,
              specific: [4],
              jokerAllowed: true
            }
          ]
        },
        {
          id: 'sequence_pattern',
          name: 'Sequence Pattern',
          category: 'Test',
          points: 35,
          tiles: [
            {
              type: 'same_suit',
              count: 9,
              sequence: true,
              values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
              jokerAllowed: true
            },
            {
              type: TileType.DRAGON,
              count: 5,
              specific: ['Red'],
              jokerAllowed: false
            }
          ]
        }
      ]
    };

    validator = new HandValidator(mockCardConfig);
  });

  describe('validateHand', () => {
    it('should validate a correct hand with 14 tiles', () => {
      const hand = [
        // 3 Bamboo 1s
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        // 3 Bamboo 2s
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 2),
        // 3 Bamboo 3s
        new TileClass(TileType.BAMBOO, 3),
        new TileClass(TileType.BAMBOO, 3),
        new TileClass(TileType.BAMBOO, 3),
        // 3 Bamboo 4s
        new TileClass(TileType.BAMBOO, 4),
        new TileClass(TileType.BAMBOO, 4),
        new TileClass(TileType.BAMBOO, 4),
        // 2 Bamboo 5s
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];

      const result = validator.validateHand(hand, []);

      expect(result.isValid).toBe(true);
      expect(result.matchedPattern?.id).toBe('all_pungs');
      expect(result.score).toBe(25);
    });

    it('should reject hand with incorrect tile count', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1)
      ];

      const result = validator.validateHand(hand, []);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid hand size');
    });

    it('should reject hand that does not match any pattern', () => {
      const hand = [
        new TileClass(TileType.WIND, 'N'),
        new TileClass(TileType.WIND, 'E'),
        new TileClass(TileType.WIND, 'S'),
        new TileClass(TileType.WIND, 'W'),
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Green'),
        new TileClass(TileType.DRAGON, 'White'),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 3),
        new TileClass(TileType.CHARACTER, 1),
        new TileClass(TileType.CHARACTER, 2),
        new TileClass(TileType.DOT, 1),
        new TileClass(TileType.DOT, 2)
      ];

      const result = validator.validateHand(hand, []);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not match any valid pattern');
    });
  });

  describe('matchPattern with jokers', () => {
    it('should match pattern using jokers as substitutes', () => {
      const hand = [
        // 4 Character 1s (using 2 jokers)
        new TileClass(TileType.CHARACTER, 1),
        new TileClass(TileType.CHARACTER, 1),
        new TileClass(TileType.JOKER, 'Joker'),
        new TileClass(TileType.JOKER, 'Joker'),
        // 4 Character 2s (using 1 joker)
        new TileClass(TileType.CHARACTER, 2),
        new TileClass(TileType.CHARACTER, 2),
        new TileClass(TileType.CHARACTER, 2),
        new TileClass(TileType.JOKER, 'Joker'),
        // 4 Character 3s (no jokers)
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        // 2 Character 4s
        new TileClass(TileType.CHARACTER, 4),
        new TileClass(TileType.CHARACTER, 4)
      ];

      const result = validator.validateHand(hand, []);

      expect(result.isValid).toBe(true);
      expect(result.matchedPattern?.id).toBe('with_jokers');
    });

    it('should not match pattern when jokers are not allowed', () => {
      const hand = [
        // Try to use jokers for a pattern that doesn't allow them
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.JOKER, 'Joker'), // Not allowed
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 3),
        new TileClass(TileType.BAMBOO, 3),
        new TileClass(TileType.BAMBOO, 3),
        new TileClass(TileType.BAMBOO, 4),
        new TileClass(TileType.BAMBOO, 4),
        new TileClass(TileType.BAMBOO, 4),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];

      const result = validator.validateHand(hand, []);

      expect(result.isValid).toBe(false);
    });
  });

  describe('matchPattern with sequences', () => {
    it('should match sequence pattern', () => {
      const hand = [
        // Sequence 1-9 in Bamboo
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 3),
        new TileClass(TileType.BAMBOO, 4),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 6),
        new TileClass(TileType.BAMBOO, 7),
        new TileClass(TileType.BAMBOO, 8),
        new TileClass(TileType.BAMBOO, 9),
        // 5 Red Dragons
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Red')
      ];

      const result = validator.validateHand(hand, []);

      expect(result.isValid).toBe(true);
      expect(result.matchedPattern?.id).toBe('sequence_pattern');
    });

    it('should match sequence with jokers', () => {
      const hand = [
        // Sequence 1-9 in Character with jokers
        new TileClass(TileType.CHARACTER, 1),
        new TileClass(TileType.JOKER, 'Joker'), // Substitute for 2
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 4),
        new TileClass(TileType.CHARACTER, 5),
        new TileClass(TileType.CHARACTER, 6),
        new TileClass(TileType.CHARACTER, 7),
        new TileClass(TileType.CHARACTER, 8),
        new TileClass(TileType.CHARACTER, 9),
        // 5 Red Dragons
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Red'),
        new TileClass(TileType.DRAGON, 'Red')
      ];

      const result = validator.validateHand(hand, []);

      expect(result.isValid).toBe(true);
      expect(result.matchedPattern?.id).toBe('sequence_pattern');
    });
  });

  describe('calculateScore', () => {
    it('should return correct score for pattern', () => {
      const pattern: HandPattern = {
        id: 'test',
        name: 'Test Pattern',
        category: 'Test',
        points: 50,
        tiles: []
      };

      const score = validator.calculateScore(pattern);

      expect(score).toBe(50);
    });
  });

  describe('updateCardConfig', () => {
    it('should update the card configuration', () => {
      const newConfig: CardConfig = {
        year: 2025,
        version: '2.0',
        patterns: []
      };

      validator.updateCardConfig(newConfig);

      expect(validator.getCardConfig()).toBe(newConfig);
      expect(validator.getCardConfig().year).toBe(2025);
    });
  });

  describe('edge cases', () => {
    it('should handle hand with all jokers when allowed', () => {
      const allJokersConfig: CardConfig = {
        year: 2024,
        version: '1.0',
        patterns: [
          {
            id: 'all_jokers',
            name: 'All Jokers',
            category: 'Test',
            points: 100,
            tiles: [
              {
                type: 'any',
                count: 14,
                jokerAllowed: true
              }
            ]
          }
        ]
      };

      const validatorWithJokers = new HandValidator(allJokersConfig);
      
      const hand = Array(14).fill(null).map(() => new TileClass(TileType.JOKER, 'Joker'));

      const result = validatorWithJokers.validateHand(hand, []);

      expect(result.isValid).toBe(true);
    });

    it('should handle empty pattern list', () => {
      const emptyConfig: CardConfig = {
        year: 2024,
        version: '1.0',
        patterns: []
      };

      const emptyValidator = new HandValidator(emptyConfig);
      
      const hand = Array(14).fill(null).map(() => new TileClass(TileType.BAMBOO, 1));

      const result = emptyValidator.validateHand(hand, []);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not match any valid pattern');
    });
  });
});
