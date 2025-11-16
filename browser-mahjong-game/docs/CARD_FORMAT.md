# Card Configuration Format

This document describes the JSON format for defining American Mahjong card configurations. Card configurations specify the valid winning hand patterns for a given year.

## Table of Contents

- [Overview](#overview)
- [File Structure](#file-structure)
- [Configuration Properties](#configuration-properties)
- [Pattern Definition](#pattern-definition)
- [Tile Requirements](#tile-requirements)
- [Tile Types](#tile-types)
- [Pattern Examples](#pattern-examples)
- [Validation Rules](#validation-rules)
- [Creating New Cards](#creating-new-cards)

## Overview

American Mahjong uses yearly card configurations that define valid winning hand patterns. Each year, the National Mah Jongg League publishes a new card with different patterns. This system allows you to create and use any year's card configuration.

### File Location

Card configuration files are stored in:
```
public/cards/
├── 2024.json
├── 2025.json
├── card-schema.json
└── manifest.json
```

### File Naming

Card files must be named `{year}.json` where `{year}` is a four-digit year (e.g., `2024.json`, `2025.json`).

## File Structure

A card configuration file has three main sections:

```json
{
  "year": 2025,
  "version": "1.0",
  "patterns": [
    // Array of hand patterns
  ]
}
```

### Top-Level Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `year` | integer | Yes | The year this card is for (e.g., 2025) |
| `version` | string | Yes | Version number in format "X.Y" (e.g., "1.0") |
| `patterns` | array | Yes | Array of valid winning hand patterns |

## Configuration Properties

### Year

The year this card configuration represents.

```json
"year": 2025
```

- Must be an integer
- Typically 2000 or later
- Used for display and file identification

### Version

Version of the card configuration.

```json
"version": "1.0"
```

- Format: "major.minor" (e.g., "1.0", "1.1", "2.0")
- Increment minor version for small corrections
- Increment major version for significant changes

### Patterns

Array of hand patterns that constitute valid winning hands.

```json
"patterns": [
  {
    "id": "pattern_id",
    "name": "Pattern Name",
    "category": "Category",
    "points": 25,
    "tiles": [...]
  }
]
```

## Pattern Definition

Each pattern represents a valid winning hand configuration.

### Pattern Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the pattern |
| `name` | string | Yes | Display name shown to players |
| `category` | string | Yes | Category grouping (e.g., "Year", "Consecutive") |
| `points` | integer | Yes | Point value of the pattern |
| `tiles` | array | Yes | Array of tile requirements |

### Example Pattern

```json
{
  "id": "2468",
  "name": "2468",
  "category": "Evens",
  "points": 25,
  "tiles": [
    {
      "type": "any",
      "count": 3,
      "values": [2],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 3,
      "values": [4],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 3,
      "values": [6],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 3,
      "values": [8],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": true
    }
  ]
}
```

This pattern requires:
- 3 tiles with value 2 (any suit)
- 3 tiles with value 4 (any suit)
- 3 tiles with value 6 (any suit)
- 3 tiles with value 8 (any suit)
- 2 tiles of any type (pair)
- Total: 14 tiles

## Tile Requirements

Each tile requirement specifies a group of tiles needed for the pattern.

### Tile Requirement Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Type of tiles (see [Tile Types](#tile-types)) |
| `count` | integer | Yes | Number of tiles required (1-14) |
| `sequence` | boolean | No | Whether tiles must be sequential (default: false) |
| `values` | array | No | Specific values required or allowed |
| `jokerAllowed` | boolean | Yes | Whether jokers can substitute |

### Basic Tile Requirement

```json
{
  "type": "bamboo",
  "count": 3,
  "values": [1],
  "jokerAllowed": true
}
```

This requires 3 bamboo tiles with value 1.

### Sequential Tiles

```json
{
  "type": "same_suit",
  "count": 9,
  "sequence": true,
  "values": [1, 2, 3, 4, 5, 6, 7, 8, 9],
  "jokerAllowed": true
}
```

This requires 9 tiles in sequence (1-2-3-4-5-6-7-8-9) all from the same suit.

### Flexible Values

```json
{
  "type": "any",
  "count": 3,
  "values": [1, 9],
  "jokerAllowed": true
}
```

This requires 3 tiles that are either 1s or 9s from any suit.

### Any Tiles

```json
{
  "type": "any",
  "count": 2,
  "jokerAllowed": true
}
```

This requires 2 tiles of any type (typically used for the pair).

## Tile Types

### Standard Tile Types

| Type | Description | Valid Values |
|------|-------------|--------------|
| `bamboo` | Bamboo suit tiles | 1-9 |
| `character` | Character suit tiles | 1-9 |
| `dot` | Dot suit tiles | 1-9 |
| `wind` | Wind tiles | "east", "south", "west", "north" |
| `dragon` | Dragon tiles | "red", "green", "white" |
| `flower` | Flower tiles | 1-4 (rarely used) |
| `joker` | Joker tiles | N/A |

### Special Tile Types

| Type | Description | Usage |
|------|-------------|-------|
| `any` | Any tile type | When suit doesn't matter |
| `same_suit` | All from one suit | For runs and suited patterns |

### Tile Type Examples

#### Specific Suit and Value

```json
{
  "type": "bamboo",
  "count": 3,
  "values": [5],
  "jokerAllowed": true
}
```

Requires 3 bamboo 5s.

#### Specific Wind

```json
{
  "type": "wind",
  "count": 3,
  "values": ["east"],
  "jokerAllowed": false
}
```

Requires 3 east wind tiles (no jokers allowed).

#### Specific Dragon

```json
{
  "type": "dragon",
  "count": 3,
  "values": ["red"],
  "jokerAllowed": false
}
```

Requires 3 red dragon tiles (no jokers allowed).

#### Any Suit, Specific Value

```json
{
  "type": "any",
  "count": 3,
  "values": [3],
  "jokerAllowed": true
}
```

Requires 3 tiles with value 3 from any suit (bamboo 3, character 3, or dot 3).

## Pattern Examples

### Year Pattern (2025)

```json
{
  "id": "2025_year",
  "name": "2025",
  "category": "Year",
  "points": 25,
  "tiles": [
    {
      "type": "any",
      "count": 2,
      "values": [2],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 4,
      "values": [0],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 4,
      "values": [2],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 4,
      "values": [5],
      "jokerAllowed": true
    }
  ]
}
```

Pattern: 2-0-0-0-0-2-2-2-2-5-5-5-5 (pair)

### Consecutive Run

```json
{
  "id": "consecutive_run",
  "name": "Consecutive Run",
  "category": "Consecutive",
  "points": 25,
  "tiles": [
    {
      "type": "same_suit",
      "count": 9,
      "sequence": true,
      "values": [1, 2, 3, 4, 5, 6, 7, 8, 9],
      "jokerAllowed": true
    },
    {
      "type": "wind",
      "count": 3,
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": true
    }
  ]
}
```

Pattern: 1-2-3-4-5-6-7-8-9 (same suit) + 3 winds + pair

### Winds and Dragons

```json
{
  "id": "winds_dragons",
  "name": "Winds and Dragons",
  "category": "Winds-Dragons",
  "points": 25,
  "tiles": [
    {
      "type": "wind",
      "count": 3,
      "jokerAllowed": false
    },
    {
      "type": "wind",
      "count": 3,
      "jokerAllowed": false
    },
    {
      "type": "dragon",
      "count": 3,
      "jokerAllowed": false
    },
    {
      "type": "dragon",
      "count": 3,
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": true
    }
  ]
}
```

Pattern: 3 winds + 3 winds + 3 dragons + 3 dragons + pair

### Like Numbers

```json
{
  "id": "like_numbers",
  "name": "Like Numbers",
  "category": "Like Numbers",
  "points": 30,
  "tiles": [
    {
      "type": "bamboo",
      "count": 3,
      "values": [5],
      "jokerAllowed": true
    },
    {
      "type": "character",
      "count": 3,
      "values": [5],
      "jokerAllowed": true
    },
    {
      "type": "dot",
      "count": 3,
      "values": [5],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 3,
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": true
    }
  ]
}
```

Pattern: 3 bamboo 5s + 3 character 5s + 3 dot 5s + 3 any + pair

### Seven Pairs

```json
{
  "id": "seven_pairs",
  "name": "Seven Pairs",
  "category": "Pairs",
  "points": 25,
  "tiles": [
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": false
    }
  ]
}
```

Pattern: 7 pairs (no jokers allowed)

### Quints (Five of a Kind)

```json
{
  "id": "quints",
  "name": "Quints",
  "category": "Quints",
  "points": 30,
  "tiles": [
    {
      "type": "any",
      "count": 5,
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 5,
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 2,
      "jokerAllowed": true
    }
  ]
}
```

Pattern: 5 matching + 5 matching + pair + pair

### Thirteen Wonders (Special Hand)

```json
{
  "id": "thirteen_wonders",
  "name": "Thirteen Wonders",
  "category": "Special",
  "points": 50,
  "tiles": [
    {
      "type": "bamboo",
      "count": 1,
      "values": [1],
      "jokerAllowed": false
    },
    {
      "type": "bamboo",
      "count": 1,
      "values": [9],
      "jokerAllowed": false
    },
    {
      "type": "character",
      "count": 1,
      "values": [1],
      "jokerAllowed": false
    },
    {
      "type": "character",
      "count": 1,
      "values": [9],
      "jokerAllowed": false
    },
    {
      "type": "dot",
      "count": 1,
      "values": [1],
      "jokerAllowed": false
    },
    {
      "type": "dot",
      "count": 1,
      "values": [9],
      "jokerAllowed": false
    },
    {
      "type": "wind",
      "count": 1,
      "values": ["east"],
      "jokerAllowed": false
    },
    {
      "type": "wind",
      "count": 1,
      "values": ["south"],
      "jokerAllowed": false
    },
    {
      "type": "wind",
      "count": 1,
      "values": ["west"],
      "jokerAllowed": false
    },
    {
      "type": "wind",
      "count": 1,
      "values": ["north"],
      "jokerAllowed": false
    },
    {
      "type": "dragon",
      "count": 1,
      "values": ["red"],
      "jokerAllowed": false
    },
    {
      "type": "dragon",
      "count": 1,
      "values": ["green"],
      "jokerAllowed": false
    },
    {
      "type": "dragon",
      "count": 1,
      "values": ["white"],
      "jokerAllowed": false
    },
    {
      "type": "any",
      "count": 1,
      "jokerAllowed": false
    }
  ]
}
```

Pattern: All terminals (1s and 9s), all winds, all dragons, plus one duplicate

## Validation Rules

### Structural Validation

The game validates card configurations on load:

1. **Required Fields**: All required properties must be present
2. **Data Types**: Properties must have correct types (string, integer, boolean, array)
3. **Value Ranges**: Numbers must be within valid ranges
4. **Tile Count**: Total tiles in a pattern should equal 14

### Logical Validation

1. **Unique IDs**: Each pattern must have a unique ID
2. **Valid Tile Types**: Tile types must be from the allowed list
3. **Valid Values**: Tile values must be appropriate for the type
4. **Joker Rules**: Joker restrictions should follow standard rules

### Common Validation Errors

#### Missing Required Field

```json
{
  "id": "pattern_1",
  "name": "Pattern Name",
  // Missing "category", "points", and "tiles"
}
```

**Error**: Pattern missing required fields

#### Invalid Tile Count

```json
{
  "type": "bamboo",
  "count": 15,  // Exceeds maximum
  "jokerAllowed": true
}
```

**Error**: Tile count must be between 1 and 14

#### Invalid Tile Type

```json
{
  "type": "invalid_type",  // Not a valid tile type
  "count": 3,
  "jokerAllowed": true
}
```

**Error**: Invalid tile type

#### Mismatched Values

```json
{
  "type": "wind",
  "count": 3,
  "values": [1, 2, 3],  // Winds don't have numeric values
  "jokerAllowed": false
}
```

**Error**: Invalid values for tile type

## Creating New Cards

### Step-by-Step Guide

1. **Create File**
   ```bash
   touch public/cards/2026.json
   ```

2. **Add Basic Structure**
   ```json
   {
     "year": 2026,
     "version": "1.0",
     "patterns": []
   }
   ```

3. **Add Patterns**
   - Start with simple patterns
   - Test each pattern individually
   - Gradually add more complex patterns

4. **Validate**
   - Load the game with your new card
   - Check browser console for errors
   - Test pattern matching in-game

5. **Test Thoroughly**
   - Try to win with each pattern
   - Verify joker substitution works correctly
   - Ensure AI can use the patterns

### Best Practices

1. **Use Descriptive IDs**: Make pattern IDs clear and unique
   ```json
   "id": "2026_year"  // Good
   "id": "pattern1"   // Less clear
   ```

2. **Consistent Naming**: Use consistent category names
   ```json
   "category": "Year"           // Good
   "category": "Year Patterns"  // Inconsistent
   ```

3. **Appropriate Points**: Assign points based on difficulty
   - Simple patterns: 25 points
   - Medium patterns: 30 points
   - Complex patterns: 40-50 points

4. **Joker Rules**: Follow standard American Mahjong joker rules
   - Jokers typically allowed for number tiles
   - Jokers not allowed for winds, dragons, or special hands
   - Some patterns prohibit jokers entirely

5. **Total Tiles**: Ensure patterns total 14 tiles
   ```json
   // 3 + 3 + 3 + 3 + 2 = 14 ✓
   ```

6. **Test Patterns**: Verify each pattern is achievable
   - Check tile availability (only 4 of each tile)
   - Ensure pattern doesn't require impossible combinations

### Example: Creating a New Pattern

Let's create a "2026" year pattern:

```json
{
  "id": "2026_year",
  "name": "2026",
  "category": "Year",
  "points": 25,
  "tiles": [
    {
      "type": "any",
      "count": 2,
      "values": [2],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 4,
      "values": [0],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 4,
      "values": [2],
      "jokerAllowed": true
    },
    {
      "type": "any",
      "count": 4,
      "values": [6],
      "jokerAllowed": true
    }
  ]
}
```

This creates: 2-0-0-0-0-2-2-2-2-6-6-6-6 (pair)

### Troubleshooting

#### Pattern Not Recognized

- Check that tile counts sum to 14
- Verify all required fields are present
- Ensure JSON syntax is valid (no trailing commas)

#### Jokers Not Working

- Check `jokerAllowed` is set to `true`
- Verify tile type allows jokers
- Ensure pattern logic supports joker substitution

#### AI Not Using Pattern

- Verify pattern is achievable with available tiles
- Check that pattern difficulty is reasonable
- Ensure tile requirements are clear

## Schema Reference

The complete JSON schema is available in `public/cards/card-schema.json`. Use this for validation and IDE autocomplete support.

## Additional Resources

- See `2024.json` and `2025.json` for complete examples
- Refer to `DEVELOPER.md` for implementation details
- Check `HandValidator.ts` for pattern matching logic
- Review official American Mahjong rules for pattern guidelines
