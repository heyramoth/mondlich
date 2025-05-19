import { ParticleSystem } from '@/lib/core/particleSystem';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { ParticleEffect } from '@/lib';

export class MainThreadContext<T extends ParticleSystem> extends ExecutionContext<T> {
  update(effect: ParticleEffect<T>): void {
    effect.updateParticles();
  }
}
