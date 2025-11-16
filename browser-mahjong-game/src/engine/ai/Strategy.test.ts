import { describe, it, expect, beforeEach } from 'vitest';
import { Strategy, Difficulty } from './Strategy';
import { TileClass, TileType } from '../tiles/Tile';
import { CallType } from '../validation/RuleEngine';
import type { CardConfig } from '../../config/CardTypes';

describe('Strategy', () => {
  let strategy: Strategy;
  let mockCardConfig: CardConfig;

  beforeEach(() => {
    mockCardConfig = {
      year: 2024,
      version: '1.0',
      patterns: [
        {
          id: 'test_pattern',
          name: 'Test Pattern',
          category: 'Test',
          points: 25,
          tiles: [
            {
              type: TileType.BAMBOO,
              count: 14,
              specific: [1],
              jokerAllowed: true
            }
          ]
        }
      ]
    };

    strategy = new Strategy(mockCardConfig, Difficulty.MEDIUM);
  });

  describe('selectDiscard', () => {
    it('should select a tile to discard', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.WIND, 'N')
      ];

      const discard = strategy.selectDiscard(hand, []);

      expect(discard).toBeDefined();
      expect(hand.some(t => t.id === discard.id)).toBe(true);
    });

    it('should return first tile when hand is empty', () => {
      const hand = [new TileClass(TileType.BAMBOO, 1)];

      const discard = strategy.selectDiscard(hand, []);

      expect(discard).toBe(hand[0]);
    });
  });

  describe('decideCall', () => {
    it('should decide to call mahjong on valid winning hand', () => {
      const hand = Array(13).fill(null).map(() => new TileClass(TileType.BAMBOO, 1));
      const opportunity = {
        playerId: 1,
        callType: CallType.MAHJONG,
        tile: new TileClass(TileType.BAMBOO, 1)
      };

      const decision = strategy.decideCall(opportunity, hand, []);

      expect(decision.shouldCall).toBe(true);
      expect(decision.callType).toBe(CallType.MAHJONG);
    });

    it('should not call mahjong on invalid hand', () => {
      const hand = [
        new TileClass(TileType.WIND, 'N'),
        new TileClass(TileType.WIND, 'E'),
        new TileClass(TileType.WIND, 'S')
      ];
      const opportunity = {
        playerId: 1,
        callType: CallType.MAHJONG,
        tile: new TileClass(TileType.WIND, 'W')
      };

      const decision = strategy.decideCall(opportunity, hand, []);

      expect(decision.shouldCall).toBe(false);
    });

    it('should evaluate kong calls', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      const opportunity = {
        playerId: 1,
        callType: CallType.KONG,
        tile: new TileClass(TileType.BAMBOO, 5)
      };

      const decision = strategy.decideCall(opportunity, hand, []);

      expect(decision).toBeDefined();
      expect(decision.reason).toBeDefined();
    });

    it('should evaluate pung calls', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      const opportunity = {
        playerId: 1,
        callType: CallType.PUNG,
        tile: new TileClass(TileType.BAMBOO, 5)
      };

      const decision = strategy.decideCall(opportunity, hand, []);

      expect(decision).toBeDefined();
      expect(decision.reason).toBeDefined();
    });
  });

  describe('selectTargetPattern', () => {
    it('should select the best pattern to pursue', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1)
      ];

      const target = strategy.selectTargetPattern(hand, []);

      expect(target).toBeDefined();
      expect(target?.pattern).toBeDefined();
    });

    it('should return null when no patterns available', () => {
      const emptyConfig: CardConfig = {
        year: 2024,
        version: '1.0',
        patterns: []
      };
      const emptyStrategy = new Strategy(emptyConfig);

      const hand = [new TileClass(TileType.BAMBOO, 1)];
      const target = emptyStrategy.selectTargetPattern(hand, []);

      expect(target).toBeNull();
    });
  });

  describe('difficulty levels', () => {
    it('should get current difficulty', () => {
      expect(strategy.getDifficulty()).toBe(Difficulty.MEDIUM);
    });

    it('should set difficulty', () => {
      strategy.setDifficulty(Difficulty.HARD);
      expect(strategy.getDifficulty()).toBe(Difficulty.HARD);
    });

    it('should create strategy with different difficulties', () => {
      const easyStrategy = new Strategy(mockCardConfig, Difficulty.EASY);
      const hardStrategy = new Strategy(mockCardConfig, Difficulty.HARD);

      expect(easyStrategy.getDifficulty()).toBe(Difficulty.EASY);
      expect(hardStrategy.getDifficulty()).toBe(Difficulty.HARD);
    });
  });

  describe('updateCardConfig', () => {
    it('should update the card configuration', () => {
      const newConfig: CardConfig = {
        year: 2025,
        version: '2.0',
        patterns: [
          {
            id: 'new_pattern',
            name: 'New Pattern',
            category: 'Test',
            points: 50,
            tiles: [
              {
                type: TileType.CHARACTER,
                count: 14,
                specific: [1],
                jokerAllowed: false
              }
            ]
          }
        ]
      };

      strategy.updateCardConfig(newConfig);

      const hand = Array(14).fill(null).map(() => new TileClass(TileType.CHARACTER, 1));
      const target = strategy.selectTargetPattern(hand, []);

      expect(target?.pattern.id).toBe('new_pattern');
    });
  });
});
