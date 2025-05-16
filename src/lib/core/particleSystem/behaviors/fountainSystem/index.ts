import { vec3 } from 'gl-matrix';
import { ParticleSystem } from '@/lib/core/particleSystem';
import { Particle } from '@/lib/core/particle';
import { ParticlePool } from '@/lib/core/particlePool';
import { getInInterval } from '@/lib/core/domain/getInInterval';
import { FountainSystemSettings } from './domain/fountainSystemSettings';

interface IColor {
  r: number,
  g: number,
  b: number,
}

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
  color: {
    r: 1,
    g: 1,
    b: 1,
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
  origin = vec3.fromValues(0,0,0);

  constructor(origin: vec3) {
    super();
    this.origin = origin;
  }

  getSettings(): FountainSystemSettings {
    return this.settings;
  }

  shellEffect(
    particle: Particle,
    dt: number,
    time: number,
    seed: number,
    pool: ParticlePool,
  ): void {
    let shellParticlesCount = 1;
    let vx = 0;
    let vz = 0;
    switch (seed) {
      case 1:
        shellParticlesCount = Math.random() * 30;
        break;
      case 3:
        particle.size = randSize();
        shellParticlesCount = Math.random() * 10;
        vx = 2 - Math.random() * 4;
        vz = 2 - Math.random() * 4;
        break;
    }
    for (let i = 0; i < shellParticlesCount; i++) {
      pool.add({
        x: particle.x,
        y: particle.y,
        z: particle.z,
        mass: 0.002,
        gravity: -0.2,
        size: randSize(),
        vx: vx,
        vz: vz,
        r: 1.0,
        g: 0,
        b: 0,
        life: Math.random() * 3,
        decay: 50,
      });
    }
  };

  explodeEffect(
    particle: Particle,
    dt: number,
    time: number,
    seed: number,
    pool: ParticlePool,
  ): void {
    for (let i = 0; i < 100; i++) {
      const gravity = -0.5;
      const vy = 1 - Math.random() * 2;
      const vx = 1 - Math.random() * 2;
      const vz = 1 - Math.random() * 2;
      const life = 0.1 + Math.random();
      pool.add({
        x: particle.x,
        y: particle.y,
        z: particle.z,
        size: randSize(),
        mass: 0.5,
        gravity: gravity,
        vy: vy,
        vx: vx,
        vz: vz,
        life: life,
        decay: Math.random() * 50,
      });
    }
  };

  flairEffect(
    particle: Particle,
    dt: number,
    time: number,
    seed: number,
    color: IColor,
    size: number,
    pool: ParticlePool,
  ): void {
    if (Math.random() > 0.5) {
      particle.size = particle.size * 0.5;
    }
    if (Math.random() > 0.25) {
      particle.size = particle.size * 0.5;
    }
    if (size < 5 && particle.life < 1.0) {
      if (Math.random() < 0.5) {
        particle.reset();
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
      ...color,
      life: Math.random(),
      decay: 1,
    });
  };

  launch(pool: ParticlePool): void {
    const seed = Math.random() * 4 | 0;
    const size = 20 + Math.random() * Math.min(5, this.maxSize);
    this.maxSize += 10;

    for (let i = 0; i < 100 + Math.random() * 200; i++) {
      const vx = getInInterval({
        min: 1,
        max: -1,
      } );

      const vy = getInInterval({
        min: 1,
        max: 3,
      } );

      const vz = getInInterval({
        min: 1,
        max: -1,
      } );
      pool.add({
        x: this.origin[0],
        y: this.origin[1],
        z: this.origin[2],
        size: 0.2 * size * (1 + Math.random()),
        mass: 0.2,
        gravity: -0.9,
        vx,
        vy,
        vz,
        life: 10 + 20 * Math.random(),
        decay: Math.random(),
      });
    }
    pool.add({
      effect: (particle: Particle) => {
        // this.shellEffect(particle, dt, time, seed, pool);
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
            pool.add({
              effect: (particle: Particle, dt: number, time: number) => {
                this.flairEffect(particle, dt, time, seed, config.color, size1 * 0.5, pool);
              },
              x: particle.x,
              y: particle.y,
              z: particle.z,
              size: size1,
              mass: 0.001,
              gravity: grav,
              vy: vy,
              vz: vz * 0.5,
              vx: vx * 0.5,
              ...config.color,
              life: 0.1 + Math.random() * maxLife * 0.5,
              decay: Math.random() * 100,
            });
          }
        }
      },
      x: this.origin[0],
      y: this.origin[1],
      z: this.origin[2],
      size: size,
      mass: 1,
      vz: 0,
      vx: 0,
      vy: 10 + Math.min(size * 0.1, 7),
      ...config.color,
      life: 10,
      decay: randDecay(),
    });
  };
}
