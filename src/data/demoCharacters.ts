import type { CharacterRecord } from '../types/domain';

const now = new Date().toISOString();

const palette = [
  [0xf1c7a5, 0x2f2a27, 0x6f65d8],
  [0xc88b65, 0x151515, 0xd76565],
  [0xe3b38f, 0x6b432f, 0x48a17d],
  [0x9b6548, 0x211912, 0xe09a3e],
  [0xf0cdb2, 0xb96542, 0x4c73bc],
  [0xbf805d, 0x3b2520, 0x9865c7],
];

const names = [
  'Ada',
  'Bora',
  'Cem',
  'Defne',
  'Ege',
  'Lara',
  'Mert',
  'Nehir',
  'Rüzgar',
  'Selin',
  'Tuna',
  'Yasemin',
];

export const DEMO_CHARACTERS: CharacterRecord[] = names.map((displayName, index) => {
  const colors = palette[index % palette.length];

  return {
    id: crypto.randomUUID(),
    displayName,
    primaryLocationId: index % 3 === 0 ? 'itk' : index % 3 === 1 ? 'istanbul' : 'plaza',
    traits: {
      appearance: 5 + (index % 5),
      intelligence: 4 + ((index * 3) % 7),
      kindness: 5 + ((index * 2) % 6),
      humor: 4 + ((index * 5) % 7),
      extroversion: 3 + ((index * 4) % 8),
    },
    personalValue: 5 + (index % 6),
    favorite: index < 2,
    pinned: false,
    status: 'active',
    appearance: {
      skin: colors[0],
      hair: colors[1],
      outfit: colors[2],
    },
    createdAt: now,
    updatedAt: now,
  };
});
