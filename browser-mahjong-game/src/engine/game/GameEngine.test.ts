import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from './GameEngine';
import { GameStatus, TurnPhase } from './GameState';
import { TileClass, TileType } from '../tiles/Tile';
import type { CardConfig } from '../../config/CardTypes';

describe('GameEngine Integration Tests', () => {
  let gameEngine: GameEngine;
  let mockCardConfig: CardConfig;

  beforeEach(() => {
    mockCardConfig = {
      year: 2024,
      version: '1.0',
      patterns: [
        {
          id: 'winning_pattern',
          name: 'Winning Pattern',
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

    gameEngine = new GameEngine(mockCardConfig);
  });

  describe('game initialization', () => {
    it('should initialize game with 4 players', () => {
      gameEngine.initializeGame();
      const state = gameEngine.getState();

      expect(state.players.length).toBe(4);
      expect(state.players[0].isHuman).toBe(true);
      expect(state.players[1].isHuman).toBe(false);
      expect(state.players[2].isHuman).toBe(false);
      expect(state.players[3].isHuman).toBe(false);
    });

    it('should deal 13 tiles to each player', () => {
      gameEngine.initializeGame();
      const state = gameEngine.getState();

      for (const player of state.players) {
        expect(player.hand.length).toBe(13);
      }
    });

    it('should set initial game status to IN_PROGRESS', () => {
      gameEngine.initializeGame();
      const state = gameEngine.getState();

      expect(state.gameStatus).toBe(GameStatus.IN_PROGRESS);
    });

    it('should set initial turn phase to DRAW', () => {
      gameEngine.initializeGame();
      const state = gameEngine.getState();

      expect(state.turnPhase).toBe(TurnPhase.DRAW);
    });

    it('should start with player 0', () => {
      gameEngine.initializeGame();
      const state = gameEngine.getState();

      expect(state.currentPlayer).toBe(0);
    });
  });

  describe('turn progression', () => {
    beforeEach(() => {
      gameEngine.initializeGame();
    });

    it('should allow player to draw a tile', () => {
      const state = gameEngine.getState();
      const initialHandSize = state.players[0].hand.length;

      gameEngine.drawTile(0);

      expect(state.players[0].hand.length).toBe(initialHandSize + 1);
    });

    it('should allow player to discard a tile', () => {
      gameEngine.drawTile(0);
      const state = gameEngine.getState();
      const tileToDiscard = state.players[0].hand[0];
      const initialHandSize = state.players[0].hand.length;

      gameEngine.discardTile(0, tileToDiscard);

      expect(state.players[0].hand.length).toBe(initialHandSize - 1);
      expect(state.discardPile.length).toBe(1);
    });
  });

  describe('win condition', () => {
    beforeEach(() => {
      gameEngine.initializeGame();
    });

    it('should detect winning hand', () => {
      const state = gameEngine.getState();
      
      // Set up a winning hand
      state.players[0].hand = Array(14).fill(null).map(() => 
        new TileClass(TileType.BAMBOO, 1)
      );

      const isWinning = gameEngine.checkWinCondition(0);

      expect(isWinning).toBe(true);
    });

    it('should not detect non-winning hand', () => {
      const state = gameEngine.getState();
      
      // Set up a non-winning hand
      state.players[0].hand = [
        new TileClass(TileType.WIND, 'N'),
        new TileClass(TileType.WIND, 'E'),
        new TileClass(TileType.WIND, 'S'),
        new TileClass(TileType.WIND, 'W')
      ];

      const isWinning = gameEngine.checkWinCondition(0);

      expect(isWinning).toBe(false);
    });

    it('should end game when player wins', () => {
      const state = gameEngine.getState();
      
      // Set up a winning hand
      state.players[0].hand = Array(14).fill(null).map(() => 
        new TileClass(TileType.BAMBOO, 1)
      );

      gameEngine.endGame(0);

      expect(state.gameStatus).toBe(GameStatus.WON);
      expect(state.winnerId).toBe(0);
    });
  });

  describe('game state management', () => {
    it('should get current game state', () => {
      gameEngine.initializeGame();
      const state = gameEngine.getState();

      expect(state).toBeDefined();
      expect(state.gameId).toBeDefined();
      expect(state.players).toBeDefined();
    });
  });
});
