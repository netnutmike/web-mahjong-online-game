import type { CardConfig, HandPattern, TileRequirement } from './CardTypes';
import { TileType } from '../engine/tiles/Tile';

/**
 * Validation result for card configurations
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates card configurations for structural and semantic correctness
 */
export class CardValidator {
  /**
   * Validate a complete card configuration
   */
  validateCardConfig(config: CardConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic structure
    if (!config.year || typeof config.year !== 'number') {
      errors.push('Missing or invalid year');
    }

    if (!config.version || typeof config.version !== 'string') {
      errors.push('Missing or invalid version');
    }

    if (!config.patterns || !Array.isArray(config.patterns)) {
      errors.push('Missing or invalid patterns array');
      return { valid: false, errors, warnings };
    }

    if (config.patterns.length === 0) {
      errors.push('Card configuration must contain at least one pattern');
    }

    // Validate each pattern
    const patternIds = new Set<string>();
    for (let i = 0; i < config.patterns.length; i++) {
      const pattern = config.patterns[i];
      const patternResult = this.validatePattern(pattern, i);
      
      errors.push(...patternResult.errors);
      warnings.push(...patternResult.warnings);

      // Check for duplicate pattern IDs
      if (pattern.id) {
        if (patternIds.has(pattern.id)) {
          errors.push(`Duplicate pattern ID: ${pattern.id}`);
        }
        patternIds.add(pattern.id);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a single hand pattern
   */
  validatePattern(pattern: HandPattern, index?: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const prefix = index !== undefined ? `Pattern ${index}` : 'Pattern';

    // Validate required fields
    if (!pattern.id || typeof pattern.id !== 'string') {
      errors.push(`${prefix}: Missing or invalid id`);
    }

    if (!pattern.name || typeof pattern.name !== 'string') {
      errors.push(`${prefix}: Missing or invalid name`);
    }

    if (!pattern.category || typeof pattern.category !== 'string') {
      errors.push(`${prefix}: Missing or invalid category`);
    }

    if (typeof pattern.points !== 'number') {
      errors.push(`${prefix}: Missing or invalid points`);
    } else if (pattern.points < 0) {
      errors.push(`${prefix}: Points cannot be negative`);
    } else if (pattern.points === 0) {
      warnings.push(`${prefix}: Pattern has 0 points`);
    }

    if (!pattern.tiles || !Array.isArray(pattern.tiles)) {
      errors.push(`${prefix}: Missing or invalid tiles array`);
      return { valid: false, errors, warnings };
    }

    if (pattern.tiles.length === 0) {
      errors.push(`${prefix}: Must have at least one tile requirement`);
    }

    // Validate tile requirements
    let totalTileCount = 0;
    for (let i = 0; i < pattern.tiles.length; i++) {
      const reqResult = this.validateTileRequirement(pattern.tiles[i], i);
      errors.push(...reqResult.errors.map(e => `${prefix}, ${e}`));
      warnings.push(...reqResult.warnings.map(w => `${prefix}, ${w}`));
      
      totalTileCount += pattern.tiles[i].count || 0;
    }

    // Validate total tile count (standard mahjong hand is 14 tiles)
    if (totalTileCount !== 14) {
      warnings.push(
        `${prefix}: Total tile count is ${totalTileCount}, expected 14 for standard mahjong`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a tile requirement
   */
  validateTileRequirement(
    requirement: TileRequirement,
    index?: number
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const prefix = index !== undefined ? `Tile requirement ${index}` : 'Tile requirement';

    // Validate type
    if (!requirement.type || typeof requirement.type !== 'string') {
      errors.push(`${prefix}: Missing or invalid type`);
    } else {
      const validTypes = [
        ...Object.values(TileType),
        'any',
        'same_suit',
      ];
      
      if (!validTypes.includes(requirement.type)) {
        errors.push(`${prefix}: Invalid type "${requirement.type}"`);
      }
    }

    // Validate count
    if (typeof requirement.count !== 'number') {
      errors.push(`${prefix}: Missing or invalid count`);
    } else if (requirement.count <= 0) {
      errors.push(`${prefix}: Count must be positive`);
    } else if (requirement.count > 14) {
      warnings.push(`${prefix}: Count exceeds standard hand size (14)`);
    }

    // Validate sequence flag
    if (requirement.sequence !== undefined && typeof requirement.sequence !== 'boolean') {
      errors.push(`${prefix}: sequence must be a boolean`);
    }

    // Validate specific values
    if (requirement.specific !== undefined) {
      if (!Array.isArray(requirement.specific)) {
        errors.push(`${prefix}: specific must be an array`);
      } else if (requirement.specific.length === 0) {
        warnings.push(`${prefix}: specific array is empty`);
      }
    }

    // Validate values for sequences
    if (requirement.values !== undefined) {
      if (!Array.isArray(requirement.values)) {
        errors.push(`${prefix}: values must be an array`);
      } else if (requirement.values.length === 0) {
        warnings.push(`${prefix}: values array is empty`);
      } else if (requirement.sequence && requirement.values.length !== requirement.count) {
        warnings.push(
          `${prefix}: sequence values length (${requirement.values.length}) doesn't match count (${requirement.count})`
        );
      }
    }

    // Validate jokerAllowed
    if (typeof requirement.jokerAllowed !== 'boolean') {
      errors.push(`${prefix}: Missing or invalid jokerAllowed`);
    }

    // Semantic validation
    if (requirement.sequence && requirement.type === TileType.JOKER) {
      errors.push(`${prefix}: Jokers cannot form sequences`);
    }

    if (requirement.sequence && requirement.type === TileType.FLOWER) {
      errors.push(`${prefix}: Flowers cannot form sequences`);
    }

    if (requirement.sequence && requirement.type === TileType.DRAGON) {
      errors.push(`${prefix}: Dragons cannot form sequences`);
    }

    if (requirement.sequence && requirement.type === TileType.WIND) {
      errors.push(`${prefix}: Winds cannot form sequences`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate that tile requirements are semantically consistent
   */
  validateTileRequirementConsistency(requirements: TileRequirement[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for conflicting requirements
    const suitTypes = requirements.filter(
      r => r.type === 'same_suit'
    );

    if (suitTypes.length > 1) {
      warnings.push('Multiple "same_suit" requirements may conflict');
    }

    // Check for impossible combinations
    const totalCount = requirements.reduce((sum, r) => sum + r.count, 0);
    if (totalCount > 14) {
      errors.push(`Total tile count (${totalCount}) exceeds maximum hand size (14)`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Export a singleton instance
export const cardValidator = new CardValidator();
