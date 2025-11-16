/**
 * Storage utility for managing user preferences in localStorage
 * Provides type-safe access to stored preferences
 */

const STORAGE_KEYS = {
  SELECTED_YEAR: 'mahjong_selected_year',
  SOUND_ENABLED: 'mahjong_sound_enabled',
  ANIMATION_SPEED: 'mahjong_animation_speed',
} as const;

/**
 * User preferences stored in localStorage
 */
export interface StoredPreferences {
  lastSelectedYear: number | null;
  soundEnabled: boolean;
  animationSpeed: number;
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: StoredPreferences = {
  lastSelectedYear: null,
  soundEnabled: true,
  animationSpeed: 1,
};

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get the selected card year from localStorage
 * @returns The selected year or null if not set
 */
export function getSelectedYear(): number | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_YEAR);
    if (stored === null) {
      return null;
    }

    const year = parseInt(stored, 10);
    if (isNaN(year)) {
      return null;
    }

    return year;
  } catch (error) {
    console.error('Error reading selected year from localStorage:', error);
    return null;
  }
}

/**
 * Save the selected card year to localStorage
 * @param year The year to save
 */
export function saveSelectedYear(year: number): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cannot save selected year');
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_YEAR, year.toString());
  } catch (error) {
    console.error('Error saving selected year to localStorage:', error);
  }
}

/**
 * Get sound enabled preference from localStorage
 * @returns The sound enabled preference
 */
export function getSoundEnabled(): boolean {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_PREFERENCES.soundEnabled;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    if (stored === null) {
      return DEFAULT_PREFERENCES.soundEnabled;
    }

    return stored === 'true';
  } catch (error) {
    console.error('Error reading sound enabled from localStorage:', error);
    return DEFAULT_PREFERENCES.soundEnabled;
  }
}

/**
 * Save sound enabled preference to localStorage
 * @param enabled Whether sound is enabled
 */
export function saveSoundEnabled(enabled: boolean): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cannot save sound preference');
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, enabled.toString());
  } catch (error) {
    console.error('Error saving sound enabled to localStorage:', error);
  }
}

/**
 * Get animation speed preference from localStorage
 * @returns The animation speed (default: 1)
 */
export function getAnimationSpeed(): number {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_PREFERENCES.animationSpeed;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ANIMATION_SPEED);
    if (stored === null) {
      return DEFAULT_PREFERENCES.animationSpeed;
    }

    const speed = parseFloat(stored);
    if (isNaN(speed) || speed <= 0) {
      return DEFAULT_PREFERENCES.animationSpeed;
    }

    return speed;
  } catch (error) {
    console.error('Error reading animation speed from localStorage:', error);
    return DEFAULT_PREFERENCES.animationSpeed;
  }
}

/**
 * Save animation speed preference to localStorage
 * @param speed The animation speed (must be > 0)
 */
export function saveAnimationSpeed(speed: number): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cannot save animation speed');
    return;
  }

  if (speed <= 0) {
    console.warn('Invalid animation speed, must be > 0');
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ANIMATION_SPEED, speed.toString());
  } catch (error) {
    console.error('Error saving animation speed to localStorage:', error);
  }
}

/**
 * Get all preferences from localStorage
 * @returns All stored preferences with defaults for missing values
 */
export function getAllPreferences(): StoredPreferences {
  return {
    lastSelectedYear: getSelectedYear(),
    soundEnabled: getSoundEnabled(),
    animationSpeed: getAnimationSpeed(),
  };
}

/**
 * Clear all stored preferences
 */
export function clearAllPreferences(): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cannot clear preferences');
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_YEAR);
    localStorage.removeItem(STORAGE_KEYS.SOUND_ENABLED);
    localStorage.removeItem(STORAGE_KEYS.ANIMATION_SPEED);
  } catch (error) {
    console.error('Error clearing preferences from localStorage:', error);
  }
}
