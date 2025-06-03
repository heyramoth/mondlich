import { ParticleSystem } from '@/lib/core/particleSystem';
import { generateRandsign } from '../domain/generateRandsign';
import { FireSystemSettings } from './domain/fireSystemSettings';
import { MainThreadParticlePool } from '@/lib/core/particlePool/MainThreadParticlePool';
import { TParticleData } from '@/lib/core/domain/types';

const config = {
  size: {
    min: 20,
    max: 120,
  },
  life: {
    min: 10,
    max: 50,
  },
  decay: {
    min: 20,
    max: 60,
  },
  color: [0.0, 1.0, 1.0],
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

export class FireSystem extends ParticleSystem<FireSystemSettings> {
  readonly settings: FireSystemSettings = new FireSystemSettings();

  shellEffect(
    particle: TParticleData,
    dt: number,
    time: number,
    seed: number,
    pool: MainThreadParticlePool,
    particleIndex: number,
  ): void {
    let max = 1;
    let vx = 0;
    let vz = 0;
    switch (seed) {
      case 1:
        max = Math.random() * 30;
        break;
      case 2:
        pool.updateParticle(particleIndex, {
          x: particle.x + Math.cos(Math.PI * 2 * time) * Math.random() * 3,
          z: particle.z + Math.sin(Math.PI * 2 * time) * Math.random() * 3,
        });
        break;
      case 3:
        pool.updateParticle(particleIndex, { size: Math.random() > 0.5 ? 150 : 10 });
        max = Math.random() * 10;
        vx = 2 - Math.random() * 4;
        vz = 2 - Math.random() * 4;
        break;
    }
    for (let i = 0; i < max; i++) {
      pool.add({
        x: particle.x,
        y: particle.y,
        z: particle.z,
        mass: 0.002,
        gravity: -0.2,
        size: 20 + Math.random() * 40,
        vx: vx,
        vz: vz,
        r: this.settings.color[0],
        g: this.settings.color[1],
        b: this.settings.color[2],
        life: Math.random() * 3,
        decay: 50,
      });
    }
  };

  launch(pool: MainThreadParticlePool): void {
    const launchPos = this.settings.origin;

    for (let i = 0; i < 100; i++) {
      const particleIndex = pool.add({
        persistentEffect: function(particle, dt, time) {
          particle.vz += Math.sin(time * Math.random()) * 0.02;
          particle.vx += Math.sin(time * Math.random()) * 0.02;
        },
        x: launchPos[0] + config.x.min + generateRandsign() * Math.random() * (config.x.max - config.x.min),
        y: launchPos[1] + config.y.min + generateRandsign() * Math.random() * (config.y.max - config.y.min),
        z: launchPos[2] + config.z.min + generateRandsign() * Math.random() * (config.z.max - config.z.min),
        mass: 0.002,
        gravity: Math.random(),
        size: 20 + Math.random() * 100,
        r: this.settings.color[0],
        g: this.settings.color[1],
        b: this.settings.color[2],
        life: Math.random() * 5,
        decay: 20 + Math.random() * 20,
      });
      const seed = Math.random() * 4 | 0;
      pool.updateParticle(particleIndex, {
        persistentEffect: (particle: TParticleData, dt: number, time: number) => {
          // this.shellEffect(particle, dt, time, seed, pool, particleIndex);
        },
      });
    }
  };
}
