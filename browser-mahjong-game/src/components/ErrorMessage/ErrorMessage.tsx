import React, { useEffect, useState, useCallback } from 'react';
import { GameError, ErrorType } from '../../engine/game/GameError';
import './ErrorMessage.css';

interface ErrorMessageProps {
  error: Error | string | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

/**
 * ErrorMessage component displays user-friendly error messages
 * Supports auto-dismiss and custom error types
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  useEffect(() => {
    if (error) {
      setIsVisible(true);

      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoDismissDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoDismiss, autoDismissDelay, handleDismiss]);

  if (!error || !isVisible) {
    return null;
  }

  // Get user-friendly error message
  const getMessage = (): string => {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof GameError) {
      return getUserFriendlyMessage(error);
    }

    return error.message || 'An unexpected error occurred';
  };

  // Get error severity class
  const getSeverityClass = (): string => {
    if (error instanceof GameError) {
      switch (error.type) {
        case ErrorType.INVALID_MOVE:
          return 'error-message-warning';
        case ErrorType.CARD_LOAD_FAILED:
        case ErrorType.INVALID_CARD_CONFIG:
          return 'error-message-error';
        case ErrorType.GAME_STATE_ERROR:
          return 'error-message-error';
        default:
          return 'error-message-info';
      }
    }
    return 'error-message-error';
  };

  const message = getMessage();
  const severityClass = getSeverityClass();

  return (
    <div className={`error-message ${severityClass}`}>
      <div className="error-message-content">
        <span className="error-message-icon">
          {error instanceof GameError && error.type === ErrorType.INVALID_MOVE ? '⚠️' : '❌'}
        </span>
        <span className="error-message-text">{message}</span>
      </div>
      <button
        className="error-message-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
};

/**
 * Converts GameError to user-friendly message
 */
function getUserFriendlyMessage(error: GameError): string {
  switch (error.type) {
    case ErrorType.INVALID_MOVE:
      // Use the error message as-is for invalid moves (already user-friendly)
      return error.message;

    case ErrorType.CARD_LOAD_FAILED:
      if (error.details?.year) {
        return `Unable to load card configuration for ${error.details.year}. Please check that the card file exists.`;
      }
      return 'Unable to load card configuration. Please try again.';

    case ErrorType.INVALID_CARD_CONFIG:
      if (error.details?.year) {
        return `The card configuration for ${error.details.year} is invalid. Please check the file format.`;
      }
      return 'The card configuration file is invalid. Please check the file format.';

    case ErrorType.GAME_STATE_ERROR:
      return 'A game error occurred. Please start a new game.';

    default:
      return error.message || 'An unexpected error occurred';
  }
}
