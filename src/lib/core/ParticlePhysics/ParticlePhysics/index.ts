import { ParticlePool } from '@/lib/core/particlePool/ParticlePool';


export abstract class ParticlePhysics {
  abstract update(dt: number, i: number, pool: ParticlePool): void;
  abstract reset(i: number, pool: ParticlePool): void;
}
