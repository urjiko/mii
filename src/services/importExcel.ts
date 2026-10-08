import * as XLSX from 'xlsx';
import { db } from '../db/database';
import type { CharacterRecord, Score, TraitScores } from '../types/domain';

type RawRow = Record<string, unknown>;

function score(value: unknown): Score {
  if (value === null || value === undefined || value === '') return null;

  const normalized =
    typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);

  if (!Number.isFinite(normalized)) return null;
  return Math.max(0, Math.min(10, normalized));
}

function createAppearance(index: number) {
  const skins = [0xf1c7a5, 0xe4b18a, 0xc98c67, 0xa76c4d, 0x845039];
  const hairs = [0x1f1b18, 0x4b3024, 0x7a5135, 0xb16b3b, 0xd2b16d];
  const outfits = [0x6f65d8, 0x4c73bc, 0x48a17d, 0xd76565, 0xe09a3e];

  return {
    skin: skins[index % skins.length],
    hair: hairs[(index * 2) % hairs.length],
    outfit: outfits[(index * 3) % outfits.length],
  };
}

function mapTraits(row: RawRow): TraitScores {
  return {
    appearance: score(row['Görünüm']),
    intelligence: score(row['Zeka']),
    kindness: score(row['İyilik']),
    humor: score(row['Espri Anlayışı']),
    extroversion: score(row['Dışa Dönüklük']),
  };
}

export async function importExcel(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(bytes, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!firstSheet) {
    throw new Error('Excel dosyasında okunabilir bir sayfa bulunamadı.');
  }

  const rows = XLSX.utils.sheet_to_json<RawRow>(firstSheet, { defval: null });
  const now = new Date().toISOString();

  const characters: CharacterRecord[] = rows
    .map((row, index) => {
      const displayName = String(
        row['Display Name'] ?? row['İsim'] ?? row['Name'] ?? '',
      ).trim();

      if (!displayName) return null;

      return {
        id: crypto.randomUUID(),
        displayName,
        primaryLocationId: 'plaza',
        traits: mapTraits(row),
        personalValue: null,
        favorite: false,
        pinned: false,
        status: 'active' as const,
        appearance: createAppearance(index),
        createdAt: now,
        updatedAt: now,
      };
    })
    .filter((value): value is CharacterRecord => Boolean(value));

  await db.transaction('rw', db.characters, db.history, async () => {
    await db.history.clear();
    await db.characters.clear();
    await db.characters.bulkAdd(characters);
    await db.history.bulkAdd(
      characters.map((character) => ({
        id: crypto.randomUUID(),
        characterId: character.id,
        type: 'IMPORT' as const,
        note: 'Excel import',
        timestamp: now,
      })),
    );
  });

  return characters.length;
}
