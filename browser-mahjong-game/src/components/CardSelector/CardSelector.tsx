import React, { useState, useEffect } from 'react';
import { cardLoader } from '../../config/CardLoader';
import './CardSelector.css';

interface CardSelectorProps {
  selectedYear: number;
  onYearSelect: (year: number) => void;
}

/**
 * CardSelector component allows the player to select which year's card to use
 * Loads available years from CardLoader and handles year selection
 */
export const CardSelector: React.FC<CardSelectorProps> = ({
  selectedYear,
  onYearSelect
}) => {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadAvailableYears();
  }, []);

  const loadAvailableYears = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const years = await cardLoader.getAvailableYears();
      setAvailableYears(years);
      
      if (years.length === 0) {
        setError('No card configurations found');
      }
    } catch (err) {
      setError('Failed to load available card years');
      console.error('Error loading available years:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearSelect = (year: number) => {
    if (year !== selectedYear) {
      onYearSelect(year);
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="card-selector">
      <label className="card-selector-label">Card Year:</label>
      
      <div className="card-selector-dropdown">
        <button
          className="card-selector-button"
          onClick={toggleDropdown}
          disabled={isLoading || error !== null}
        >
          {isLoading ? (
            'Loading...'
          ) : error ? (
            'Error'
          ) : (
            <>
              {selectedYear}
              <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </>
          )}
        </button>

        {isOpen && !isLoading && !error && (
          <div className="card-selector-menu">
            {availableYears.map((year) => (
              <button
                key={year}
                className={`card-selector-option ${
                  year === selectedYear ? 'card-selector-option-selected' : ''
                }`}
                onClick={() => handleYearSelect(year)}
              >
                {year}
                {year === selectedYear && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="card-selector-error">{error}</div>}
    </div>
  );
};
