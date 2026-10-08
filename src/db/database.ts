import Dexie, { type Table } from 'dexie';
import { DEMO_CHARACTERS } from '../data/demoCharacters';
import type {
  CharacterRecord,
  HistoryEntry,
  Score,
  TraitKey,
} from '../types/domain';

class PeoplePlazaDatabase extends Dexie {
  characters!: Table<CharacterRecord, string>;
  history!: Table<HistoryEntry, string>;

  constructor() {
    super('mii-people-plaza');

    this.version(1).stores({
      characters: 'id, displayName, primaryLocationId, favorite, status, updatedAt',
      history: 'id, characterId, type, timestamp',
    });
  }
}

export const db = new PeoplePlazaDatabase();

export async function initialiseDemoData(): Promise<void> {
  const count = await db.characters.count();
  if (count === 0) await db.characters.bulkAdd(DEMO_CHARACTERS);
}

export async function updateTrait(
  characterId: string,
  trait: TraitKey,
  value: Score,
): Promise<void> {
  const character = await db.characters.get(characterId);
  if (!character) return;

  const oldValue = character.traits[trait];
  const updatedAt = new Date().toISOString();

  await db.transaction('rw', db.characters, db.history, async () => {
    await db.characters.update(characterId, {
      traits: { ...character.traits, [trait]: value },
      updatedAt,
    });

    await db.history.add({
      id: crypto.randomUUID(),
      characterId,
      type: 'SCORE_CHANGED',
      field: trait,
      oldValue,
      newValue: value,
      timestamp: updatedAt,
    });
  });
}

export async function updatePersonalValue(
  characterId: string,
  value: Score,
): Promise<void> {
  const character = await db.characters.get(characterId);
  if (!character) return;

  const updatedAt = new Date().toISOString();

  await db.transaction('rw', db.characters, db.history, async () => {
    await db.characters.update(characterId, { personalValue: value, updatedAt });
    await db.history.add({
      id: crypto.randomUUID(),
      characterId,
      type: 'SCORE_CHANGED',
      field: 'personalValue',
      oldValue: character.personalValue,
      newValue: value,
      timestamp: updatedAt,
    });
  });
}

export async function updateLocation(
  characterId: string,
  locationId: string,
): Promise<void> {
  const character = await db.characters.get(characterId);
  if (!character) return;

  const updatedAt = new Date().toISOString();

  await db.transaction('rw', db.characters, db.history, async () => {
    await db.characters.update(characterId, {
      primaryLocationId: locationId,
      updatedAt,
    });

    await db.history.add({
      id: crypto.randomUUID(),
      characterId,
      type: 'LOCATION_CHANGED',
      field: 'primaryLocationId',
      oldValue: character.primaryLocationId,
      newValue: locationId,
      timestamp: updatedAt,
    });
  });
}
