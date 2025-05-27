import { ParticleSystem } from '@/lib/core/particleSystem';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { ParticleEffect } from '@/lib';
import { WorkerWrapper } from '@/lib/core/workerManager/domain/workerWrapper';

type TWorkerReturnValue = {
  positions: Float32Array,
  sizes: Float32Array,
  velocities: Float32Array,
  masses: Float32Array,
  decays: Float32Array,
  lives: Float32Array,
};

export class WorkerContext<T extends ParticleSystem> extends ExecutionContext<T> {
  constructor(private worker: WorkerWrapper) {
    super();
  }

  async updateParticles(effect: ParticleEffect<never>): Promise<void> {
    const data = {
      frameDelta: effect.frameDelta,
      particlesCount: effect.particlesCount,
      positions: new Float32Array(effect.particlesCount * 3), // x, y, z for each particle
      velocities: new Float32Array(effect.particlesCount * 3), // vx, vy, vz for each particle
      sizes: new Float32Array(effect.particlesCount),
      masses: new Float32Array(effect.particlesCount),
      decays: new Float32Array(effect.particlesCount),
      lives: new Float32Array(effect.particlesCount),
      gravities: new Float32Array(effect.particlesCount),
      aliveStatus: new Uint8Array(effect.particlesCount),
    };

    for (let i = 0, posIdx = 0, velIdx = 0; i < effect.particlesCount; i++) {
      posIdx = i * 3;
      velIdx = i * 3;
      // TODO: fix incapsulation issues
      const particle = effect.pool.particles[i];

      data.positions[posIdx] = particle.x;
      data.positions[posIdx + 1] = particle.y;
      data.positions[posIdx + 2] = particle.z;
      data.velocities[velIdx] = particle.vx;
      data.velocities[velIdx + 1] = particle.vy;
      data.velocities[velIdx + 2] = particle.vz;
      data.sizes[i] = particle.size;
      data.masses[i] = particle.mass;
      data.decays[i] = particle.decay;
      data.lives[i] = particle.life;
      data.gravities[i] = particle.gravity;
      data.aliveStatus[i] = particle.alive ? 1 : 0;
    }

    // TODO: typing
    const result = await this.worker.postMessage(data) as TWorkerReturnValue;
    // console.log(result);

    // update effect with results from worker
    effect.data.positions.set(result.positions);
    effect.data.sizes.set(result.sizes);

    // Update particle pool with returned data
    const returnedPositions = new Float32Array(result.positions);
    const returnedVelocities = new Float32Array(result.velocities);
    const returnedSizes = new Float32Array(result.sizes);
    const returnedMasses = new Float32Array(result.masses);
    const returnedDecays = new Float32Array(result.decays);
    const returnedLives = new Float32Array(result.lives);

    for (let i = 0, velIdx = 0; i < effect.particlesCount; i++) {
      const particle = effect.pool.particles[i];
      velIdx = i * 3;

      particle.x = returnedPositions[velIdx];
      particle.y = returnedPositions[velIdx + 1];
      particle.z = returnedPositions[velIdx + 2];

      particle.vx = returnedVelocities[velIdx];
      particle.vy = returnedVelocities[velIdx + 1];
      particle.vz = returnedVelocities[velIdx + 2];
      particle.mass = returnedMasses[i];
      particle.decay = returnedDecays[i];
      particle.life = returnedLives[i];
      particle.size = returnedSizes[i];
    }
  }
}

