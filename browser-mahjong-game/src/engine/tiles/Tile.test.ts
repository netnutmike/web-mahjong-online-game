import { describe, it, expect } from 'vitest';
import { TileClass, TileType, SerializedTile } from './Tile';

describe('TileClass', () => {
  describe('constructor', () => {
    it('should create a tile with correct properties', () => {
      const tile = new TileClass(TileType.BAMBOO, 5);
      
      expect(tile.type).toBe(TileType.BAMBOO);
      expect(tile.value).toBe(5);
      expect(tile.isExposed).toBe(false);
      expect(tile.id).toBeDefined();
    });

    it('should create an exposed tile when specified', () => {
      const tile = new TileClass(TileType.CHARACTER, 3, true);
      
      expect(tile.isExposed).toBe(true);
    });

    it('should accept custom ID', () => {
      const customId = 'custom-id-123';
      const tile = new TileClass(TileType.DOT, 7, false, customId);
      
      expect(tile.id).toBe(customId);
    });
  });

  describe('equals', () => {
    it('should return true for tiles with same type and value', () => {
      const tile1 = new TileClass(TileType.BAMBOO, 5);
      const tile2 = new TileClass(TileType.BAMBOO, 5);
      
      expect(tile1.equals(tile2)).toBe(true);
    });

    it('should return false for tiles with different types', () => {
      const tile1 = new TileClass(TileType.BAMBOO, 5);
      const tile2 = new TileClass(TileType.CHARACTER, 5);
      
      expect(tile1.equals(tile2)).toBe(false);
    });

    it('should return false for tiles with different values', () => {
      const tile1 = new TileClass(TileType.BAMBOO, 5);
      const tile2 = new TileClass(TileType.BAMBOO, 6);
      
      expect(tile1.equals(tile2)).toBe(false);
    });

    it('should ignore exposure status in comparison', () => {
      const tile1 = new TileClass(TileType.BAMBOO, 5, false);
      const tile2 = new TileClass(TileType.BAMBOO, 5, true);
      
      expect(tile1.equals(tile2)).toBe(true);
    });
  });

  describe('exactMatch', () => {
    it('should return true for tiles with same type, value, and exposure', () => {
      const tile1 = new TileClass(TileType.BAMBOO, 5, true);
      const tile2 = new TileClass(TileType.BAMBOO, 5, true);
      
      expect(tile1.exactMatch(tile2)).toBe(true);
    });

    it('should return false for tiles with different exposure status', () => {
      const tile1 = new TileClass(TileType.BAMBOO, 5, false);
      const tile2 = new TileClass(TileType.BAMBOO, 5, true);
      
      expect(tile1.exactMatch(tile2)).toBe(false);
    });
  });

  describe('isJoker', () => {
    it('should return true for joker tiles', () => {
      const tile = new TileClass(TileType.JOKER, 'Joker');
      
      expect(tile.isJoker()).toBe(true);
    });

    it('should return false for non-joker tiles', () => {
      const tile = new TileClass(TileType.BAMBOO, 5);
      
      expect(tile.isJoker()).toBe(false);
    });
  });

  describe('isSuited', () => {
    it('should return true for bamboo tiles', () => {
      const tile = new TileClass(TileType.BAMBOO, 5);
      expect(tile.isSuited()).toBe(true);
    });

    it('should return true for character tiles', () => {
      const tile = new TileClass(TileType.CHARACTER, 5);
      expect(tile.isSuited()).toBe(true);
    });

    it('should return true for dot tiles', () => {
      const tile = new TileClass(TileType.DOT, 5);
      expect(tile.isSuited()).toBe(true);
    });

    it('should return false for wind tiles', () => {
      const tile = new TileClass(TileType.WIND, 'N');
      expect(tile.isSuited()).toBe(false);
    });

    it('should return false for dragon tiles', () => {
      const tile = new TileClass(TileType.DRAGON, 'Red');
      expect(tile.isSuited()).toBe(false);
    });
  });

  describe('isHonor', () => {
    it('should return true for wind tiles', () => {
      const tile = new TileClass(TileType.WIND, 'N');
      expect(tile.isHonor()).toBe(true);
    });

    it('should return true for dragon tiles', () => {
      const tile = new TileClass(TileType.DRAGON, 'Red');
      expect(tile.isHonor()).toBe(true);
    });

    it('should return true for flower tiles', () => {
      const tile = new TileClass(TileType.FLOWER, 'Plum');
      expect(tile.isHonor()).toBe(true);
    });

    it('should return false for suited tiles', () => {
      const tile = new TileClass(TileType.BAMBOO, 5);
      expect(tile.isHonor()).toBe(false);
    });
  });

  describe('canFormSequence', () => {
    it('should return true for suited tiles with numeric values', () => {
      const tile = new TileClass(TileType.BAMBOO, 5);
      expect(tile.canFormSequence()).toBe(true);
    });

    it('should return false for honor tiles', () => {
      const tile = new TileClass(TileType.WIND, 'N');
      expect(tile.canFormSequence()).toBe(false);
    });

    it('should return false for joker tiles', () => {
      const tile = new TileClass(TileType.JOKER, 'Joker');
      expect(tile.canFormSequence()).toBe(false);
    });
  });

  describe('getNumericValue', () => {
    it('should return numeric value for suited tiles', () => {
      const tile = new TileClass(TileType.BAMBOO, 5);
      expect(tile.getNumericValue()).toBe(5);
    });

    it('should return null for honor tiles', () => {
      const tile = new TileClass(TileType.WIND, 'N');
      expect(tile.getNumericValue()).toBe(null);
    });
  });

  describe('clone', () => {
    it('should create a copy of the tile', () => {
      const original = new TileClass(TileType.BAMBOO, 5, false);
      const clone = original.clone();
      
      expect(clone.type).toBe(original.type);
      expect(clone.value).toBe(original.value);
      expect(clone.isExposed).toBe(original.isExposed);
      expect(clone.id).not.toBe(original.id);
    });

    it('should allow overriding exposure status', () => {
      const original = new TileClass(TileType.BAMBOO, 5, false);
      const clone = original.clone({ isExposed: true });
      
      expect(clone.isExposed).toBe(true);
      expect(original.isExposed).toBe(false);
    });
  });

  describe('serialize and fromSerialized', () => {
    it('should serialize tile to plain object', () => {
      const tile = new TileClass(TileType.BAMBOO, 5, true);
      const serialized = tile.serialize();
      
      expect(serialized).toEqual({
        type: TileType.BAMBOO,
        value: 5,
        isExposed: true
      });
    });

    it('should create tile from serialized data', () => {
      const data: SerializedTile = {
        type: TileType.CHARACTER,
        value: 7,
        isExposed: false
      };
      
      const tile = TileClass.fromSerialized(data);
      
      expect(tile.type).toBe(data.type);
      expect(tile.value).toBe(data.value);
      expect(tile.isExposed).toBe(data.isExposed);
    });
  });

  describe('toString', () => {
    it('should return string representation for non-exposed tile', () => {
      const tile = new TileClass(TileType.BAMBOO, 5, false);
      expect(tile.toString()).toBe('bamboo:5');
    });

    it('should return string representation for exposed tile', () => {
      const tile = new TileClass(TileType.BAMBOO, 5, true);
      expect(tile.toString()).toBe('bamboo:5 (exposed)');
    });
  });
});
