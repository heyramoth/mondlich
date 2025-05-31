import { TParticleData } from '@/lib/core/domain/types';
import { ParticlePool } from '../ParticlePool';
import { SimpleParticlePhysics } from '@/lib/core/ParticlePhysics/SimpleParticlePhysics';
import { ParticlePhysics } from '@/lib/core/ParticlePhysics/ParticlePhysics';

export class WorkerParticlePool extends ParticlePool {
  positions: Float32Array;
  velocities: Float32Array;
  sizes: Float32Array;
  masses: Float32Array;
  decays: Float32Array;
  lives: Float32Array;
  gravities: Float32Array;
  aliveStatus: Uint8Array;
  colors: Float32Array;
  private physics: ParticlePhysics;

  constructor(
    readonly particlesCount: number,
    buffers: {
      positions: Float32Array,
      velocities: Float32Array,
      sizes: Float32Array,
      masses: Float32Array,
      decays: Float32Array,
      lives: Float32Array,
      gravities: Float32Array,
      aliveStatus: Uint8Array,
      colors: Float32Array,
    },
  ) {
    super();
    this.positions = buffers.positions;
    this.velocities = buffers.velocities;
    this.sizes = buffers.sizes;
    this.masses = buffers.masses;
    this.decays = buffers.decays;
    this.lives = buffers.lives;
    this.gravities = buffers.gravities;
    this.aliveStatus = buffers.aliveStatus;
    this.colors = buffers.colors;
    this.physics = new SimpleParticlePhysics();
  }

  get data() {
    return {
      positions: this.positions,
      velocities: this.velocities,
      colors: this.colors,
      sizes: this.sizes,
      masses: this.masses,
      decays: this.decays,
      lives: this.lives,
      gravities: this.gravities,
      aliveStatus: this.aliveStatus,
    };
  }

  getParticle(i: number): TParticleData {
    const posIdx = i * 3;
    const velIdx = i * 3;
    const colIdx = i * 3;

    return {
      x: this.positions[posIdx],
      y: this.positions[posIdx + 1],
      z: this.positions[posIdx + 2],
      vx: this.velocities[velIdx],
      vy: this.velocities[velIdx + 1],
      vz: this.velocities[velIdx + 2],
      mass: this.masses[i],
      alive: this.aliveStatus[i] === 1,
      size: this.sizes[i],
      r: this.colors[colIdx],
      g: this.colors[colIdx + 1],
      b: this.colors[colIdx + 2],
      decay: this.decays[i],
      life: this.lives[i],
      gravity: this.gravities[i],
    };
  }

  update(dt: number, i: number): void {
    this.physics.update(dt, i, this);
  }

  reset(i: number): void {
    this.physics.reset(i, this);
  }
}
