import { ParticleSystem } from '@/lib/core/particleSystem';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { ParticleEffect } from '@/lib';
import { WorkerWrapper } from '@/lib/core/workerManager/domain/workerWrapper';
import { isSharedArrayBufferAvailable } from '@/lib/utils/isSharedArrayBufferAvailable';

export class WorkerContext<T extends ParticleSystem> extends ExecutionContext<T> {
  constructor(private worker: WorkerWrapper) {
    super();
  }

  async updateParticles(effect: ParticleEffect<never>): Promise<void> {
    const poolData = effect.data;
    const data = {
      frameDelta: effect.frameDelta,
      particlesCount: effect.particlesCount,
      positions: poolData.positions,
      velocities: poolData.velocities,
      sizes: poolData.sizes,
      masses: poolData.masses,
      decays: poolData.decays,
      lives: poolData.lives,
      gravities: poolData.gravities,
      aliveStatus: poolData.aliveStatus,
    };

    const isSharedArrayBuffer = isSharedArrayBufferAvailable() && data.positions.buffer instanceof SharedArrayBuffer;
    const transfer = isSharedArrayBuffer ? [] : [
      data.positions.buffer,
      data.velocities.buffer,
      data.sizes.buffer,
      data.masses.buffer,
      data.decays.buffer,
      data.lives.buffer,
      data.gravities.buffer,
      data.aliveStatus.buffer,
    ];

    const result = await this.worker.postMessage(data, transfer);

    // only needed for ArrayBuffer, as SharedArrayBuffer updates in-place
    if (!isSharedArrayBuffer) {
      effect.data = {
        positions: result.positions,
        sizes: result.sizes,
        velocities: result.velocities,
        masses: result.masses,
        decays: result.decays,
        lives: result.lives,
        gravities: result.gravities,
        aliveStatus: result.aliveStatus,
      };
    }
  }
}

