import { LOCATIONS, getLocationName } from '../data/locations';
import type { CharacterRecord, TraitKey } from '../types/domain';

const TRAITS: Array<{ key: TraitKey; label: string }> = [
  { key: 'appearance', label: 'Görünüm' },
  { key: 'intelligence', label: 'Zeka' },
  { key: 'kindness', label: 'İyilik' },
  { key: 'humor', label: 'Espri' },
  { key: 'extroversion', label: 'Dışa Dönüklük' },
];

interface CharacterPanelProps {
  character: CharacterRecord;
  onClose: () => void;
  onTraitChange: (trait: TraitKey, value: number) => Promise<void>;
  onPersonalValueChange: (value: number) => Promise<void>;
  onLocationChange: (locationId: string) => Promise<void>;
}

function overall(character: CharacterRecord): string {
  const values = Object.values(character.traits);
  if (values.some((value) => value === null)) return '—';
  const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  return (total / values.length).toFixed(1);
}

function hex(value: number): string {
  return '#' + value.toString(16).padStart(6, '0');
}

export function CharacterPanel({
  character,
  onClose,
  onTraitChange,
  onPersonalValueChange,
  onLocationChange,
}: CharacterPanelProps) {
  return (
    <aside className="character-panel">
      <button className="close-button" onClick={onClose} aria-label="Kapat">×</button>

      <div className="profile-avatar" style={{ background: hex(character.appearance.outfit) }}>
        <span className="profile-head" style={{ background: hex(character.appearance.skin) }} />
      </div>

      <div className="profile-heading">
        <p className="eyebrow">{getLocationName(character.primaryLocationId)}</p>
        <h2>{character.displayName}</h2>
        <div className="score-pills">
          <span>Overall {overall(character)}</span>
          <span>Değer {character.personalValue ?? '—'}</span>
        </div>
      </div>

      <label className="field-label">
        Konum
        <select
          value={character.primaryLocationId}
          onChange={(event) => void onLocationChange(event.target.value)}
        >
          {LOCATIONS.map((location) => (
            <option value={location.id} key={location.id}>{location.name}</option>
          ))}
        </select>
      </label>

      <div className="trait-list">
        {TRAITS.map(({ key, label }) => (
          <label className="trait-row" key={key}>
            <span>{label}<strong>{character.traits[key] ?? '—'}</strong></span>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={character.traits[key] ?? 0}
              onChange={(event) => void onTraitChange(key, Number(event.target.value))}
            />
          </label>
        ))}

        <label className="trait-row personal-value">
          <span>Benim İçin Değeri<strong>{character.personalValue ?? '—'}</strong></span>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={character.personalValue ?? 0}
            onChange={(event) => void onPersonalValueChange(Number(event.target.value))}
          />
        </label>
      </div>

      <p className="panel-note">
        Her değişiklik yerel seyir defterine kaydedilir. Repo kişisel puanlarını görmez.
      </p>
    </aside>
  );
}
