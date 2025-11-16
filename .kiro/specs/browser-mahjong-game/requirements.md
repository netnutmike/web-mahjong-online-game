# Requirements Document

## Introduction

This document specifies the requirements for a browser-based American Mahjong practice game. The system enables players to practice mahjong against three AI opponents without requiring backend connectivity or user authentication. The game supports multiple yearly card configurations to accommodate the annual rule changes in American Mahjong.

## Glossary

- **Game System**: The browser-based mahjong application
- **Player**: The human user playing the game
- **AI Opponent**: A computer-controlled player that makes automated game decisions
- **Card Configuration**: The set of valid winning hand patterns for a specific year
- **Game Session**: A single complete game from deal to completion
- **Hand Pattern**: A specific combination of tiles that constitutes a valid winning hand
- **Tile**: A game piece used in mahjong

## Requirements

### Requirement 1

**User Story:** As a mahjong learner, I want to play a complete game in my browser, so that I can practice without needing other players or server connectivity

#### Acceptance Criteria

1. THE Game System SHALL render a complete mahjong game interface in the browser
2. THE Game System SHALL execute all game logic client-side without server communication
3. WHEN the Player opens the application, THE Game System SHALL initialize a new game session with three AI Opponents
4. THE Game System SHALL display the Player's tiles, the game board, and AI Opponent indicators
5. WHEN the Player completes a turn, THE Game System SHALL process AI Opponent turns sequentially

### Requirement 2

**User Story:** As a mahjong player, I want to select which year's card to play with, so that I can practice with the current or past year's rules

#### Acceptance Criteria

1. THE Game System SHALL provide a card year selection interface
2. WHEN the Player accesses the card selection interface, THE Game System SHALL display all available card years
3. WHEN the Player selects a card year, THE Game System SHALL load the corresponding Hand Patterns for that year
4. THE Game System SHALL persist the selected card year for the current Game Session
5. THE Game System SHALL validate winning hands against the selected year's Hand Patterns

### Requirement 3

**User Story:** As a game administrator, I want to add new card configurations by editing files, so that I can add each year's new card patterns to the system

#### Acceptance Criteria

1. THE Game System SHALL load card configurations from JSON or YAML files in the project directory
2. THE Game System SHALL parse card configuration files containing card year, pattern names, and tile requirements
3. WHEN the Game System loads a card configuration file, THE Game System SHALL validate that Hand Patterns contain valid tile combinations
4. THE Game System SHALL provide documentation on the card configuration file format
5. THE Game System SHALL display an error message if a card configuration file is malformed

### Requirement 4

**User Story:** As a player, I want the AI opponents to make reasonable game decisions, so that I can practice against realistic gameplay

#### Acceptance Criteria

1. WHEN an AI Opponent's turn begins, THE Game System SHALL evaluate available tiles and Hand Patterns
2. THE AI Opponent SHALL select a tile to discard within two seconds
3. THE AI Opponent SHALL call tiles (pung, kong, or mahjong) when strategically appropriate
4. THE Game System SHALL ensure AI Opponents follow all standard mahjong rules
5. THE AI Opponent SHALL pursue valid Hand Patterns from the selected card year

### Requirement 5

**User Story:** As a player, I want to perform standard mahjong actions, so that I can play the game according to official rules

#### Acceptance Criteria

1. WHEN the Player's turn begins, THE Game System SHALL enable tile selection and discard actions
2. WHEN another player discards a tile, THE Game System SHALL detect if the Player can call that tile
3. IF the Player can call a discarded tile, THEN THE Game System SHALL display call options (pung, kong, or mahjong)
4. WHEN the Player declares mahjong, THE Game System SHALL validate the hand against selected year's Hand Patterns
5. THE Game System SHALL enforce turn order and standard mahjong gameplay rules

### Requirement 6

**User Story:** As a player, I want to see my current tiles and the game state clearly, so that I can make informed decisions

#### Acceptance Criteria

1. THE Game System SHALL display the Player's tiles in an organized rack
2. THE Game System SHALL display all discarded tiles in the center area
3. THE Game System SHALL display exposed tile sets for all players
4. THE Game System SHALL indicate which player's turn is active
5. WHEN a tile is drawn or discarded, THE Game System SHALL update the display within 500 milliseconds

### Requirement 7

**User Story:** As a player, I want the game to detect when someone wins, so that the game concludes properly

#### Acceptance Criteria

1. WHEN any player declares mahjong, THE Game System SHALL validate the winning hand
2. IF the hand is valid, THEN THE Game System SHALL end the Game Session and display the winning hand
3. IF the hand is invalid, THEN THE Game System SHALL display an error message and continue the game
4. WHEN the wall is exhausted with no winner, THE Game System SHALL declare the game a draw
5. WHEN a Game Session ends, THE Game System SHALL display a button to start a new game
6. THE Game System SHALL allow unlimited Game Sessions without restrictions

### Requirement 8

**User Story:** As a player, I want the game to use modern web technology, so that I have a smooth and responsive experience

#### Acceptance Criteria

1. THE Game System SHALL be built using a modern JavaScript framework
2. THE Game System SHALL render at 60 frames per second during animations
3. THE Game System SHALL be responsive and functional on desktop browsers
4. THE Game System SHALL load and initialize within three seconds on standard broadband connections
5. THE Game System SHALL store all game data in browser local storage

### Requirement 9

**User Story:** As a developer, I want the project to follow best practices for open source development, so that the codebase is maintainable and legally compliant

#### Acceptance Criteria

1. THE Game System SHALL be licensed under GPL-3.0
2. THE Game System SHALL include a LICENSE file containing the full GPL-3.0 license text
3. THE Game System SHALL use Git for version control
4. THE Game System SHALL include a .gitignore file configured for the chosen technology stack
5. WHERE dependency management is required, THE Game System SHALL include Renovate configuration for automated dependency updates

### Requirement 10

**User Story:** As a developer or contributor, I want comprehensive documentation, so that I can understand and contribute to the project effectively

#### Acceptance Criteria

1. THE Game System SHALL include a README.md file with project overview, setup instructions, and usage guidelines
2. THE Game System SHALL include a CONTRIBUTING.md file with contribution guidelines
3. THE Game System SHALL include developer documentation explaining the architecture and key components
4. THE Game System SHALL include inline code comments for complex logic
5. THE Game System SHALL document all public APIs and interfaces
