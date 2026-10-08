import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CharacterPanel } from './components/CharacterPanel';
import {
  db,
  initialiseDemoData,
  updateLocation,
  updatePersonalValue,
  updateTrait,
} from './db/database';
import { getLocationName } from './data/locations';
import { GameCanvas } from './game/GameCanvas';
import { importExcel } from './services/importExcel';
import type { CharacterRecord, TraitKey } from './types/domain';

function hex(value: number): string {
  return '#' + value.toString(16).padStart(6, '0');
}

export default function App() {
  const [characters, setCharacters] = useState<CharacterRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    setCharacters(await db.characters.orderBy('displayName').toArray());
  }, []);

  useEffect(() => {
    void initialiseDemoData().then(refresh);
  }, [refresh]);

  useEffect(() => {
    const onCharacterClick = (event: Event) => {
      setSelectedId((event as CustomEvent<string>).detail);
    };

    window.addEventListener('people-plaza:character-click', onCharacterClick);
    return () => window.removeEventListener('people-plaza:character-click', onCharacterClick);
  }, []);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedId) ?? null,
    [characters, selectedId],
  );

  const activeCharacters = useMemo(
    () =>
      [...characters]
        .filter((character) => character.status !== 'archived')
        .sort(
          (a, b) =>
            Number(b.pinned) - Number(a.pinned) ||
            Number(b.favorite) - Number(a.favorite) ||
            (b.personalValue ?? -1) - (a.personalValue ?? -1),
        )
        .slice(0, 24),
    [characters],
  );

  const filteredCharacters = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    if (!normalized) return characters;

    return characters.filter((character) =>
      character.displayName.toLocaleLowerCase('tr-TR').includes(normalized),
    );
  }, [characters, query]);

  async function handleImport(file: File) {
    const shouldContinue =
      characters.length === 0 ||
      window.confirm(
        'Excel import mevcut yerel plaza verisini değiştirecek. Devam edilsin mi?',
      );

    if (!shouldContinue) return;

    try {
      const count = await importExcel(file);
      setSelectedId(null);
      await refresh();
      setNotice(count + ' karakter yerel veritabanına aktarıldı.');
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'Excel import sırasında hata oluştu.',
      );
    }
  }

  async function mutateAndRefresh(action: () => Promise<void>) {
    await action();
    await refresh();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">LOCAL-FIRST SOCIAL SIMULATION</p>
          <h1>Mii <span>People Plaza</span></h1>
        </div>

        <div className="topbar-actions">
          <label className="search-box">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="İnsan ara..."
            />
          </label>

          <button className="secondary-button" onClick={() => fileInputRef.current?.click()}>
            Excel Import
          </button>
          <input
            ref={fileInputRef}
            className="hidden-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImport(file);
              event.currentTarget.value = '';
            }}
          />
        </div>
      </header>

      {notice && (
        <button className="notice" onClick={() => setNotice(null)}>{notice}</button>
      )}

      <main className="workspace">
        <section className="directory">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DIRECTORY</p>
              <h2>{characters.length} kişi</h2>
            </div>
            <span className="live-dot">● LIVE</span>
          </div>

          <div className="people-list">
            {filteredCharacters.slice(0, 80).map((character) => (
              <button
                key={character.id}
                className={'person-row ' + (selectedId === character.id ? 'active' : '')}
                onClick={() => setSelectedId(character.id)}
              >
                <span
                  className="mini-avatar"
                  style={{ background: hex(character.appearance.outfit) }}
                />
                <span className="person-copy">
                  <strong>{character.displayName}</strong>
                  <small>{getLocationName(character.primaryLocationId)}</small>
                </span>
                <span className="person-value">{character.personalValue ?? '—'}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="plaza-card">
          <div className="plaza-toolbar">
            <div>
              <p className="eyebrow">GLOBAL PLAZA</p>
              <strong>{activeCharacters.length} aktif karakter</strong>
            </div>
            <div className="plaza-legend">
              <span>NPC’ler yalnızca ekrandayken simüle edilir</span>
            </div>
          </div>

          <GameCanvas characters={activeCharacters} />
        </section>

        {selectedCharacter && (
          <CharacterPanel
            character={selectedCharacter}
            onClose={() => setSelectedId(null)}
            onTraitChange={(trait: TraitKey, value: number) =>
              mutateAndRefresh(() => updateTrait(selectedCharacter.id, trait, value))
            }
            onPersonalValueChange={(value: number) =>
              mutateAndRefresh(() => updatePersonalValue(selectedCharacter.id, value))
            }
            onLocationChange={(locationId: string) =>
              mutateAndRefresh(() => updateLocation(selectedCharacter.id, locationId))
            }
          />
        )}
      </main>
    </div>
  );
}
