import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import type { CharacterRecord } from '../types/domain';
import { PlazaScene } from './PlazaScene';

interface GameCanvasProps {
  characters: CharacterRecord[];
}

export function GameCanvas({ characters }: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current || characters.length === 0) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      backgroundColor: '#e8e2d6',
      scene: [new PlazaScene(characters)],
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
      },
      render: { antialias: true, pixelArt: false },
    });

    return () => game.destroy(true);
  }, [characters]);

  return <div className="game-host" ref={hostRef} />;
}
