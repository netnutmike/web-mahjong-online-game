/**
 * Types of errors that can occur in the game
 */
export const ErrorType = {
  INVALID_MOVE: 'invalid_move',
  CARD_LOAD_FAILED: 'card_load_failed',
  INVALID_CARD_CONFIG: 'invalid_card_config',
  GAME_STATE_ERROR: 'game_state_error'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * Custom error class for game-related errors
 */
export class GameError extends Error {
  /** Type of error */
  type: ErrorType;
  /** Additional error details */
  details?: any;

  /**
   * Creates a new GameError
   * @param type - The type of error
   * @param message - Human-readable error message
   * @param details - Optional additional error details
   */
  constructor(type: ErrorType, message: string, details?: any) {
    super(message);
    this.name = 'GameError';
    this.type = type;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, GameError);
    }
  }
}
