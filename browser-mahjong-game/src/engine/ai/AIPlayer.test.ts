import { describe, it, expect, beforeEach } from 'vitest';
import { AIPlayer } from './AIPlayer';
import { Difficulty } from './Strategy';
import { TileClass, TileType } from '../tiles/Tile';
import { CallType } from '../validation/RuleEngine';
import type { CardConfig } from '../../config/CardTypes';

describe('AIPlayer', () => {
  let aiPlayer: AIPlayer;
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

    aiPlayer = new AIPlayer(1, mockCardConfig, Difficulty.MEDIUM);
  });

  describe('constructor', () => {
    it('should create AI player with correct properties', () => {
      expect(aiPlayer.getPlayerId()).toBe(1);
      expect(aiPlayer.getDifficulty()).toBe(Difficulty.MEDIUM);
    });

    it('should default to MEDIUM difficulty', () => {
      const defaultAI = new AIPlayer(0, mockCardConfig);
      expect(defaultAI.getDifficulty()).toBe(Difficulty.MEDIUM);
    });
  });

  describe('selectDiscard', () => {
    it('should select a tile to discard', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.WIND, 'N')
      ];

      const discard = aiPlayer.selectDiscard(hand, []);

      expect(discard).toBeDefined();
      expect(hand.some(t => t.id === discard.id)).toBe(true);
    });

    it('should complete within reasonable time', () => {
      const hand = Array(13).fill(null).map((_, i) => 
        new TileClass(TileType.BAMBOO, (i % 9) + 1)
      );

      const startTime = Date.now();
      aiPlayer.selectDiscard(hand, []);
      const elapsedTime = Date.now() - startTime;

      expect(elapsedTime).toBeLessThan(2000);
    });

    it('should handle errors gracefully', () => {
      const hand = [new TileClass(TileType.BAMBOO, 1)];

      const discard = aiPlayer.selectDiscard(hand, []);

      expect(discard).toBeDefined();
    });
  });

  describe('evaluateCall', () => {
    it('should evaluate mahjong call opportunity', () => {
      const hand = Array(13).fill(null).map(() => new TileClass(TileType.BAMBOO, 1));
      const opportunity = {
        playerId: 1,
        callType: CallType.MAHJONG,
        tile: new TileClass(TileType.BAMBOO, 1)
      };

      const decision = aiPlayer.evaluateCall(opportunity, hand, []);

      expect(decision).toBeDefined();
      expect(decision.shouldCall).toBeDefined();
      expect(decision.reason).toBeDefined();
    });

    it('should evaluate pung call opportunity', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      const opportunity = {
        playerId: 1,
        callType: CallType.PUNG,
        tile: new TileClass(TileType.BAMBOO, 5)
      };

      const decision = aiPlayer.evaluateCall(opportunity, hand, []);

      expect(decision).toBeDefined();
      expect(decision.shouldCall).toBeDefined();
    });

    it('should complete within reasonable time', () => {
      const hand = Array(13).fill(null).map(() => new TileClass(TileType.BAMBOO, 1));
      const opportunity = {
        playerId: 1,
        callType: CallType.MAHJONG,
        tile: new TileClass(TileType.BAMBOO, 1)
      };

      const startTime = Date.now();
      aiPlayer.evaluateCall(opportunity, hand, []);
      const elapsedTime = Date.now() - startTime;

      expect(elapsedTime).toBeLessThan(2000);
    });

    it('should handle errors gracefully', () => {
      const hand = [new TileClass(TileType.BAMBOO, 1)];
      const opportunity = {
        playerId: 1,
        callType: CallType.PUNG,
        tile: new TileClass(TileType.BAMBOO, 1)
      };

      const decision = aiPlayer.evaluateCall(opportunity, hand, []);

      // Should return a decision (may be true or false depending on evaluation)
      expect(decision).toBeDefined();
      expect(typeof decision.shouldCall).toBe('boolean');
    });
  });

  describe('selectTargetPattern', () => {
    it('should select a target pattern', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1)
      ];

      const target = aiPlayer.selectTargetPattern(hand, []);

      expect(target).toBeDefined();
    });

    it('should handle errors gracefully', () => {
      const hand = [new TileClass(TileType.WIND, 'N')];

      const target = aiPlayer.selectTargetPattern(hand, []);

      // Should not throw, may return null
      expect(target === null || target !== undefined).toBe(true);
    });
  });

  describe('evaluateHand', () => {
    it('should evaluate hand proximity to patterns', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 1)
      ];

      const evaluations = aiPlayer.evaluateHand(hand, []);

      expect(Array.isArray(evaluations)).toBe(true);
      expect(evaluations.length).toBeGreaterThan(0);
    });
  });

  describe('difficulty management', () => {
    it('should get player ID', () => {
      expect(aiPlayer.getPlayerId()).toBe(1);
    });

    it('should get difficulty', () => {
      expect(aiPlayer.getDifficulty()).toBe(Difficulty.MEDIUM);
    });

    it('should set difficulty', () => {
      aiPlayer.setDifficulty(Difficulty.HARD);
      expect(aiPlayer.getDifficulty()).toBe(Difficulty.HARD);
    });
  });

  describe('updateCardConfig', () => {
    it('should update card configuration', () => {
      const newConfig: CardConfig = {
        year: 2025,
        version: '2.0',
        patterns: []
      };

      aiPlayer.updateCardConfig(newConfig);

      const evaluations = aiPlayer.evaluateHand([], []);
      expect(evaluations.length).toBe(0);
    });
  });

  describe('async methods', () => {
    it('should make turn decision with thinking time', async () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2)
      ];

      const startTime = Date.now();
      const discard = await aiPlayer.makeTurnDecision(hand, []);
      const elapsedTime = Date.now() - startTime;

      expect(discard).toBeDefined();
      expect(elapsedTime).toBeGreaterThanOrEqual(500); // Min thinking time
    });

    it('should make call decision with thinking time', async () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      const opportunity = {
        playerId: 1,
        callType: CallType.PUNG,
        tile: new TileClass(TileType.BAMBOO, 5)
      };

      const startTime = Date.now();
      const decision = await aiPlayer.makeCallDecision(opportunity, hand, []);
      const elapsedTime = Date.now() - startTime;

      expect(decision).toBeDefined();
      expect(elapsedTime).toBeGreaterThanOrEqual(200); // Min thinking time for calls
    });
  });
});
