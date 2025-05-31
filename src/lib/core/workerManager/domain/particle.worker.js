import { WorkerParticlePool } from '../../particlePool/WorkerParticlePool';
import { isSharedArrayBufferAvailable } from '@/lib/utils/isSharedArrayBufferAvailable.js';

self.onmessage = function (e) {
  const {
    frameDelta,
    particlesCount,
    positions,
    velocities,
    sizes,
    masses,
    decays,
    lives,
    gravities,
    aliveStatus,
    colors,
  } = e.data;

  const pool = new WorkerParticlePool(particlesCount, {
    positions,
    velocities,
    sizes,
    masses,
    decays,
    lives,
    gravities,
    aliveStatus,
    colors,
  });

  // Update alive particles
  for (let i = 0; i < particlesCount; i++) {
    if (pool.aliveStatus[i] !== 1) continue;
    pool.update(frameDelta, i);
  }

  const data = {
    positions: pool.positions,
    sizes: pool.sizes,
    velocities: pool.velocities,
    masses: pool.masses,
    decays: pool.decays,
    lives: pool.lives,
  };

  const isSharedArrayBuffer = isSharedArrayBufferAvailable() && positions.buffer instanceof SharedArrayBuffer;
  const transfer = isSharedArrayBuffer ? [] : [
    data.positions.buffer,
    data.sizes.buffer,
    data.velocities.buffer,
    data.masses.buffer,
    data.decays.buffer,
    data.lives.buffer,
  ];

  self.postMessage(data, { transfer });
};
