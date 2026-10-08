# Mii — People Plaza

A local-first personal social simulation. People live as small NPCs in a lightweight 2.5D plaza while their real data stays in your browser.

## Current foundation

- React + TypeScript UI
- Phaser plaza simulation
- Dexie / IndexedDB persistence
- Excel import for the existing score sheet
- 24-character active rendering cap
- clickable NPC profiles
- editable traits, Personal Value and location
- automatic local history records
- GitHub Pages deployment workflow
- no real personal dataset committed to the repository

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Excel format

The importer recognizes:

- `Display Name`
- `Görünüm`
- `Zeka`
- `İyilik`
- `Espri Anlayışı`
- `Dışa Dönüklük`

Blank scores remain `null`, not zero.

Import happens entirely in the browser. The current MVP replaces the local demo/database records with the imported sheet.

## Privacy

This repository is public. Do **not** commit real names, scores, notes, inside jokes or relationship data.

Personal data belongs in IndexedDB and future encrypted exports/cloud sync.

## Docs

- [Architecture](docs/ARCHITECTURE.md)

## Roadmap

1. Notes + history timeline
2. Character creator
3. Tags / superlative tags
4. Relationships + inside jokes
5. PNG signature items
6. Custom location themes and walk zones
7. Weighted NPC population
8. Encrypted backups
9. Optional private sync
