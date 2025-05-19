import { ParticleSystem } from '@/lib/core/particleSystem';
import { ParticleEffect } from '@/lib';

export abstract class ExecutionContext<T extends ParticleSystem = ParticleSystem> {
  abstract update(effect: ParticleEffect<T>): Promise<void> | void;
}
