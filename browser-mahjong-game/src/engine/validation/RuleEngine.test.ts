import { describe, it, expect, beforeEach } from 'vitest';
import { RuleEngine, CallType } from './RuleEngine';
import { TileClass, TileType } from '../tiles/Tile';

describe('RuleEngine', () => {
  let ruleEngine: RuleEngine;

  beforeEach(() => {
    ruleEngine = new RuleEngine();
  });

  describe('validatePungCall', () => {
    it('should validate a valid pung call', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      const discardedTile = new TileClass(TileType.BAMBOO, 5);

      const result = ruleEngine.validatePungCall(hand, discardedTile);

      expect(result.isValid).toBe(true);
      expect(result.callType).toBe(CallType.PUNG);
    });

    it('should reject pung call with insufficient matching tiles', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 5)
      ];
      const discardedTile = new TileClass(TileType.BAMBOO, 5);

      const result = ruleEngine.validatePungCall(hand, discardedTile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Need at least 2 matching tiles');
    });

    it('should reject pung call on joker', () => {
      const hand = [
        new TileClass(TileType.JOKER, 'Joker'),
        new TileClass(TileType.JOKER, 'Joker')
      ];
      const discardedTile = new TileClass(TileType.JOKER, 'Joker');

      const result = ruleEngine.validatePungCall(hand, discardedTile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Cannot call a joker');
    });
  });

  describe('validateKongCall', () => {
    it('should validate a valid kong call', () => {
      const hand = [
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3)
      ];
      const discardedTile = new TileClass(TileType.CHARACTER, 3);

      const result = ruleEngine.validateKongCall(hand, discardedTile);

      expect(result.isValid).toBe(true);
      expect(result.callType).toBe(CallType.KONG);
    });

    it('should reject kong call with insufficient matching tiles', () => {
      const hand = [
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3)
      ];
      const discardedTile = new TileClass(TileType.CHARACTER, 3);

      const result = ruleEngine.validateKongCall(hand, discardedTile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Need at least 3 matching tiles');
    });

    it('should reject kong call on joker', () => {
      const hand = [
        new TileClass(TileType.JOKER, 'Joker'),
        new TileClass(TileType.JOKER, 'Joker'),
        new TileClass(TileType.JOKER, 'Joker')
      ];
      const discardedTile = new TileClass(TileType.JOKER, 'Joker');

      const result = ruleEngine.validateKongCall(hand, discardedTile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Cannot call a joker');
    });
  });

  describe('validateMahjongCall', () => {
    it('should validate mahjong with 13 tiles in hand and 1 discarded', () => {
      const hand = Array(13).fill(null).map(() => new TileClass(TileType.BAMBOO, 1));
      const discardedTile = new TileClass(TileType.BAMBOO, 2);

      const result = ruleEngine.validateMahjongCall(hand, discardedTile);

      expect(result.isValid).toBe(true);
      expect(result.callType).toBe(CallType.MAHJONG);
    });

    it('should validate mahjong with exactly 14 tiles in hand', () => {
      const hand = Array(14).fill(null).map(() => new TileClass(TileType.BAMBOO, 1));

      const result = ruleEngine.validateMahjongCall(hand);

      expect(result.isValid).toBe(true);
      expect(result.callType).toBe(CallType.MAHJONG);
    });

    it('should reject mahjong with incorrect tile count', () => {
      const hand = Array(12).fill(null).map(() => new TileClass(TileType.BAMBOO, 1));

      const result = ruleEngine.validateMahjongCall(hand);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid tile count');
    });
  });

  describe('getCallOpportunities', () => {
    it('should detect pung opportunity', () => {
      const discardedTile = new TileClass(TileType.BAMBOO, 5);
      const players = [
        { id: 0, hand: [] },
        { 
          id: 1, 
          hand: [
            new TileClass(TileType.BAMBOO, 5),
            new TileClass(TileType.BAMBOO, 5)
          ]
        },
        { id: 2, hand: [] },
        { id: 3, hand: [] }
      ];

      const opportunities = ruleEngine.getCallOpportunities(discardedTile, 0, players);

      expect(opportunities.length).toBe(1);
      expect(opportunities[0].playerId).toBe(1);
      expect(opportunities[0].callType).toBe(CallType.PUNG);
    });

    it('should detect kong opportunity', () => {
      const discardedTile = new TileClass(TileType.CHARACTER, 3);
      const players = [
        { id: 0, hand: [] },
        { 
          id: 1, 
          hand: [
            new TileClass(TileType.CHARACTER, 3),
            new TileClass(TileType.CHARACTER, 3),
            new TileClass(TileType.CHARACTER, 3)
          ]
        },
        { id: 2, hand: [] },
        { id: 3, hand: [] }
      ];

      const opportunities = ruleEngine.getCallOpportunities(discardedTile, 0, players);

      expect(opportunities.length).toBe(1);
      expect(opportunities[0].playerId).toBe(1);
      expect(opportunities[0].callType).toBe(CallType.KONG);
    });

    it('should prioritize mahjong over other calls', () => {
      const discardedTile = new TileClass(TileType.BAMBOO, 5);
      const players = [
        { id: 0, hand: [] },
        { 
          id: 1, 
          hand: Array(13).fill(null).map(() => new TileClass(TileType.BAMBOO, 1))
        },
        { id: 2, hand: [] },
        { id: 3, hand: [] }
      ];

      const opportunities = ruleEngine.getCallOpportunities(discardedTile, 0, players);

      expect(opportunities.length).toBe(1);
      expect(opportunities[0].callType).toBe(CallType.MAHJONG);
    });

    it('should not allow player to call their own discard', () => {
      const discardedTile = new TileClass(TileType.BAMBOO, 5);
      const players = [
        { 
          id: 0, 
          hand: [
            new TileClass(TileType.BAMBOO, 5),
            new TileClass(TileType.BAMBOO, 5)
          ]
        },
        { id: 1, hand: [] },
        { id: 2, hand: [] },
        { id: 3, hand: [] }
      ];

      const opportunities = ruleEngine.getCallOpportunities(discardedTile, 0, players);

      expect(opportunities.length).toBe(0);
    });
  });

  describe('getNextPlayer', () => {
    it('should return next player in sequence', () => {
      expect(ruleEngine.getNextPlayer(0)).toBe(1);
      expect(ruleEngine.getNextPlayer(1)).toBe(2);
      expect(ruleEngine.getNextPlayer(2)).toBe(3);
    });

    it('should wrap around to player 0', () => {
      expect(ruleEngine.getNextPlayer(3)).toBe(0);
    });
  });

  describe('isPlayerTurn', () => {
    it('should return true when it is the player\'s turn', () => {
      expect(ruleEngine.isPlayerTurn(2, 2)).toBe(true);
    });

    it('should return false when it is not the player\'s turn', () => {
      expect(ruleEngine.isPlayerTurn(1, 2)).toBe(false);
    });
  });

  describe('processCall', () => {
    it('should process pung call and create tile set', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 6)
      ];
      const discardedTile = new TileClass(TileType.BAMBOO, 5);

      const tileSet = ruleEngine.processCall(hand, discardedTile, CallType.PUNG);

      expect(tileSet.tiles.length).toBe(3);
      expect(hand.length).toBe(1); // Only Bamboo 6 should remain
      expect(hand[0].value).toBe(6);
    });

    it('should process kong call and create tile set', () => {
      const hand = [
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 4)
      ];
      const discardedTile = new TileClass(TileType.CHARACTER, 3);

      const tileSet = ruleEngine.processCall(hand, discardedTile, CallType.KONG);

      expect(tileSet.tiles.length).toBe(4);
      expect(hand.length).toBe(1); // Only Character 4 should remain
      expect(hand[0].value).toBe(4);
    });

    it('should throw error for insufficient tiles', () => {
      const hand = [
        new TileClass(TileType.BAMBOO, 5)
      ];
      const discardedTile = new TileClass(TileType.BAMBOO, 5);

      expect(() => {
        ruleEngine.processCall(hand, discardedTile, CallType.PUNG);
      }).toThrow('Insufficient matching tiles');
    });
  });

  describe('validateDiscard', () => {
    it('should validate discard of tile in hand', () => {
      const tile = new TileClass(TileType.BAMBOO, 5);
      const hand = [tile, new TileClass(TileType.BAMBOO, 6)];

      const result = ruleEngine.validateDiscard(tile, hand);

      expect(result).toBe(true);
    });

    it('should reject discard of tile not in hand', () => {
      const tile = new TileClass(TileType.BAMBOO, 5);
      const hand = [new TileClass(TileType.BAMBOO, 6)];

      const result = ruleEngine.validateDiscard(tile, hand);

      expect(result).toBe(false);
    });
  });

  describe('resolveCallPriority', () => {
    it('should prioritize mahjong over kong', () => {
      const opportunities = [
        { playerId: 1, callType: CallType.KONG, tile: new TileClass(TileType.BAMBOO, 5) },
        { playerId: 2, callType: CallType.MAHJONG, tile: new TileClass(TileType.BAMBOO, 5) }
      ];

      const winner = ruleEngine.resolveCallPriority(opportunities, 0);

      expect(winner?.playerId).toBe(2);
      expect(winner?.callType).toBe(CallType.MAHJONG);
    });

    it('should prioritize kong over pung', () => {
      const opportunities = [
        { playerId: 1, callType: CallType.PUNG, tile: new TileClass(TileType.BAMBOO, 5) },
        { playerId: 2, callType: CallType.KONG, tile: new TileClass(TileType.BAMBOO, 5) }
      ];

      const winner = ruleEngine.resolveCallPriority(opportunities, 0);

      expect(winner?.playerId).toBe(2);
      expect(winner?.callType).toBe(CallType.KONG);
    });

    it('should choose closest player when same priority', () => {
      const opportunities = [
        { playerId: 3, callType: CallType.PUNG, tile: new TileClass(TileType.BAMBOO, 5) },
        { playerId: 1, callType: CallType.PUNG, tile: new TileClass(TileType.BAMBOO, 5) }
      ];

      const winner = ruleEngine.resolveCallPriority(opportunities, 0);

      expect(winner?.playerId).toBe(1); // Player 1 is closer in turn order
    });

    it('should return null for empty opportunities', () => {
      const winner = ruleEngine.resolveCallPriority([], 0);

      expect(winner).toBeNull();
    });
  });

  describe('canContinueGame', () => {
    it('should return true when tiles remain', () => {
      expect(ruleEngine.canContinueGame(50)).toBe(true);
    });

    it('should return false when wall is exhausted', () => {
      expect(ruleEngine.canContinueGame(0)).toBe(false);
    });
  });
});
