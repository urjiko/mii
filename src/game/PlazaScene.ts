import Phaser from 'phaser';
import type { CharacterRecord } from '../types/domain';

interface Agent {
  character: CharacterRecord;
  container: Phaser.GameObjects.Container;
  target: Phaser.Math.Vector2;
  speed: number;
  nextDecisionAt: number;
  nextTalkAt: number;
}

function traitValue(value: number | null, fallback = 5): number {
  return value ?? fallback;
}

export class PlazaScene extends Phaser.Scene {
  private readonly characters: CharacterRecord[];
  private agents: Agent[] = [];

  constructor(characters: CharacterRecord[]) {
    super('plaza');
    this.characters = characters.slice(0, 28);
  }

  create() {
    this.drawEnvironment();

    this.characters.forEach((character, index) => {
      const x = 120 + ((index * 137) % Math.max(280, this.scale.width - 240));
      const y = 200 + ((index * 83) % Math.max(220, this.scale.height - 300));
      const container = this.createCharacter(character, x, y);

      this.agents.push({
        character,
        container,
        target: new Phaser.Math.Vector2(x, y),
        speed: 20 + traitValue(character.traits.extroversion) * 4,
        nextDecisionAt: 0,
        nextTalkAt: Phaser.Math.Between(2500, 6500),
      });
    });

    this.scale.on('resize', () => this.drawEnvironment());
  }

  update(time: number, delta: number) {
    const dt = delta / 1000;

    for (const agent of this.agents) {
      if (
        time >= agent.nextDecisionAt ||
        Phaser.Math.Distance.Between(
          agent.container.x,
          agent.container.y,
          agent.target.x,
          agent.target.y,
        ) < 8
      ) {
        agent.target.set(
          Phaser.Math.Between(80, Math.max(100, this.scale.width - 80)),
          Phaser.Math.Between(180, Math.max(220, this.scale.height - 90)),
        );
        agent.nextDecisionAt = time + Phaser.Math.Between(2400, 6200);
      }

      const direction = new Phaser.Math.Vector2(
        agent.target.x - agent.container.x,
        agent.target.y - agent.container.y,
      );

      if (direction.lengthSq() > 16) {
        direction.normalize();
        agent.container.x += direction.x * agent.speed * dt;
        agent.container.y += direction.y * agent.speed * dt;
      }

      agent.container.setDepth(Math.round(agent.container.y));

      if (time > agent.nextTalkAt) this.tryTalk(agent, time);
    }
  }

  private drawEnvironment() {
    this.children.getByName('environment')?.destroy();

    const graphics = this.add.graphics().setName('environment').setDepth(-1000);
    const width = this.scale.width;
    const height = this.scale.height;

    graphics.fillStyle(0xe8e2d6, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.fillStyle(0xcfdab7, 1);
    graphics.fillRoundedRect(34, 86, width - 68, height - 126, 42);
    graphics.fillStyle(0xe9d7b5, 1);
    graphics.fillRoundedRect(width * 0.12, height * 0.34, width * 0.76, height * 0.42, 80);
    graphics.fillStyle(0xa9c6d9, 1);
    graphics.fillCircle(width * 0.5, height * 0.53, 62);
    graphics.lineStyle(8, 0xf4efe7, 0.9);
    graphics.strokeCircle(width * 0.5, height * 0.53, 74);

    const trees = [
      [0.08, 0.2],
      [0.92, 0.2],
      [0.08, 0.82],
      [0.92, 0.82],
      [0.25, 0.16],
      [0.75, 0.16],
    ];

    for (const [px, py] of trees) {
      graphics.fillStyle(0x7fa36f, 1);
      graphics.fillCircle(width * px, height * py, 24);
      graphics.fillStyle(0x5e7f55, 1);
      graphics.fillCircle(width * px + 8, height * py - 6, 18);
    }
  }

  private createCharacter(
    character: CharacterRecord,
    x: number,
    y: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const shadow = this.add.ellipse(0, 34, 42, 12, 0x000000, 0.12);
    const body = this.add.rectangle(0, 8, 34, 48, character.appearance.outfit, 1);
    const head = this.add.circle(0, -28, 25, character.appearance.skin, 1);
    const hair = this.add.ellipse(0, -45, 43, 22, character.appearance.hair, 1);
    const leftEye = this.add.circle(-8, -29, 2.5, 0x292929, 1);
    const rightEye = this.add.circle(8, -29, 2.5, 0x292929, 1);
    const mouth = this.add.arc(0, -18, 7, 15, 165, false, 0x8d514e, 1);
    const label = this.add
      .text(0, 48, character.displayName, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
        color: '#262626',
        backgroundColor: '#ffffffcc',
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5);

    container.add([shadow, body, head, hair, leftEye, rightEye, mouth, label]);
    container.setSize(64, 104);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      window.dispatchEvent(
        new CustomEvent('people-plaza:character-click', { detail: character.id }),
      );
    });

    return container;
  }

  private tryTalk(agent: Agent, time: number) {
    const nearest = this.agents
      .filter((candidate) => candidate !== agent)
      .map((candidate) => ({
        candidate,
        distance: Phaser.Math.Distance.Between(
          agent.container.x,
          agent.container.y,
          candidate.container.x,
          candidate.container.y,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    agent.nextTalkAt = time + Phaser.Math.Between(5000, 11000);
    if (!nearest || nearest.distance > 110) return;

    const humor = traitValue(agent.character.traits.humor);
    const intelligence = traitValue(agent.character.traits.intelligence);
    const extroversion = traitValue(agent.character.traits.extroversion);

    const message =
      humor >= 8
        ? '😂'
        : intelligence >= 8
          ? 'hmm...'
          : extroversion >= 8
            ? 'selam!'
            : '👋';

    const bubble = this.add
      .text(agent.container.x + 24, agent.container.y - 78, message, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px',
        color: '#1d1d1f',
        backgroundColor: '#ffffff',
        padding: { x: 9, y: 6 },
      })
      .setDepth(10000)
      .setAlpha(0);

    this.tweens.add({
      targets: bubble,
      alpha: 1,
      y: bubble.y - 5,
      duration: 160,
      yoyo: true,
      hold: 1500,
      onComplete: () => bubble.destroy(),
    });
  }
}
