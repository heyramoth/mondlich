import { ParticleSystem } from '@/lib/core/particleSystem';
import { getInInterval } from '@/lib/core/domain/getInInterval';
import { FountainSystemSettings } from './domain/fountainSystemSettings';
import { MainThreadParticlePool } from '@/lib/core/particlePool/MainThreadParticlePool';
import { TParticleData } from '@/lib/core/domain/types';
import { MondlichMath } from '@/lib';

const config = {
  size: {
    min: 5,
    max: 16,
  },
  life: {
    min: 10,
    max: 50,
  },
  decay: {
    min: 20,
    max: 60,
  },
  mass:  0.002,
  x: {
    min: 5,
    max: 20,
  },
  y: {
    min: 5,
    max: 20,
  },
  z: {
    min: 5,
    max: 20,
  },
};

const randSize = (): number => getInInterval(config.size);

const randDecay = (): number => getInInterval(config.decay);

export class FountainSystem extends ParticleSystem<FountainSystemSettings> {

  readonly settings: FountainSystemSettings = new FountainSystemSettings();

  maxSize = 10;

  flairEffect(
    particle: TParticleData,
    dt: number,
    time: number,
    seed: number,
    size: number,
    pool: MainThreadParticlePool,
    particleIdx: number,
  ): void {
    if (Math.random() > 0.5) {
      particle.size = particle.size * 0.5;
    }
    if (Math.random() > 0.25) {
      particle.size = particle.size * 0.5;
    }
    if (size < 5 && particle.life < 1.0) {
      if (Math.random() < 0.5) {
        pool.reset(particleIdx);
      }
    }
    pool.add({
      x: particle.x,
      y: particle.y,
      z: particle.z,
      vy: particle.vy * 0.5,
      vx: particle.vx * 0.5,
      vz: particle.vz * 0.5,
      mass: particle.mass * 0.5,
      gravity: particle.gravity * 0.5,
      size: particle.size * 0.5,
      r: this.settings.color[0],
      g: this.settings.color[1],
      b: this.settings.color[2],
      life: Math.random(),
      decay: 1,
    });
  };

  launch(pool: MainThreadParticlePool): void {
    const seed = Math.random() * 4 | 0;
    const size = 20 + Math.random() * Math.min(5, this.maxSize);
    this.maxSize += 10;

    for (let i = 0; i < 300 * (1 + Math.random()); i++) {
      const xz = MondlichMath.randomPointOnCircle(2);

      const vy = getInInterval({
        min: 2.5,
        max: 3.5,
      } );

      const newSize = 0.25 * size * (1 + Math.random());
      const newInd = pool.add({
        x: this.settings.origin[0],
        y: this.settings.origin[1],
        z: this.settings.origin[2],
        size: size,
        mass: 0.2,
        gravity: -0.9,
        vx: xz[0],
        vy,
        vz: xz[1],
        r: this.settings.color[0],
        g: this.settings.color[1],
        b: this.settings.color[2],
        life: Math.random(),
        decay: 1,
      });
      pool.updateParticle(newInd, {
        persistentEffect: (particle: TParticleData, dt: number, time: number) => {
          this.flairEffect(particle, dt, time, seed,newSize * 0.5, pool, newInd);
        },
      });
    }

    const idx = pool.add({
      x: this.settings.origin[0],
      y: this.settings.origin[1],
      z: this.settings.origin[2],
      size: size,
      mass: 1,
      vz: 0,
      vx: 0,
      vy: 10 + Math.min(size * 0.1, 7),
      r: this.settings.color[0],
      g: this.settings.color[1],
      b: this.settings.color[2],
      life: 10,
      decay: randDecay(),
    });

    pool.updateParticle(idx, {
      persistentEffect: (particle: TParticleData, dt: number, time: number) => {
        const grav = -0.1 - Math.random() * 2;
        const speed = 2 + Math.random() * 2;
        const offset = 2 / size;
        const inc = Math.PI * (3.0 - Math.sqrt(5.0));

        const maxLife = 1 + Math.random() * 2;
        for (let i = 0; i < size; i++) {
          let vx: number, vy: number, vz: number;
          switch (seed) {
            case 1:
              vy = Math.abs(((i * offset) - 1) + (offset / 2));
              const r1 = Math.sqrt(1 - Math.pow(vy, 2));
              const phi1 = ((i + 1.0) % size) * inc;
              vx = Math.cos(phi1) * r1;
              vz = Math.sin(phi1) * r1;
              vx *= speed;
              vy *= speed;
              vz *= speed;
              break;
            case 2:
              vy = 1 + Math.random() * 2;
              vx = Math.sin(i * Math.PI * 2 * speed) * (2 - Math.random() * 4);
              vz = Math.sin(i * Math.PI * 2 * speed) * (2 - Math.random() * 4);
              break;
            default:
              vy = ((i * offset) - 1) + (offset / 2);
              const r2 = Math.sqrt(1 - Math.pow(vy, 2));
              const phi2 = ((i + 1.0) % size) * inc;
              vx = Math.cos(phi2) * r2;
              vz = Math.sin(phi2) * r2;
              vx *= speed;
              vy *= speed;
              vz *= speed;
              break;
          }

          if (Math.random() < 0.4) {
            const size1 = 0.5 * size * (1 + Math.random());
            const childIdx = pool.add({
              x: particle.x,
              y: particle.y,
              z: particle.z,
              size: size1,
              mass: 0.001,
              gravity: grav,
              vy: vy,
              vz: vz * 0.5,
              vx: vx * 0.5,
              r: this.settings.color[0],
              g: this.settings.color[1],
              b: this.settings.color[2],
              life: 0.1 + Math.random() * maxLife * 0.5,
              decay: Math.random() * 100,
            });
            pool.updateParticle(childIdx, {
              persistentEffect: (particle: TParticleData, dt: number, time: number) => {
                this.flairEffect(particle, dt, time, seed,size1 * 0.5, pool, childIdx);
              },
            });
          }
        }
      },
    });
  };
}
