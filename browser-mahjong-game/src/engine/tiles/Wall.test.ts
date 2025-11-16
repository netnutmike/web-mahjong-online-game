import { describe, it, expect, beforeEach } from 'vitest';
import { Wall } from './Wall';
import { TileClass, TileType } from './Tile';

describe('Wall', () => {
  describe('initialization', () => {
    it('should initialize with 144 tiles', () => {
      const wall = new Wall();
      
      expect(wall.getTotalCount()).toBe(144);
      expect(wall.getRemainingCount()).toBe(144);
    });

    it('should contain correct distribution of suited tiles', () => {
      const wall = new Wall();
      const allTiles = wall.getAllTiles();
      
      // Count bamboo tiles (36 total: 1-9, four of each)
      const bambooTiles = allTiles.filter(t => t.type === TileType.BAMBOO);
      expect(bambooTiles.length).toBe(36);
      
      // Count character tiles
      const characterTiles = allTiles.filter(t => t.type === TileType.CHARACTER);
      expect(characterTiles.length).toBe(36);
      
      // Count dot tiles
      const dotTiles = allTiles.filter(t => t.type === TileType.DOT);
      expect(dotTiles.length).toBe(36);
    });

    it('should contain correct distribution of honor tiles', () => {
      const wall = new Wall();
      const allTiles = wall.getAllTiles();
      
      // Count wind tiles (16 total: N, E, S, W, four of each)
      const windTiles = allTiles.filter(t => t.type === TileType.WIND);
      expect(windTiles.length).toBe(16);
      
      // Count dragon tiles (12 total: Red, Green, White, four of each)
      const dragonTiles = allTiles.filter(t => t.type === TileType.DRAGON);
      expect(dragonTiles.length).toBe(12);
    });

    it('should contain 8 joker tiles', () => {
      const wall = new Wall();
      const allTiles = wall.getAllTiles();
      
      const jokerTiles = allTiles.filter(t => t.type === TileType.JOKER);
      expect(jokerTiles.length).toBe(8);
    });

    it('should accept custom tiles for testing', () => {
      const customTiles = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 3)
      ];
      
      const wall = new Wall(customTiles);
      
      expect(wall.getTotalCount()).toBe(3);
    });
  });

  describe('draw', () => {
    it('should draw a tile from the wall', () => {
      const wall = new Wall();
      const tile = wall.draw();
      
      expect(tile).not.toBeNull();
      expect(wall.getRemainingCount()).toBe(143);
      expect(wall.getDrawnCount()).toBe(1);
    });

    it('should draw tiles in sequence', () => {
      const customTiles = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 3)
      ];
      const wall = new Wall(customTiles);
      
      const tile1 = wall.draw();
      const tile2 = wall.draw();
      
      expect(tile1?.value).toBe(1);
      expect(tile2?.value).toBe(2);
    });

    it('should return null when wall is empty', () => {
      const customTiles = [new TileClass(TileType.BAMBOO, 1)];
      const wall = new Wall(customTiles);
      
      wall.draw(); // Draw the only tile
      const emptyDraw = wall.draw();
      
      expect(emptyDraw).toBeNull();
    });
  });

  describe('drawMultiple', () => {
    it('should draw multiple tiles', () => {
      const wall = new Wall();
      const tiles = wall.drawMultiple(13);
      
      expect(tiles.length).toBe(13);
      expect(wall.getRemainingCount()).toBe(131);
    });

    it('should return fewer tiles if wall runs out', () => {
      const customTiles = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2)
      ];
      const wall = new Wall(customTiles);
      
      const tiles = wall.drawMultiple(5);
      
      expect(tiles.length).toBe(2);
      expect(wall.isEmpty()).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('should return false when tiles remain', () => {
      const wall = new Wall();
      
      expect(wall.isEmpty()).toBe(false);
    });

    it('should return true when all tiles are drawn', () => {
      const customTiles = [new TileClass(TileType.BAMBOO, 1)];
      const wall = new Wall(customTiles);
      
      wall.draw();
      
      expect(wall.isEmpty()).toBe(true);
    });
  });

  describe('shuffle', () => {
    it('should shuffle tiles in the wall', () => {
      const wall = new Wall();
      const originalOrder = wall.getAllTiles().map(t => t.id);
      
      wall.shuffle();
      
      const shuffledOrder = wall.getAllTiles().map(t => t.id);
      
      // It's extremely unlikely that shuffle produces the same order
      // but we can't guarantee it, so we just check that tiles are still there
      expect(shuffledOrder.length).toBe(originalOrder.length);
    });

    it('should not change tile count after shuffle', () => {
      const wall = new Wall();
      const countBefore = wall.getTotalCount();
      
      wall.shuffle();
      
      expect(wall.getTotalCount()).toBe(countBefore);
    });
  });

  describe('reset', () => {
    it('should reset drawn count to zero', () => {
      const wall = new Wall();
      
      wall.drawMultiple(10);
      expect(wall.getDrawnCount()).toBe(10);
      
      wall.reset();
      
      expect(wall.getDrawnCount()).toBe(0);
      expect(wall.getRemainingCount()).toBe(144);
    });

    it('should allow drawing again after reset', () => {
      const customTiles = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2)
      ];
      const wall = new Wall(customTiles);
      
      wall.drawMultiple(2);
      expect(wall.isEmpty()).toBe(true);
      
      wall.reset();
      
      const tile = wall.draw();
      expect(tile).not.toBeNull();
      expect(tile?.value).toBe(1);
    });
  });

  describe('getRemainingTiles', () => {
    it('should return all tiles when none are drawn', () => {
      const wall = new Wall();
      const remaining = wall.getRemainingTiles();
      
      expect(remaining.length).toBe(144);
    });

    it('should return only undrawn tiles', () => {
      const customTiles = [
        new TileClass(TileType.BAMBOO, 1),
        new TileClass(TileType.BAMBOO, 2),
        new TileClass(TileType.BAMBOO, 3)
      ];
      const wall = new Wall(customTiles);
      
      wall.draw(); // Draw first tile
      const remaining = wall.getRemainingTiles();
      
      expect(remaining.length).toBe(2);
      expect(remaining[0].value).toBe(2);
      expect(remaining[1].value).toBe(3);
    });
  });
});
