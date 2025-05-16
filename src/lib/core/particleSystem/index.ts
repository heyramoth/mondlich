import { ParticlePool } from '@/lib/core/particlePool';
import { ParticleSystemSettings } from './domain/particleSystemSettings';

export abstract class ParticleSystem<S extends ParticleSystemSettings = ParticleSystemSettings> {
  abstract launch(pool: ParticlePool): void;
  abstract getSettings(): S;
}
