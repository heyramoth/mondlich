import { ParticlePool } from '@/lib/core/particlePool';

export abstract class ParticleSystem {
  abstract launch(pool: ParticlePool): void;
}
