import React, { useState } from 'react';
import { Difficulty } from '../../engine/ai/Strategy';
import './DifficultySelector.css';

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onDifficultySelect: (difficulty: Difficulty) => void;
}

/**
 * DifficultySelector component allows the player to select AI difficulty level
 */
export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultySelect
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const difficulties = [
    { value: Difficulty.EASY, label: 'Easy' },
    { value: Difficulty.MEDIUM, label: 'Medium' },
    { value: Difficulty.HARD, label: 'Hard' }
  ];

  const handleDifficultySelect = (difficulty: Difficulty) => {
    if (difficulty !== selectedDifficulty) {
      onDifficultySelect(difficulty);
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getCurrentLabel = () => {
    const current = difficulties.find(d => d.value === selectedDifficulty);
    return current?.label || 'Medium';
  };

  return (
    <div className="difficulty-selector">
      <label className="difficulty-selector-label">Difficulty:</label>
      
      <div className="difficulty-selector-dropdown">
        <button
          className="difficulty-selector-button"
          onClick={toggleDropdown}
        >
          {getCurrentLabel()}
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="difficulty-selector-menu">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                className={`difficulty-selector-option ${
                  diff.value === selectedDifficulty ? 'difficulty-selector-option-selected' : ''
                }`}
                onClick={() => handleDifficultySelect(diff.value)}
              >
                {diff.label}
                {diff.value === selectedDifficulty && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
