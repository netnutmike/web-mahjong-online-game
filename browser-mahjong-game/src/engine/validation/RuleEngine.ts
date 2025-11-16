import { TileClass, TileType, SetType, type Tile } from '../tiles/Tile';
import { TileSetClass } from '../tiles/TileSet';

/**
 * Type of call a player can make
 */
export const CallType = {
  PUNG: 'pung',
  KONG: 'kong',
  MAHJONG: 'mahjong'
} as const;

export type CallType = typeof CallType[keyof typeof CallType];

/**
 * Result of call validation
 */
export interface CallValidationResult {
  /** Whether the call is valid */
  isValid: boolean;
  /** The type of call */
  callType?: CallType;
  /** Error message if invalid */
  error?: string;
}

/**
 * Represents a call opportunity for a player
 */
export interface CallOpportunity {
  /** Player ID who can make the call */
  playerId: number;
  /** Type of call available */
  callType: CallType;
  /** The discarded tile that can be called */
  tile: Tile;
}

/**
 * RuleEngine enforces standard American Mahjong rules
 * Handles turn order, calling rules, and game flow validation
 */
export class RuleEngine {
  /**
   * Validates if a player can make a pung call
   * @param hand - The player's current hand
   * @param discardedTile - The tile that was discarded
   * @returns Validation result
   */
  validatePungCall(hand: Tile[], discardedTile: Tile): CallValidationResult {
    // Cannot call jokers
    if (discardedTile.type === TileType.JOKER) {
      return {
        isValid: false,
        error: 'Cannot call a joker'
      };
    }

    // Count matching tiles in hand (excluding jokers for pung)
    const matchingTiles = hand.filter(tile => 
      tile.type === discardedTile.type && 
      tile.value === discardedTile.value &&
      tile.type !== TileType.JOKER
    );

    // Need at least 2 matching tiles to form a pung with the discarded tile
    if (matchingTiles.length < 2) {
      return {
        isValid: false,
        error: 'Need at least 2 matching tiles in hand to call pung'
      };
    }

    return {
      isValid: true,
      callType: CallType.PUNG
    };
  }

  /**
   * Validates if a player can make a kong call
   * @param hand - The player's current hand
   * @param discardedTile - The tile that was discarded
   * @returns Validation result
   */
  validateKongCall(hand: Tile[], discardedTile: Tile): CallValidationResult {
    // Cannot call jokers
    if (discardedTile.type === TileType.JOKER) {
      return {
        isValid: false,
        error: 'Cannot call a joker'
      };
    }

    // Count matching tiles in hand (excluding jokers for kong)
    const matchingTiles = hand.filter(tile => 
      tile.type === discardedTile.type && 
      tile.value === discardedTile.value &&
      tile.type !== TileType.JOKER
    );

    // Need exactly 3 matching tiles to form a kong with the discarded tile
    if (matchingTiles.length < 3) {
      return {
        isValid: false,
        error: 'Need at least 3 matching tiles in hand to call kong'
      };
    }

    return {
      isValid: true,
      callType: CallType.KONG
    };
  }

  /**
   * Validates if a player can declare mahjong
   * This is a preliminary check - actual hand validation is done by HandValidator
   * @param hand - The player's current hand
   * @param discardedTile - The tile that was discarded (optional, for calling mahjong on discard)
   * @returns Validation result
   */
  validateMahjongCall(hand: Tile[], discardedTile?: Tile): CallValidationResult {
    // Calculate total tiles
    const totalTiles = hand.length + (discardedTile ? 1 : 0);

    // American Mahjong requires exactly 14 tiles
    if (totalTiles !== 14) {
      return {
        isValid: false,
        error: `Invalid tile count for mahjong: ${totalTiles} (expected 14)`
      };
    }

    // Basic validation passed - actual pattern matching done by HandValidator
    return {
      isValid: true,
      callType: CallType.MAHJONG
    };
  }

  /**
   * Determines which players can make calls on a discarded tile
   * @param discardedTile - The tile that was discarded
   * @param currentPlayer - The player who discarded the tile
   * @param players - Array of all players with their hands
   * @param handValidator - Optional HandValidator to validate mahjong calls
   * @returns Array of call opportunities
   */
  getCallOpportunities(
    discardedTile: Tile,
    currentPlayer: number,
    players: Array<{ id: number; hand: Tile[] }>,
    handValidator?: unknown
  ): CallOpportunity[] {
    const opportunities: CallOpportunity[] = [];

    // Check each other player for call opportunities
    for (const player of players) {
      // Players cannot call their own discards
      if (player.id === currentPlayer) {
        continue;
      }

      // Check for all possible call types
      
      // Check for mahjong (highest priority)
      // If handValidator is provided, do full validation; otherwise just check tile count
      const mahjongResult = this.validateMahjongCall(player.hand, discardedTile);
      if (mahjongResult.isValid) {
        // If we have a handValidator, verify the hand actually wins
        if (handValidator) {
          const testHand = [...player.hand, discardedTile];
          const validation = handValidator.validateHand(testHand, []);
          if (validation.isValid) {
            opportunities.push({
              playerId: player.id,
              callType: CallType.MAHJONG,
              tile: discardedTile
            });
          }
        } else {
          // No validator, just add the opportunity (will be validated later)
          opportunities.push({
            playerId: player.id,
            callType: CallType.MAHJONG,
            tile: discardedTile
          });
        }
      }

      // Check for kong
      const kongResult = this.validateKongCall(player.hand, discardedTile);
      if (kongResult.isValid) {
        console.log(`Player ${player.id} can call KONG on ${discardedTile.type}:${discardedTile.value}`);
        opportunities.push({
          playerId: player.id,
          callType: CallType.KONG,
          tile: discardedTile
        });
      }

      // Check for pung
      const pungResult = this.validatePungCall(player.hand, discardedTile);
      if (pungResult.isValid) {
        console.log(`Player ${player.id} can call PUNG on ${discardedTile.type}:${discardedTile.value}`);
        opportunities.push({
          playerId: player.id,
          callType: CallType.PUNG,
          tile: discardedTile
        });
      }
    }

    return opportunities;
  }

  /**
   * Determines the next player in turn order
   * @param currentPlayer - Current player ID (0-3)
   * @returns Next player ID
   */
  getNextPlayer(currentPlayer: number): number {
    return (currentPlayer + 1) % 4;
  }

  /**
   * Validates if it's a specific player's turn
   * @param playerId - The player ID to check
   * @param currentPlayer - The current active player
   * @returns True if it's the player's turn
   */
  isPlayerTurn(playerId: number, currentPlayer: number): boolean {
    return playerId === currentPlayer;
  }

  /**
   * Processes a call and creates the exposed set
   * @param hand - The player's hand (will be modified)
   * @param discardedTile - The tile being called
   * @param callType - The type of call
   * @returns The created tile set
   * @throws Error if the call cannot be processed
   */
  processCall(hand: Tile[], discardedTile: Tile, callType: CallType): TileSetClass {
    const tilesToUse: TileClass[] = [];

    // Add the discarded tile
    const calledTile = new TileClass(discardedTile.type, discardedTile.value, true);
    tilesToUse.push(calledTile);

    // Find and remove matching tiles from hand
    const matchingTiles = hand.filter(tile => 
      tile.type === discardedTile.type && 
      tile.value === discardedTile.value &&
      tile.type !== TileType.JOKER
    );

    let tilesNeeded: number;
    let setType: SetType;

    switch (callType) {
      case CallType.PUNG:
        tilesNeeded = 2;
        setType = SetType.PUNG;
        break;
      case CallType.KONG:
        tilesNeeded = 3;
        setType = SetType.KONG;
        break;
      default:
        throw new Error(`Cannot process call type: ${callType}`);
    }

    if (matchingTiles.length < tilesNeeded) {
      throw new Error(`Insufficient matching tiles for ${callType}`);
    }

    // Remove tiles from hand and add to set
    for (let i = 0; i < tilesNeeded; i++) {
      const tile = matchingTiles[i];
      const index = hand.findIndex(t => t.id === tile.id);
      if (index !== -1) {
        hand.splice(index, 1);
        const exposedTile = new TileClass(tile.type, tile.value, true);
        tilesToUse.push(exposedTile);
      }
    }

    // Create and return the tile set
    return new TileSetClass(setType, tilesToUse);
  }

  /**
   * Validates if a discard is legal
   * @param tile - The tile to discard
   * @param hand - The player's current hand
   * @returns True if the discard is valid
   */
  validateDiscard(tile: Tile, hand: Tile[]): boolean {
    // Check if the tile is in the player's hand
    return hand.some(t => t.id === tile.id);
  }

  /**
   * Resolves call priority when multiple players want to call
   * Mahjong > Kong > Pung
   * If same priority, player closest in turn order wins
   * @param opportunities - Array of call opportunities
   * @param currentPlayer - The player who discarded
   * @returns The winning call opportunity, or null if none
   */
  resolveCallPriority(
    opportunities: CallOpportunity[],
    currentPlayer: number
  ): CallOpportunity | null {
    if (opportunities.length === 0) {
      return null;
    }

    // Priority order: Mahjong > Kong > Pung
    const priorityOrder = [CallType.MAHJONG, CallType.KONG, CallType.PUNG];

    for (const priority of priorityOrder) {
      const matchingCalls = opportunities.filter(opp => opp.callType === priority);
      
      if (matchingCalls.length > 0) {
        // If multiple players have same priority, closest in turn order wins
        if (matchingCalls.length === 1) {
          return matchingCalls[0];
        }

        // Find closest player in turn order
        let closestPlayer = matchingCalls[0];
        let closestDistance = this.getPlayerDistance(currentPlayer, closestPlayer.playerId);

        for (let i = 1; i < matchingCalls.length; i++) {
          const distance = this.getPlayerDistance(currentPlayer, matchingCalls[i].playerId);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestPlayer = matchingCalls[i];
          }
        }

        return closestPlayer;
      }
    }

    return null;
  }

  /**
   * Calculates the distance between two players in turn order
   * @param fromPlayer - Starting player
   * @param toPlayer - Target player
   * @returns Distance (1-3)
   */
  private getPlayerDistance(fromPlayer: number, toPlayer: number): number {
    return (toPlayer - fromPlayer + 4) % 4;
  }

  /**
   * Validates if the wall has enough tiles for the game to continue
   * @param wallSize - Current number of tiles in the wall
   * @returns True if game can continue
   */
  canContinueGame(wallSize: number): boolean {
    // Game ends when wall is exhausted
    return wallSize > 0;
  }
}
