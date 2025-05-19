import { ParticleSystem } from '@/lib/core/particleSystem';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { ParticleEffect } from '@/lib';
import { WorkerWrapper } from '@/lib/core/workerManager/domain/workerWrapper';

export class WorkerContext<T extends ParticleSystem> extends ExecutionContext<T> {
  constructor(private worker: WorkerWrapper) {
    super();
  }

  async update(effect: ParticleEffect<never>): Promise<void> {
    const data = {
      positions: effect.data.positions,
      colors: effect.data.colors,
      sizes: effect.data.sizes,
      frameDelta: effect.frameDelta,
      spawnCounter: effect.spawnCounter,
      particlesCount: effect.particlesCount,
      spawnFramespan: effect.spawnFramespan,
      activeParticlesCount: effect.activeParticlesCount,
    };

    // TODO: typing
    const result = await this.worker.postMessage(data) as {
      positions: Float32Array,
      colors: Float32Array,
      sizes: Float32Array,
      frameDelta: number,
      spawnCounter: number,
      activeParticlesCount: number,
    };

    // Update effect with results from worker
    effect.data.positions.set(result.positions);
    effect.data.colors.set(result.colors);
    effect.data.sizes.set(result.sizes);
    effect.frameDelta = result.frameDelta;
    effect.spawnCounter = result.spawnCounter;
    effect._activeParticlesCount = result.activeParticlesCount;
  }
}

