import { ParticlePool } from '@/lib/core/particlePool';

export abstract class ParticlePhysics {
  abstract update(dt: number, i: number, pool: ParticlePool): void;
  abstract reset(i: number, pool: ParticlePool): void;
  abstract launchEffects(dt: number, time: number, i: number, pool: ParticlePool): void;
}
