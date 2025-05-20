import { ParticleSystem } from '@/lib/core/particleSystem';
import { Timer } from '@/lib/utils';
import { ParticlePool } from '@/lib/core/particlePool';
import { Particle } from '@/lib/core/particle';
import { MAX_FPS } from '@/lib/domain/constants';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';

type TSystemSettings<T> = T extends ParticleSystem<infer S> ? S : never;

type TConstructorArguments<T extends ParticleSystem> = {
  particleSystem: T,
  particlesCount: number,
  spawnFramespan: number,
};

export class ParticleEffect<T extends ParticleSystem> {
  private _isActive: boolean = true;
  // TODO: должно быть доступно только из партикл эффекта/воркера
  _activeParticlesCount: number = 0;
  private readonly pool: ParticlePool;
  private readonly particleSystem: T;

  // TODO: должно быть доступно только из партикл эффекта/воркера
  readonly spawnFramespan: number;
  private readonly timer: Timer;

  readonly particlesCount: number;

  frameDelta = 0;
  spawnCounter = 0;

  data: {
    positions: Float32Array,
    colors: Float32Array,
    sizes: Float32Array,
  };

  constructor({
    particleSystem,
    particlesCount,
    spawnFramespan,
  }: TConstructorArguments<T>) {
    this.pool = new ParticlePool();
    this.timer = new Timer(false);
    this.particleSystem = particleSystem;
    this.particlesCount = particlesCount;
    this.spawnFramespan = spawnFramespan;
    this.data = {
      positions: new Float32Array(particlesCount * 3),
      colors: new Float32Array(particlesCount * 3),
      sizes: new Float32Array(particlesCount),
    };
    this.initPool();
  }

  private initPool (): void {
    for (let i = 0; i < this.particlesCount; i ++ ) {
      const p = new Particle(i);
      this.pool.particles.push(p);
    }
  }

  async update(context: ExecutionContext): Promise<void> {
    if (!this.timer.isRunning) return Promise.resolve();
    const time = Date.now() * 0.001;
    this.frameDelta += this.timer.getDelta();

    if (this.spawnFramespan) {
      this.spawnCounter += 1;
      if (this.spawnCounter > this.spawnFramespan) {
        this.particleSystem.launch(this.pool);
        this.spawnCounter = 0;
      }
    }

    while(this.frameDelta >= 1 / MAX_FPS) {
      // physics calculation
      await context.updateParticles(this, time);
      // particle's lifecycle effects
      this.launchParticleEffects(this.frameDelta, time);
      // updating buffers for webgl
      this.updateRenderData();
      this.frameDelta -= 1 / MAX_FPS;
    }
  }

  updateParticles(time: number): void {
    this._activeParticlesCount = 0;

    for (let i = 0; i < this.particlesCount; i++) {
      const particle = this.pool.particles[i];
      if (!particle.alive) continue;

      particle.update(this.frameDelta);

      if (particle.alive) this._activeParticlesCount++;
    }
  }

  launchParticleEffects(dt: number, time: number): void {
    for (let i = 0; i < this.particlesCount; i++) {
      const particle = this.pool.particles[i];

      if (!particle.alive) continue;

      particle.launchEffects(dt, time);
    }
  }

  updateRenderData() {
    for (let i = 0, posIdx = 0, colIdx = 0; i < this.particlesCount; i++) {
      const particle = this.pool.particles[i];

      this.data.positions[posIdx++] = particle.x;
      this.data.positions[posIdx++] = particle.y;
      this.data.positions[posIdx++] = particle.z;

      this.data.colors[colIdx++] = particle.color[0];
      this.data.colors[colIdx++] = particle.color[1];
      this.data.colors[colIdx++] = particle.color[2];

      this.data.sizes[i] = particle.size;
    }
  }

  start (): void {
    this.timer.start();
  }

  stop (): void {
    this.timer.stop();
  }

  // defines if effect is visible
  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
    if (value) {
      this.start();
      return;
    }
    this.stop();
  }

  get activeParticlesCount(): number {
    return this._activeParticlesCount;
  }

  get settings(): TSystemSettings<T> {
    return this.particleSystem.settings as TSystemSettings<T>;
  }
}
