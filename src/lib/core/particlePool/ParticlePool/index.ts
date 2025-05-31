import { TParticleData } from '@/lib/core/domain/types';

export abstract class ParticlePool {
  abstract readonly particlesCount: number;
  abstract positions: Float32Array;
  abstract velocities: Float32Array;
  abstract sizes: Float32Array;
  abstract masses: Float32Array;
  abstract decays: Float32Array;
  abstract lives: Float32Array;
  abstract gravities: Float32Array;
  abstract aliveStatus: Uint8Array;
  abstract colors: Float32Array;

  abstract get data(): {
    positions: Float32Array,
    velocities: Float32Array,
    colors: Float32Array,
    sizes: Float32Array,
    masses: Float32Array,
    decays: Float32Array,
    lives: Float32Array,
    gravities: Float32Array,
    aliveStatus: Uint8Array,
  };

  abstract getParticle(i: number): TParticleData;
  abstract update(dt: number, i: number): void;
  abstract reset(i: number): void;
}
