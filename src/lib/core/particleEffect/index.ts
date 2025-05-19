import { ParticleSystem } from '@/lib/core/particleSystem';
import { Timer } from '@/lib/utils';
import { ParticlePool } from '@/lib/core/particlePool';
import { Particle } from '@/lib/core/particle';
import { MAX_FPS } from '@/lib/domain/constants';
import { MainThreadContext } from '@/lib/core/executionContexts/mainThreadContext';
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

  // TODO: убрать из класса
  public isWorkerUsed: boolean = false;
  private executionContext: ExecutionContext = new MainThreadContext();

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

  setExecutionContext(context: ExecutionContext): void {
    this.executionContext = context;
  }

  async update(): Promise<void> {
    if (!this.timer.isRunning) return Promise.resolve();

    return this.executionContext.update(this);
  }

  updateParticles(): void {
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
      this._activeParticlesCount = 0;
      for (let i = 0, posIdx = 0, colIdx = 0; i < this.particlesCount; i++) {
        const particle = this.pool.particles[i];
        if (!particle.alive) continue;

        particle.update(this.frameDelta, time);

        this.data.positions[posIdx++] = particle.x;
        this.data.positions[posIdx++] = particle.y;
        this.data.positions[posIdx++] = particle.z;

        this.data.colors[colIdx++] = particle.color[0];
        this.data.colors[colIdx++] = particle.color[1];
        this.data.colors[colIdx++] = particle.color[2];

        this.data.sizes[i] = particle.size;

        if (particle.alive) this._activeParticlesCount++;
      }
      this.frameDelta -= 1 / MAX_FPS;
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
