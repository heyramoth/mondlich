import { ParticleSystem } from '@/lib/core/particleSystem';
import { Timer } from '@/lib/utils';
import { ParticlePool } from '@/lib/core/particlePool';
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

  constructor({
    particleSystem,
    particlesCount,
    spawnFramespan,
  }: TConstructorArguments<T>) {
    this.particlesCount = particlesCount;
    this.pool = new ParticlePool(this.particlesCount);
    this.timer = new Timer(false);
    this.particleSystem = particleSystem;
    this.spawnFramespan = spawnFramespan;
  }

  get data () {
    return this.pool.data;
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
      this.launchParticleEffects(this.frameDelta, time);
      this.frameDelta -= 1 / MAX_FPS;
    }
  }

  updateParticles(time: number): void {
    this._activeParticlesCount = 0;

    for (let i = 0; i < this.particlesCount; i++) {
      const particle = this.pool.getParticle(i);
      if (!particle.alive) continue;

      this.pool.update(this.frameDelta, i);

      if (particle.alive) this._activeParticlesCount++;
    }
  }

  launchParticleEffects(dt: number, time: number): void {
    for (let i = 0; i < this.particlesCount; i++) {
      const particle = this.pool.getParticle(i);

      if (!particle.alive) continue;

      this.pool.launchEffects(this.frameDelta, time, i);
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
