import { useState, useEffect } from 'react';
import { GameBoard, ErrorBoundary } from './components';
import { GameProvider } from './hooks/GameContext';
import { cardLoader, CardLoadError } from './config/CardLoader';
import type { CardConfig } from './config/CardTypes';
import { getSelectedYear, saveSelectedYear } from './utils/storage';
import './App.css';

/**
 * Default fallback card configuration
 * Used when no card files are available
 */
const DEFAULT_CARD_CONFIG: CardConfig = {
  year: new Date().getFullYear(),
  version: '1.0',
  patterns: [
    {
      id: 'default-pattern',
      name: 'Default Pattern',
      category: 'Default',
      points: 25,
      tiles: [
        {
          type: 'any',
          count: 14,
          sequence: false,
          jokerAllowed: true
        }
      ]
    }
  ]
};

/**
 * Loading component displayed while card configuration loads
 */
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading American Mahjong...</p>
    </div>
  );
}

/**
 * Error component displayed when card loading fails
 */
function CardLoadErrorScreen({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="card-load-error">
      <div className="card-load-error-content">
        <div className="error-icon">⚠️</div>
        <h2>Unable to Load Card Configuration</h2>
        <p className="error-message">
          {error instanceof CardLoadError 
            ? error.message 
            : 'Failed to load card configuration files.'}
        </p>
        <p className="error-help">
          The game will use a default configuration. You can add card files to the 
          <code>/public/cards/</code> directory to enable year-specific patterns.
        </p>
        <button className="retry-button" onClick={onRetry}>
          Continue with Default Configuration
        </button>
      </div>
    </div>
  );
}

/**
 * Main App component
 * Handles card configuration loading and provides game context
 */
function App() {
  const [cardConfig, setCardConfig] = useState<CardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const loadCardConfiguration = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      // Try to get available years
      const availableYears = await cardLoader.getAvailableYears();

      if (availableYears.length === 0) {
        // No card files found, use default
        console.warn('No card configuration files found, using default configuration');
        setCardConfig(DEFAULT_CARD_CONFIG);
        setLoading(false);
        return;
      }

      // Check if there's a saved year preference
      const savedYear = getSelectedYear();
      let yearToLoad = availableYears[0]; // Default to most recent

      // If saved year exists and is available, use it
      if (savedYear !== null && availableYears.includes(savedYear)) {
        yearToLoad = savedYear;
      }

      // Load the selected year
      const config = await cardLoader.loadCardConfig(yearToLoad);
      setCardConfig(config);
      
      // Save the loaded year to localStorage
      saveSelectedYear(yearToLoad);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load card configuration:', error);
      setLoadError(error instanceof Error ? error : new Error('Unknown error'));
      setLoading(false);
    }
  };

  const handleRetryWithDefault = () => {
    setCardConfig(DEFAULT_CARD_CONFIG);
    setLoadError(null);
  };

  // Load initial card configuration
  useEffect(() => {
    loadCardConfiguration();
  }, []);

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error screen with option to continue with default
  if (loadError && !cardConfig) {
    return <CardLoadErrorScreen error={loadError} onRetry={handleRetryWithDefault} />;
  }

  // Card config should be loaded at this point
  if (!cardConfig) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <GameProvider initialCardConfig={cardConfig}>
        <GameBoard />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
