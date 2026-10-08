export type TraitKey =
  | 'appearance'
  | 'intelligence'
  | 'kindness'
  | 'humor'
  | 'extroversion';

export type Score = number | null;

export interface TraitScores {
  appearance: Score;
  intelligence: Score;
  kindness: Score;
  humor: Score;
  extroversion: Score;
}

export interface AppearanceConfig {
  skin: number;
  hair: number;
  outfit: number;
}

export type CharacterStatus =
  | 'active'
  | 'occasional'
  | 'past'
  | 'lost-contact'
  | 'archived';

export interface CharacterRecord {
  id: string;
  displayName: string;
  primaryLocationId: string;
  traits: TraitScores;
  personalValue: Score;
  favorite: boolean;
  pinned: boolean;
  status: CharacterStatus;
  appearance: AppearanceConfig;
  createdAt: string;
  updatedAt: string;
}

export type HistoryType =
  | 'CHARACTER_CREATED'
  | 'SCORE_CHANGED'
  | 'LOCATION_CHANGED'
  | 'IMPORT';

export interface HistoryEntry {
  id: string;
  characterId: string;
  type: HistoryType;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  note?: string;
  timestamp: string;
}
