# Architecture

## Core rule

**Data drives the world.**

The repository contains the application and default visual assets. Real people, scores, private notes and relationship data must stay out of the public repository.

## Runtime layers

### React
Owns the application shell, directory, profile panels, editors, search and future timeline screens.

### Phaser
Owns only the living plaza: NPC rendering, wandering, encounters, speech bubbles and scene interaction.

### Dexie / IndexedDB
Owns local persistent data. This allows hundreds or thousands of people without publishing private information to GitHub.

## Character population strategy

The database can contain 500+ people. Only a small active pool is passed to Phaser.

Current MVP:
- rendered pool: 24
- offscreen characters: no movement or collision simulation

## Canon vs simulation

User-entered facts are **canon**.

Phaser-generated encounters are **simulation** and must never silently mutate canon relationship data.

## Privacy

Do not commit real character datasets, exported backups, private notes, personal ratings, inside jokes or relationship graphs.

Excel import occurs in the browser and replaces the local IndexedDB dataset.

## Next systems

1. Notes + history timeline UI
2. Character creator
3. Tags and unique superlative tags
4. Relationship graph
5. Inside-joke dialogue templates
6. PNG signature items with anchors
7. Theme editor and walk/no-walk zones
8. Weighted active population
9. Encrypted backup
10. Optional cloud sync
