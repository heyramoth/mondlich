import { ParticleSystem } from '@/lib/core/particleSystem';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { ParticleEffect } from '@/lib';

export class MainThreadContext<T extends ParticleSystem> extends ExecutionContext<T> {
  updateParticles(effect: ParticleEffect<T>, time: number): void {
    effect.updateParticles(time);
  }
}
