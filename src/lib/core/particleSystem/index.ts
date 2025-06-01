import { ParticleSystemSettings } from './domain/particleSystemSettings';
import { ParticlePool } from '@/lib/core/particlePool/ParticlePool';

export abstract class ParticleSystem<S extends ParticleSystemSettings = ParticleSystemSettings> {
  abstract launch(pool: ParticlePool): void;
  abstract readonly settings: S;
}
