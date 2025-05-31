import { TParticleCallbacks, TParticleData } from '@/lib/core/domain/types';
import { SimpleParticlePhysics } from '@/lib/core/ParticlePhysics/SimpleParticlePhysics';
import { ParticlePhysics } from '@/lib/core/ParticlePhysics/ParticlePhysics';
import { ParticlePool } from '@/lib/core/particlePool/ParticlePool';
import { isSharedArrayBufferAvailable } from '@/lib/utils/isSharedArrayBufferAvailable';

export class MainThreadParticlePool extends ParticlePool {
  current: number;
  positions: Float32Array;
  velocities: Float32Array;
  sizes: Float32Array;
  masses: Float32Array;
  decays: Float32Array;
  lives: Float32Array;
  gravities: Float32Array;
  aliveStatus: Uint8Array;
  colors: Float32Array;
  conditionCallbacks: Map<number, (data: TParticleData, dt: number, time: number) => boolean>;
  actionCallbacks: Map<number, (data: TParticleData, dt: number, time: number) => void>;
  effectCallbacks: Map<number, (data: TParticleData, dt: number, time: number) => void>;
  private physics: ParticlePhysics;

  constructor(readonly particlesCount: number) {
    super();
    this.current = 0;
    this.conditionCallbacks = new Map();
    this.actionCallbacks = new Map();
    this.effectCallbacks = new Map();
    // todo: make injection
    this.physics = new SimpleParticlePhysics();

    const useSharedArrayBuffer = isSharedArrayBufferAvailable();
    console.log(`Ininializing buffer: ${useSharedArrayBuffer ? 'SharedArrayBuffer' : 'ArrayBuffer'}`);
    const bufferType = useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer;
    this.positions = new Float32Array(new bufferType(particlesCount * 3 * 4));
    this.velocities = new Float32Array(new bufferType(particlesCount * 3 * 4));
    this.sizes = new Float32Array(new bufferType(particlesCount * 4));
    this.masses = new Float32Array(new bufferType(particlesCount * 4));
    this.decays = new Float32Array(new bufferType(particlesCount * 4));
    this.lives = new Float32Array(new bufferType(particlesCount * 4));
    this.gravities = new Float32Array(new bufferType(particlesCount * 4));
    this.aliveStatus = new Uint8Array(new bufferType(particlesCount));
    this.colors = new Float32Array(new bufferType(particlesCount * 3 * 4));

    this.initPool();
  }

  get data () {
    return {
      positions: this.positions,
      colors: this.colors,
      sizes: this.sizes,
      velocities: this.velocities,
      masses: this.masses,
      decays: this.decays,
      lives: this.lives,
      gravities: this.gravities,
      aliveStatus: this.aliveStatus,
    };
  }

  private initPool(): void {
    for (let i = 0; i < this.particlesCount; i++) {
      this.reset(i);
    }
  }

  add(data: Partial<TParticleData & TParticleCallbacks> & Pick<TParticleData, 'x' | 'y' | 'z'>): number {
    this.current++;
    if (this.current === this.particlesCount) {
      this.current = 0;
    }

    this.updateParticle(this.current, {
      alive: true,
      x: data.x,
      y: data.y,
      z: data.z,
      vx: data.vx || 0,
      vy: data.vy || 0,
      vz: data.vz || 0,
      mass: data.mass || 1,
      size: data.size || 1,
      decay: data.decay || 10,
      life: data.life || 1,
      gravity:  data.gravity || -9.82,
      r: data.r || 1.0,
      g: data.g || 1.0,
      b: data.b || 1.0,
      condition: data.condition || (() => false),
      action: data.action || (() => {}),
      effect: data.effect || (() => {}),
    });

    return this.current;
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

  getParticleCallbacks(i: number): TParticleCallbacks {
    return {
      condition: this.conditionCallbacks.get(i) || (() => false),
      action: this.actionCallbacks.get(i) || (() => {}),
      effect: this.effectCallbacks.get(i) || (() => {}),
    };
  }

  updateParticle(i: number, data: Partial<TParticleData & TParticleCallbacks>): void {
    const posIdx = i * 3;
    const velIdx = i * 3;
    const colIdx = i * 3;

    if (data.x !== undefined) this.positions[posIdx] = data.x;
    if (data.y !== undefined) this.positions[posIdx + 1] = data.y;
    if (data.z !== undefined) this.positions[posIdx + 2] = data.z;
    if (data.vx !== undefined) this.velocities[velIdx] = data.vx;
    if (data.vy !== undefined) this.velocities[velIdx + 1] = data.vy;
    if (data.vz !== undefined) this.velocities[velIdx + 2] = data.vz;
    if (data.mass !== undefined) this.masses[i] = data.mass;
    if (data.alive !== undefined) this.aliveStatus[i] = data.alive ? 1 : 0;
    if (data.size !== undefined) this.sizes[i] = data.size;
    if (data.r !== undefined) this.colors[colIdx] = data.r;
    if (data.g !== undefined) this.colors[colIdx + 1] = data.g;
    if (data.b !== undefined) this.colors[colIdx + 2] = data.b;
    if (data.decay !== undefined) this.decays[i] = data.decay;
    if (data.life !== undefined) this.lives[i] = data.life;
    if (data.gravity !== undefined) this.gravities[i] = data.gravity;

    if (data.condition !== undefined) this.conditionCallbacks.set(i, data.condition);
    if (data.action !== undefined) this.actionCallbacks.set(i, data.action);
    if (data.effect !== undefined) this.effectCallbacks.set(i, data.effect);
  }

  update(dt: number, i: number): void {
    this.physics.update(dt, i, this);
  }

  reset(i: number): void {
    this.physics.reset(i, this);
    this.conditionCallbacks.set(i, () => false);
    this.actionCallbacks.set(i, () => {});
    this.effectCallbacks.set(i, () => {});
  }

  launchEffects(dt: number, time: number, i: number): void {
    const data = this.getParticle(i);
    const callbacks = this.getParticleCallbacks(i);

    if (callbacks.condition(data, dt, time)) {
      callbacks.action(data, dt, time);
      this.reset(i);
    }

    callbacks.effect(data, dt, time);

    if (this.lives[i] <= 0 || this.sizes[i] <= 0) {
      this.reset(i);
    }
  }

  cleanup(): void {
    // not good for typing but lets help GC
    // @ts-ignore
    this.positions = null;
    // @ts-ignore
    this.velocities = null;
    // @ts-ignore
    this.sizes = null;
    // @ts-ignore
    this.masses = null;
    // @ts-ignore
    this.decays = null;
    // @ts-ignore
    this.lives = null;
    // @ts-ignore
    this.gravities = null;
    // @ts-ignore
    this.aliveStatus = null;
    // @ts-ignore
    this.colors = null;
    this.conditionCallbacks.clear();
    this.actionCallbacks.clear();
    this.effectCallbacks.clear();
  }
}
