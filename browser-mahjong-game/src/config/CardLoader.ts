import type { CardConfig } from './CardTypes';

/**
 * Error thrown when card configuration loading fails
 */
export class CardLoadError extends Error {
  readonly year?: number;
  readonly cause?: unknown;

  constructor(message: string, year?: number, cause?: unknown) {
    super(message);
    this.name = 'CardLoadError';
    this.year = year;
    this.cause = cause;
  }
}

/**
 * Loads and manages card configurations from JSON files
 */
export class CardLoader {
  private cache: Map<number, CardConfig> = new Map();
  private availableYearsCache: number[] | null = null;

  /**
   * Load a card configuration for a specific year
   * @param year The year to load the card configuration for
   * @returns Promise resolving to the card configuration
   * @throws CardLoadError if the file cannot be loaded or is invalid
   */
  async loadCardConfig(year: number): Promise<CardConfig> {
    // Check cache first
    if (this.cache.has(year)) {
      return this.cache.get(year)!;
    }

    try {
      const response = await fetch(`/cards/${year}.json`);
      
      if (!response.ok) {
        throw new CardLoadError(
          `Failed to load card configuration for year ${year}: ${response.statusText}`,
          year
        );
      }

      const data = await response.json();
      const config = this.validateCardConfig(data, year);
      
      // Cache the loaded configuration
      this.cache.set(year, config);
      
      return config;
    } catch (error) {
      if (error instanceof CardLoadError) {
        throw error;
      }
      
      throw new CardLoadError(
        `Error loading card configuration for year ${year}`,
        year,
        error
      );
    }
  }

  /**
   * Get list of available card years by scanning the cards directory
   * @returns Promise resolving to array of available years
   */
  async getAvailableYears(): Promise<number[]> {
    // Return cached result if available
    if (this.availableYearsCache !== null) {
      return [...this.availableYearsCache];
    }

    // Since we can't actually scan a directory in the browser,
    // we'll try to load a manifest file or attempt to load known years
    try {
      // First, try to load a manifest file if it exists
      const response = await fetch('/cards/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        if (Array.isArray(manifest.years)) {
          const years = manifest.years as number[];
          this.availableYearsCache = years.sort((a: number, b: number) => b - a);
          return [...this.availableYearsCache];
        }
      }
    } catch {
      // Manifest doesn't exist, fall back to probing
    }

    // Fall back to probing for common years
    const currentYear = new Date().getFullYear();
    const yearsToCheck = [
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
      currentYear - 4,
    ];

    const availableYears: number[] = [];

    // Check each year in parallel
    const checks = yearsToCheck.map(async (year) => {
      try {
        const response = await fetch(`/cards/${year}.json`, { method: 'HEAD' });
        if (response.ok) {
          return year;
        }
      } catch {
        // Year not available
      }
      return null;
    });

    const results = await Promise.all(checks);
    
    for (const year of results) {
      if (year !== null) {
        availableYears.push(year);
      }
    }

    // Sort in descending order (newest first)
    availableYears.sort((a: number, b: number) => b - a);
    
    this.availableYearsCache = availableYears;
    return [...availableYears];
  }

  /**
   * Validate a card configuration object
   * @param data The data to validate
   * @param expectedYear The expected year (for validation)
   * @returns The validated CardConfig
   * @throws CardLoadError if validation fails
   */
  private validateCardConfig(data: unknown, expectedYear: number): CardConfig {
    if (!data || typeof data !== 'object') {
      throw new CardLoadError(
        'Card configuration must be an object',
        expectedYear
      );
    }

    const config = data as Record<string, unknown>;

    // Validate year
    if (typeof config.year !== 'number') {
      throw new CardLoadError(
        'Card configuration must have a numeric "year" field',
        expectedYear
      );
    }

    if (config.year !== expectedYear) {
      throw new CardLoadError(
        `Card configuration year mismatch: expected ${expectedYear}, got ${config.year}`,
        expectedYear
      );
    }

    // Validate version
    if (typeof config.version !== 'string') {
      throw new CardLoadError(
        'Card configuration must have a string "version" field',
        expectedYear
      );
    }

    // Validate patterns
    if (!Array.isArray(config.patterns)) {
      throw new CardLoadError(
        'Card configuration must have a "patterns" array',
        expectedYear
      );
    }

    if (config.patterns.length === 0) {
      throw new CardLoadError(
        'Card configuration must have at least one pattern',
        expectedYear
      );
    }

    // Validate each pattern
    for (let i = 0; i < config.patterns.length; i++) {
      const pattern = config.patterns[i];
      
      if (!pattern || typeof pattern !== 'object') {
        throw new CardLoadError(
          `Pattern at index ${i} must be an object`,
          expectedYear
        );
      }

      const p = pattern as Record<string, unknown>;

      if (typeof p.id !== 'string' || p.id.length === 0) {
        throw new CardLoadError(
          `Pattern at index ${i} must have a non-empty string "id"`,
          expectedYear
        );
      }

      if (typeof p.name !== 'string' || p.name.length === 0) {
        throw new CardLoadError(
          `Pattern at index ${i} must have a non-empty string "name"`,
          expectedYear
        );
      }

      if (typeof p.category !== 'string') {
        throw new CardLoadError(
          `Pattern at index ${i} must have a string "category"`,
          expectedYear
        );
      }

      if (typeof p.points !== 'number' || p.points < 0) {
        throw new CardLoadError(
          `Pattern at index ${i} must have a non-negative numeric "points" value`,
          expectedYear
        );
      }

      if (!Array.isArray(p.tiles) || p.tiles.length === 0) {
        throw new CardLoadError(
          `Pattern at index ${i} must have a non-empty "tiles" array`,
          expectedYear
        );
      }

      // Validate tile requirements
      for (let j = 0; j < p.tiles.length; j++) {
        this.validateTileRequirement(p.tiles[j], i, j, expectedYear);
      }
    }

    return config as unknown as CardConfig;
  }

  /**
   * Validate a tile requirement object
   */
  private validateTileRequirement(
    req: unknown,
    patternIndex: number,
    reqIndex: number,
    year: number
  ): void {
    if (!req || typeof req !== 'object') {
      throw new CardLoadError(
        `Tile requirement at pattern ${patternIndex}, index ${reqIndex} must be an object`,
        year
      );
    }

    const r = req as Record<string, unknown>;

    if (typeof r.type !== 'string') {
      throw new CardLoadError(
        `Tile requirement at pattern ${patternIndex}, index ${reqIndex} must have a string "type"`,
        year
      );
    }

    if (typeof r.count !== 'number' || r.count <= 0) {
      throw new CardLoadError(
        `Tile requirement at pattern ${patternIndex}, index ${reqIndex} must have a positive numeric "count"`,
        year
      );
    }

    if (r.sequence !== undefined && typeof r.sequence !== 'boolean') {
      throw new CardLoadError(
        `Tile requirement at pattern ${patternIndex}, index ${reqIndex} "sequence" must be a boolean if present`,
        year
      );
    }

    if (r.specific !== undefined && !Array.isArray(r.specific)) {
      throw new CardLoadError(
        `Tile requirement at pattern ${patternIndex}, index ${reqIndex} "specific" must be an array if present`,
        year
      );
    }

    if (r.values !== undefined && !Array.isArray(r.values)) {
      throw new CardLoadError(
        `Tile requirement at pattern ${patternIndex}, index ${reqIndex} "values" must be an array if present`,
        year
      );
    }

    if (typeof r.jokerAllowed !== 'boolean') {
      throw new CardLoadError(
        `Tile requirement at pattern ${patternIndex}, index ${reqIndex} must have a boolean "jokerAllowed"`,
        year
      );
    }
  }

  /**
   * Clear the cache (useful for testing or forcing reload)
   */
  clearCache(): void {
    this.cache.clear();
    this.availableYearsCache = null;
  }
}

// Export a singleton instance for convenience
export const cardLoader = new CardLoader();
