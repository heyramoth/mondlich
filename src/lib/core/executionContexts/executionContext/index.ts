import { ParticleSystem } from '@/lib/core/particleSystem';
import { ParticleEffect } from '@/lib';

export abstract class ExecutionContext<T extends ParticleSystem = ParticleSystem> {
  abstract updateParticles(effect: ParticleEffect<T>, time: number): Promise<void> | void;
}
