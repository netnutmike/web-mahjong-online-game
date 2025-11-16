import { describe, it, expect } from 'vitest';
import { TileSetClass } from './TileSet';
import { TileClass, TileType, SetType } from './Tile';

describe('TileSetClass', () => {
  describe('createPung', () => {
    it('should create a valid Pung with three identical tiles', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      
      const pung = TileSetClass.createPung(tiles);
      
      expect(pung.type).toBe(SetType.PUNG);
      expect(pung.tiles.length).toBe(3);
    });

    it('should throw error for non-identical tiles', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 6),
        new TileClass(TileType.BAMBOO, 5)
      ];
      
      expect(() => TileSetClass.createPung(tiles)).toThrow();
    });

    it('should throw error for wrong number of tiles', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      
      expect(() => TileSetClass.createPung(tiles)).toThrow();
    });
  });

  describe('createKong', () => {
    it('should create a valid Kong with four identical tiles', () => {
      const tiles = [
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3)
      ];
      
      const kong = TileSetClass.createKong(tiles);
      
      expect(kong.type).toBe(SetType.KONG);
      expect(kong.tiles.length).toBe(4);
    });

    it('should throw error for non-identical tiles', () => {
      const tiles = [
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 4),
        new TileClass(TileType.CHARACTER, 3)
      ];
      
      expect(() => TileSetClass.createKong(tiles)).toThrow();
    });

    it('should throw error for wrong number of tiles', () => {
      const tiles = [
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3)
      ];
      
      expect(() => TileSetClass.createKong(tiles)).toThrow();
    });
  });

  describe('createChow', () => {
    it('should create a valid Chow with consecutive suited tiles', () => {
      const tiles = [
        new TileClass(TileType.DOT, 3),
        new TileClass(TileType.DOT, 4),
        new TileClass(TileType.DOT, 5)
      ];
      
      const chow = TileSetClass.createChow(tiles);
      
      expect(chow.type).toBe(SetType.CHOW);
      expect(chow.tiles.length).toBe(3);
    });

    it('should create Chow regardless of tile order', () => {
      const tiles = [
        new TileClass(TileType.DOT, 5),
        new TileClass(TileType.DOT, 3),
        new TileClass(TileType.DOT, 4)
      ];
      
      const chow = TileSetClass.createChow(tiles);
      
      expect(chow.type).toBe(SetType.CHOW);
    });

    it('should throw error for non-consecutive tiles', () => {
      const tiles = [
        new TileClass(TileType.DOT, 3),
        new TileClass(TileType.DOT, 5),
        new TileClass(TileType.DOT, 7)
      ];
      
      expect(() => TileSetClass.createChow(tiles)).toThrow();
    });

    it('should throw error for tiles of different suits', () => {
      const tiles = [
        new TileClass(TileType.DOT, 3),
        new TileClass(TileType.BAMBOO, 4),
        new TileClass(TileType.DOT, 5)
      ];
      
      expect(() => TileSetClass.createChow(tiles)).toThrow();
    });

    it('should throw error for honor tiles', () => {
      const tiles = [
        new TileClass(TileType.WIND, 'N'),
        new TileClass(TileType.WIND, 'E'),
        new TileClass(TileType.WIND, 'S')
      ];
      
      expect(() => TileSetClass.createChow(tiles)).toThrow();
    });

    it('should throw error for wrong number of tiles', () => {
      const tiles = [
        new TileClass(TileType.DOT, 3),
        new TileClass(TileType.DOT, 4)
      ];
      
      expect(() => TileSetClass.createChow(tiles)).toThrow();
    });
  });

  describe('canFormPung', () => {
    it('should return true for three identical tiles', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      
      expect(TileSetClass.canFormPung(tiles)).toBe(true);
    });

    it('should return false for non-identical tiles', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 6),
        new TileClass(TileType.BAMBOO, 5)
      ];
      
      expect(TileSetClass.canFormPung(tiles)).toBe(false);
    });

    it('should return false for wrong number of tiles', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      
      expect(TileSetClass.canFormPung(tiles)).toBe(false);
    });
  });

  describe('canFormKong', () => {
    it('should return true for four identical tiles', () => {
      const tiles = [
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3)
      ];
      
      expect(TileSetClass.canFormKong(tiles)).toBe(true);
    });

    it('should return false for non-identical tiles', () => {
      const tiles = [
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 3),
        new TileClass(TileType.CHARACTER, 4),
        new TileClass(TileType.CHARACTER, 3)
      ];
      
      expect(TileSetClass.canFormKong(tiles)).toBe(false);
    });
  });

  describe('canFormChow', () => {
    it('should return true for consecutive suited tiles', () => {
      const tiles = [
        new TileClass(TileType.DOT, 3),
        new TileClass(TileType.DOT, 4),
        new TileClass(TileType.DOT, 5)
      ];
      
      expect(TileSetClass.canFormChow(tiles)).toBe(true);
    });

    it('should return false for non-consecutive tiles', () => {
      const tiles = [
        new TileClass(TileType.DOT, 3),
        new TileClass(TileType.DOT, 5),
        new TileClass(TileType.DOT, 7)
      ];
      
      expect(TileSetClass.canFormChow(tiles)).toBe(false);
    });

    it('should return false for honor tiles', () => {
      const tiles = [
        new TileClass(TileType.WIND, 'N'),
        new TileClass(TileType.WIND, 'E'),
        new TileClass(TileType.WIND, 'S')
      ];
      
      expect(TileSetClass.canFormChow(tiles)).toBe(false);
    });
  });

  describe('getCount', () => {
    it('should return correct tile count', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      const pung = TileSetClass.createPung(tiles);
      
      expect(pung.getCount()).toBe(3);
    });
  });

  describe('contains', () => {
    it('should return true if tile is in the set', () => {
      const tile1 = new TileClass(TileType.BAMBOO, 5);
      const tile2 = new TileClass(TileType.BAMBOO, 5);
      const tile3 = new TileClass(TileType.BAMBOO, 5);
      
      const pung = TileSetClass.createPung([tile1, tile2, tile3]);
      
      expect(pung.contains(tile1)).toBe(true);
    });

    it('should return false if tile is not in the set', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      const pung = TileSetClass.createPung(tiles);
      
      const otherTile = new TileClass(TileType.BAMBOO, 6);
      
      expect(pung.contains(otherTile)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation of the set', () => {
      const tiles = [
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5),
        new TileClass(TileType.BAMBOO, 5)
      ];
      const pung = TileSetClass.createPung(tiles);
      
      const str = pung.toString();
      
      expect(str).toContain('PUNG');
      expect(str).toContain('bamboo:5');
    });
  });
});
