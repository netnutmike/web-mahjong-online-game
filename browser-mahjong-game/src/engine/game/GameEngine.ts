import type { Tile } from '../tiles/Tile';
import { Wall } from '../tiles/Wall';
import { HandValidator } from '../validation/HandValidator';
import { RuleEngine, CallType, type CallOpportunity } from '../validation/RuleEngine';
import { AIPlayer } from '../ai/AIPlayer';
import { Difficulty } from '../ai/Strategy';
import type { CardConfig } from '../../config/CardTypes';
import { GameError, ErrorType } from './GameError';
import { type GameState, GameStatus, TurnPhase, type Player } from './GameState';

/**
 * GameEngine manages the core game logic and state
 * Handles initialization, turn processing, and game flow
 */
export class GameEngine {
  private state: GameState;
  private cardConfig: CardConfig;
  private wall: Wall;
  private handValidator: HandValidator;
  private ruleEngine: RuleEngine;
  private aiPlayers: AIPlayer[];

  /**
   * Creates a new GameEngine instance
   * @param cardConfig - The card configuration for this game
   */
  constructor(cardConfig: CardConfig) {
    this.cardConfig = cardConfig;
    this.wall = new Wall();
    this.handValidator = new HandValidator(cardConfig);
    this.ruleEngine = new RuleEngine();
    this.aiPlayers = [];

    // Initialize with empty state
    this.state = this.createInitialState();
  }

  /**
   * Creates the initial game state
   * @returns Initial game state
   */
  private createInitialState(): GameState {
    return {
      gameId: this.generateGameId(),
      selectedCardYear: this.cardConfig.year,
      currentPlayer: 0,
      players: [],
      wall: [],
      discardPile: [],
      turnPhase: TurnPhase.DRAW,
      gameStatus: GameStatus.IN_PROGRESS
    };
  }

  /**
   * Generates a unique game ID
   * @returns Unique game identifier
   */
  private generateGameId(): string {
    return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initializes a new game
   * Sets up players, wall, and deals initial tiles
   */
  initializeGame(): void {
    // Create new wall and shuffle
    this.wall = new Wall();
    this.wall.shuffle();

    // Initialize players
    this.state.players = [
      { id: 0, isHuman: true, hand: [], exposedSets: [], discardedTiles: [] },
      { id: 1, isHuman: false, hand: [], exposedSets: [], discardedTiles: [] },
      { id: 2, isHuman: false, hand: [], exposedSets: [], discardedTiles: [] },
      { id: 3, isHuman: false, hand: [], exposedSets: [], discardedTiles: [] }
    ];

    // Initialize AI players
    this.aiPlayers = [
      new AIPlayer(1, this.cardConfig, Difficulty.MEDIUM),
      new AIPlayer(2, this.cardConfig, Difficulty.MEDIUM),
      new AIPlayer(3, this.cardConfig, Difficulty.MEDIUM)
    ];

    // Deal tiles
    this.dealTiles();

    // Set initial game state
    this.state.gameId = this.generateGameId();
    this.state.selectedCardYear = this.cardConfig.year;
    this.state.currentPlayer = 0;
    this.state.discardPile = [];
    this.state.turnPhase = TurnPhase.DRAW;
    this.state.gameStatus = GameStatus.IN_PROGRESS;
    this.state.winnerId = undefined;

    // Update wall in state
    this.updateWallInState();
  }

  /**
   * Deals initial tiles to all players
   * Each player receives 13 tiles
   */
  dealTiles(): void {
    // Deal 13 tiles to each player
    for (const player of this.state.players) {
      const tiles = this.wall.drawMultiple(13);
      player.hand = tiles;
    }
  }

  /**
   * Updates the wall representation in the game state
   */
  private updateWallInState(): void {
    this.state.wall = this.wall.getRemainingTiles();
  }

  /**
   * Processes a turn for the current player
   * Handles both human and AI players
   */
  async processTurn(): Promise<void> {
    console.log('processTurn called. Current player:', this.state.currentPlayer, 'Phase:', this.state.turnPhase);
    const player = this.getCurrentPlayer();

    if (!player) {
      throw new GameError(
        ErrorType.GAME_STATE_ERROR,
        'No current player found'
      );
    }

    console.log('Player found:', player.id, 'isHuman:', player.isHuman);

    // Check if game is over
    if (this.state.gameStatus !== GameStatus.IN_PROGRESS) {
      console.log('Game is not in progress, returning');
      return;
    }

    // Handle turn based on phase
    if (this.state.turnPhase === TurnPhase.DRAW) {
      // Draw phase - player needs to draw a tile
      if (player.isHuman) {
        // Human player - wait for UI to trigger draw
        console.log('Human player turn, waiting for UI');
        return;
      } else {
        // AI player - automatically draw
        console.log('AI player turn, processing...');
        await this.processAITurn(player);
        console.log('AI turn complete');
      }
    } else {
      console.log('Not in DRAW phase, current phase:', this.state.turnPhase);
    }
  }

  /**
   * Processes an AI player's turn
   * @param player - The AI player
   */
  private async processAITurn(player: Player): Promise<void> {
    // Check for wall exhaustion before drawing
    if (this.isWallExhausted()) {
      this.endGame();
      return;
    }

    // Draw a tile
    const drawnTile = this.drawTile(player.id);
    
    if (!drawnTile) {
      // Wall exhausted during draw
      this.endGame();
      return;
    }

    // Get the AI player instance
    const aiPlayer = this.aiPlayers.find(ai => ai.getPlayerId() === player.id);
    
    if (!aiPlayer) {
      throw new GameError(
        ErrorType.GAME_STATE_ERROR,
        `AI player ${player.id} not found`
      );
    }

    // Check if AI has won after drawing
    if (this.checkWinCondition(player.id)) {
      // AI can declare mahjong
      this.declareMahjong(player.id);
      return;
    }

    // AI decides which tile to discard
    const tileToDiscard = await aiPlayer.makeTurnDecision(player.hand, player.exposedSets);

    // Discard the selected tile
    this.discardTile(player.id, tileToDiscard);
  }

  /**
   * Draws a tile for a player
   * @param playerId - The player's ID
   * @returns The drawn tile, or null if wall is empty
   */
  drawTile(playerId: number): Tile | null {
    const player = this.getPlayer(playerId);
    
    if (!player) {
      throw new GameError(
        ErrorType.GAME_STATE_ERROR,
        `Player ${playerId} not found`
      );
    }

    // Check if it's the player's turn
    if (this.state.currentPlayer !== playerId) {
      throw new GameError(
        ErrorType.INVALID_MOVE,
        'Not your turn to draw'
      );
    }

    // Check if in draw phase
    if (this.state.turnPhase !== TurnPhase.DRAW) {
      throw new GameError(
        ErrorType.INVALID_MOVE,
        'Cannot draw in current phase'
      );
    }

    // Draw from wall
    const tile = this.wall.draw();
    
    if (!tile) {
      // Wall exhausted - game ends in draw
      return null;
    }

    // Add to player's hand
    player.hand.push(tile);

    // Update state
    this.updateWallInState();
    this.state.turnPhase = TurnPhase.DISCARD;

    return tile;
  }

  /**
   * Discards a tile from a player's hand
   * @param playerId - The player's ID
   * @param tile - The tile to discard
   */
  discardTile(playerId: number, tile: Tile): void {
    const player = this.getPlayer(playerId);
    
    if (!player) {
      throw new GameError(
        ErrorType.GAME_STATE_ERROR,
        `Player ${playerId} not found`
      );
    }

    // Check if it's the player's turn
    if (this.state.currentPlayer !== playerId) {
      throw new GameError(
        ErrorType.INVALID_MOVE,
        'Not your turn to discard'
      );
    }

    // Check if in discard phase
    if (this.state.turnPhase !== TurnPhase.DISCARD) {
      throw new GameError(
        ErrorType.INVALID_MOVE,
        'Cannot discard in current phase'
      );
    }

    // Validate discard
    if (!this.ruleEngine.validateDiscard(tile, player.hand)) {
      throw new GameError(
        ErrorType.INVALID_MOVE,
        'Tile not in hand'
      );
    }

    // Remove tile from hand
    const tileIndex = player.hand.findIndex(t => t.id === tile.id);
    if (tileIndex !== -1) {
      player.hand.splice(tileIndex, 1);
    }

    // Add to discard pile
    this.state.discardPile.push(tile);
    player.discardedTiles.push(tile);

    // Check for call opportunities
    const opportunities = this.evaluateCallOpportunity(tile);
    
    if (opportunities.length > 0) {
      // Enter call opportunity phase
      this.state.turnPhase = TurnPhase.CALL_OPPORTUNITY;
    } else {
      // No calls, advance to next player
      this.advanceTurn();
    }
  }

  /**
   * Advances to the next player's turn
   */
  advanceTurn(): void {
    // Check if wall is exhausted before advancing
    if (this.isWallExhausted()) {
      this.endGame();
      return;
    }

    // Move to next player
    this.state.currentPlayer = this.ruleEngine.getNextPlayer(this.state.currentPlayer);
    this.state.turnPhase = TurnPhase.DRAW;
  }

  /**
   * Evaluates call opportunities for a discarded tile
   * @param discardedTile - The tile that was discarded
   * @returns Array of call opportunities
   */
  evaluateCallOpportunity(discardedTile: Tile): CallOpportunity[] {
    const players = this.state.players.map(p => ({
      id: p.id,
      hand: p.hand
    }));

    return this.ruleEngine.getCallOpportunities(
      discardedTile,
      this.state.currentPlayer,
      players
    );
  }

  /**
   * Checks if a player has won
   * @param playerId - The player's ID
   * @returns True if the player has won
   */
  checkWinCondition(playerId: number): boolean {
    const player = this.getPlayer(playerId);
    
    if (!player) {
      return false;
    }

    const result = this.handValidator.validateHand(player.hand, player.exposedSets);
    return result.isValid;
  }

  /**
   * Validates and processes a mahjong declaration
   * @param playerId - The player declaring mahjong
   * @param withTile - Optional tile to include (for calling mahjong on discard)
   * @returns Validation result with pattern and score
   */
  declareMahjong(playerId: number, withTile?: Tile) {
    const player = this.getPlayer(playerId);
    
    if (!player) {
      throw new GameError(
        ErrorType.GAME_STATE_ERROR,
        `Player ${playerId} not found`
      );
    }

    // Create hand with optional tile
    const handToValidate = withTile ? [...player.hand, withTile] : player.hand;

    // Validate the hand
    const result = this.handValidator.validateHand(handToValidate, player.exposedSets);

    if (!result.isValid) {
      throw new GameError(
        ErrorType.INVALID_MOVE,
        result.error || 'Invalid mahjong declaration'
      );
    }

    // Add tile to hand if provided
    if (withTile) {
      player.hand.push(withTile);
      
      // Remove from discard pile if it was called
      const discardIndex = this.state.discardPile.findIndex(t => t.id === withTile.id);
      if (discardIndex !== -1) {
        this.state.discardPile.splice(discardIndex, 1);
      }
    }

    // Player wins!
    this.endGame(playerId);

    return result;
  }

  /**
   * Ends the game
   * @param winnerId - Optional ID of the winning player
   */
  endGame(winnerId?: number): void {
    if (winnerId !== undefined) {
      this.state.gameStatus = GameStatus.WON;
      this.state.winnerId = winnerId;
    } else {
      this.state.gameStatus = GameStatus.DRAW;
    }

    this.state.turnPhase = TurnPhase.GAME_OVER;
  }

  /**
   * Checks if the wall is exhausted
   * @returns True if no tiles remain in the wall
   */
  isWallExhausted(): boolean {
    return this.wall.isEmpty();
  }

  /**
   * Gets the number of tiles remaining in the wall
   * @returns Number of tiles left
   */
  getRemainingTileCount(): number {
    return this.wall.getRemainingCount();
  }

  /**
   * Checks if the game is over
   * @returns True if game has ended
   */
  isGameOver(): boolean {
    return this.state.gameStatus !== GameStatus.IN_PROGRESS;
  }

  /**
   * Gets the winner information if game is won
   * @returns Winner player and validation result, or null if no winner
   */
  getWinnerInfo() {
    if (this.state.gameStatus !== GameStatus.WON || this.state.winnerId === undefined) {
      return null;
    }

    const winner = this.getPlayer(this.state.winnerId);
    if (!winner) {
      return null;
    }

    const result = this.handValidator.validateHand(winner.hand, winner.exposedSets);

    return {
      player: winner,
      validationResult: result
    };
  }

  /**
   * Gets the current game state
   * @returns Current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Gets a player by ID
   * @param playerId - The player's ID
   * @returns The player, or undefined if not found
   */
  getPlayer(playerId: number): Player | undefined {
    return this.state.players.find(p => p.id === playerId);
  }

  /**
   * Gets the current player
   * @returns The current player
   */
  getCurrentPlayer(): Player | undefined {
    return this.getPlayer(this.state.currentPlayer);
  }

  /**
   * Gets the human player
   * @returns The human player
   */
  getHumanPlayer(): Player | undefined {
    return this.state.players.find(p => p.isHuman);
  }

  /**
   * Gets all AI players
   * @returns Array of AI player instances
   */
  getAIPlayers(): AIPlayer[] {
    return this.aiPlayers;
  }

  /**
   * Updates the card configuration
   * @param cardConfig - New card configuration
   */
  updateCardConfig(cardConfig: CardConfig): void {
    this.cardConfig = cardConfig;
    this.handValidator.updateCardConfig(cardConfig);
    
    // Update AI players
    for (const aiPlayer of this.aiPlayers) {
      aiPlayer.updateCardConfig(cardConfig);
    }
  }

  /**
   * Gets the current card configuration
   * @returns Current card configuration
   */
  getCardConfig(): CardConfig {
    return this.cardConfig;
  }

  /**
   * Processes a call from a player
   * @param playerId - The player making the call
   * @param callType - The type of call (pung, kong, mahjong)
   * @param tile - The tile being called
   */
  processCall(playerId: number, callType: CallType, tile: Tile): void {
    const player = this.getPlayer(playerId);
    
    if (!player) {
      throw new GameError(
        ErrorType.GAME_STATE_ERROR,
        `Player ${playerId} not found`
      );
    }

    // Check if in call opportunity phase
    if (this.state.turnPhase !== TurnPhase.CALL_OPPORTUNITY) {
      throw new GameError(
        ErrorType.INVALID_MOVE,
        'No call opportunity available'
      );
    }

    // Validate the call
    if (callType === CallType.MAHJONG) {
      // Check if player can win with this tile
      const tempHand = [...player.hand, tile];
      const result = this.handValidator.validateHand(tempHand, player.exposedSets);
      
      if (!result.isValid) {
        throw new GameError(
          ErrorType.INVALID_MOVE,
          'Invalid mahjong declaration',
          { error: result.error }
        );
      }

      // Player wins!
      player.hand.push(tile);
      this.endGame(playerId);
      return;
    }

    // Process pung or kong call
    const tileSet = this.ruleEngine.processCall(player.hand, tile, callType);
    player.exposedSets.push(tileSet);

    // Remove the called tile from discard pile
    const discardIndex = this.state.discardPile.findIndex(t => t.id === tile.id);
    if (discardIndex !== -1) {
      this.state.discardPile.splice(discardIndex, 1);
    }

    // Player who called becomes the current player and must discard
    this.state.currentPlayer = playerId;
    this.state.turnPhase = TurnPhase.DISCARD;
  }

  /**
   * Declines all call opportunities and advances turn
   */
  declineCallOpportunities(): void {
    if (this.state.turnPhase !== TurnPhase.CALL_OPPORTUNITY) {
      // Already moved past call opportunity phase, just return
      console.log('declineCallOpportunities called but not in CALL_OPPORTUNITY phase, ignoring');
      return;
    }

    // Advance to next player
    this.advanceTurn();
  }

  /**
   * Processes AI call decisions for a call opportunity
   * @param opportunities - Array of call opportunities
   * @returns The winning opportunity if an AI decides to call, or null
   */
  async processAICallDecisions(opportunities: CallOpportunity[]): Promise<CallOpportunity | null> {
    console.log('processAICallDecisions: Total opportunities:', opportunities.length);
    
    // Filter for AI player opportunities
    const aiOpportunities = opportunities.filter(opp => {
      const player = this.getPlayer(opp.playerId);
      return player && !player.isHuman;
    });

    console.log('processAICallDecisions: AI opportunities:', aiOpportunities.length);

    if (aiOpportunities.length === 0) {
      return null;
    }

    // Resolve priority if multiple AIs want to call
    const priorityCall = this.ruleEngine.resolveCallPriority(
      aiOpportunities,
      this.state.currentPlayer
    );

    if (!priorityCall) {
      return null;
    }

    // Get the AI player
    const aiPlayer = this.aiPlayers.find(ai => ai.getPlayerId() === priorityCall.playerId);
    const player = this.getPlayer(priorityCall.playerId);

    console.log('processAICallDecisions: Priority call for player:', priorityCall.playerId, 'aiPlayer found:', !!aiPlayer, 'player found:', !!player);

    if (!aiPlayer || !player) {
      return null;
    }

    // Ask AI if it wants to make the call
    console.log('processAICallDecisions: Asking AI for decision...');
    const decision = await aiPlayer.makeCallDecision(
      priorityCall,
      player.hand,
      player.exposedSets
    );
    console.log('processAICallDecisions: AI decision:', decision);

    if (decision.shouldCall) {
      return priorityCall;
    }

    return null;
  }

  /**
   * Gets available call opportunities for the human player
   * @returns Array of call opportunities for the human player
   */
  getHumanCallOpportunities(): CallOpportunity[] {
    if (this.state.turnPhase !== TurnPhase.CALL_OPPORTUNITY) {
      return [];
    }

    const humanPlayer = this.getHumanPlayer();
    if (!humanPlayer) {
      return [];
    }

    // Get the last discarded tile
    const lastDiscard = this.state.discardPile[this.state.discardPile.length - 1];
    if (!lastDiscard) {
      return [];
    }

    // Get all opportunities
    const allOpportunities = this.evaluateCallOpportunity(lastDiscard);

    // Filter for human player
    return allOpportunities.filter(opp => opp.playerId === humanPlayer.id);
  }

  /**
   * Checks if there are any pending call opportunities
   * @returns True if there are call opportunities
   */
  hasCallOpportunities(): boolean {
    return this.state.turnPhase === TurnPhase.CALL_OPPORTUNITY;
  }
}
