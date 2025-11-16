# Contributing to Browser Mahjong Game

Thank you for your interest in contributing to the Browser Mahjong Game! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Browser and version information
- Screenshots or error messages if applicable

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:

- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Submitting Changes

1. **Fork the Repository**
   - Fork the project to your GitHub account
   - Clone your fork locally

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Follow the code style guidelines below
   - Write clear, concise commit messages
   - Add tests if applicable
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template with details

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Enable strict type checking
- Avoid `any` types - use proper type definitions
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Maximum line length: 100 characters
- Use trailing commas in multi-line objects and arrays

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types with TypeScript interfaces
- Organize imports: React, third-party, local components, utilities

Example:
```typescript
import React, { useState } from 'react';
import { Tile } from '../../engine/tiles/Tile';
import './TileRack.css';

interface TileRackProps {
  tiles: Tile[];
  onTileSelect: (tile: Tile) => void;
}

export const TileRack: React.FC<TileRackProps> = ({ tiles, onTileSelect }) => {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  
  // Component implementation
};
```

### File Organization

- One component per file
- Co-locate component files with their styles
- Use index.ts for clean exports
- Group related files in directories

Example structure:
```
components/
  TileRack/
    TileRack.tsx
    TileRack.css
    index.ts
```

### Naming Conventions

- **Components**: PascalCase (e.g., `TileRack`, `GameBoard`)
- **Files**: Match component name (e.g., `TileRack.tsx`)
- **Functions**: camelCase (e.g., `drawTile`, `validateHand`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TILES`, `DEFAULT_YEAR`)
- **Interfaces**: PascalCase with descriptive names (e.g., `GameState`, `TileProps`)
- **Enums**: PascalCase for name, UPPER_CASE for values

### Comments and Documentation

- Add JSDoc comments for public functions and classes
- Explain complex algorithms and business logic
- Keep comments up-to-date with code changes
- Use TODO comments for future improvements

Example:
```typescript
/**
 * Validates a mahjong hand against available patterns
 * @param hand - Array of tiles in the player's hand
 * @param exposedSets - Array of exposed tile sets
 * @returns Validation result with matching pattern and score
 */
validateHand(hand: Tile[], exposedSets: TileSet[]): ValidationResult {
  // Implementation
}
```

## Pull Request Guidelines

### PR Title Format

Use clear, descriptive titles:
- `feat: Add new card configuration for 2026`
- `fix: Correct AI discard selection logic`
- `docs: Update installation instructions`
- `refactor: Simplify hand validation algorithm`
- `test: Add tests for tile set validation`

### PR Description

Include in your PR description:
- Summary of changes
- Related issue numbers (e.g., "Fixes #123")
- Testing performed
- Screenshots for UI changes
- Breaking changes (if any)

### Review Process

- All PRs require at least one review
- Address review comments promptly
- Keep PRs focused and reasonably sized
- Rebase on main branch if needed

## Development Workflow

### Setting Up Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run linter:
   ```bash
   npm run lint
   ```

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test in multiple browsers when possible
- Test with different card configurations

### Building

Before submitting a PR:
```bash
npm run build
```

Ensure the build completes without errors.

## Adding New Card Configurations

When contributing new card configurations:

1. Create a new JSON file in `public/cards/`
2. Follow the schema in `card-schema.json`
3. Validate against the schema
4. Test the configuration in-game
5. Document any special patterns or rules
6. See `docs/CARD_FORMAT.md` for detailed format

## Project-Specific Guidelines

### Game Engine Changes

- Maintain backward compatibility when possible
- Document rule changes clearly
- Test with multiple card configurations
- Consider AI behavior implications

### UI Changes

- Maintain responsive design
- Test keyboard navigation
- Ensure accessibility standards
- Keep performance at 60fps

### AI Improvements

- Document strategy changes
- Test against various hand patterns
- Ensure decisions complete within 2 seconds
- Balance difficulty appropriately

## Getting Help

- Check existing issues and documentation
- Ask questions in issue comments
- Reach out to maintainers if needed

## License

By contributing to this project, you agree that your contributions will be licensed under the GPL-3.0 license.

## Recognition

Contributors will be recognized in the project. Thank you for helping make Browser Mahjong Game better!
