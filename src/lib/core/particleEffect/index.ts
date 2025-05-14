import { ParticleSystem } from '@/lib/core/particleSystem';
import { Timer } from '@/lib/utils';
import { ParticlePool } from '@/lib/core/particlePool';
import { Particle } from '@/lib/core/particle';

type TConstructorArguments = {
  particleSystem: ParticleSystem,
  particlesCount: number,
  spawnFramespan: number,
  timer: Timer,
};

const MAX_FPS = 60;

export class ParticleEffect {

  private readonly pool: ParticlePool;
  private readonly timer: Timer;
  private readonly particleSystem: ParticleSystem;
  private readonly particlesCount: number;
  private readonly spawnFramespan: number;

  constructor({
    particleSystem,
    particlesCount,
    spawnFramespan,
    timer,
  }: TConstructorArguments) {
    this.pool = new ParticlePool();
    this.timer = timer;
    this.particleSystem = particleSystem;
    this.particlesCount = particlesCount;
    this.spawnFramespan = spawnFramespan;
    this.initPool();
  }

  data: {
    positions: number[],
    colors: number[],
    sizes: number[],
  } = {
      positions: [],
      colors: [],
      sizes: [],
    };

  initPool (): void {
    for (let i = 0; i < this.particlesCount; i ++ ) {
      const p = new Particle(i);
      this.pool.particles.push(p);
      this.data.positions.push(0,0,0);
      this.data.colors.push(0,0,0);
      this.data.sizes.push(0);
    }
  }

  launchParticleSystem (): void {
    this.particleSystem.launch(this.pool);
  }

  frameDelta = 0;
  spawnCounter = 0;

  update(): void {
    const time = Date.now() * 0.001;
    this.frameDelta += this.timer.delta;

    if (this.spawnFramespan) {
      this.spawnCounter += 1;
      if (this.spawnCounter > this.spawnFramespan) {
        this.launchParticleSystem();
        this.spawnCounter = 0;
      }
    }

    while(this.frameDelta >= 1 / MAX_FPS) {
      for ( let i = 0; i < this.particlesCount * 3; i += 3 ) {
        const pos = i / 3 | 0;
        if (!this.pool.particles[pos].alive) {
          continue;
        }

        this.pool.particles[pos].update(this.frameDelta, time);

        this.data.positions[i] = this.pool.particles[pos].x;
        this.data.positions[i + 1] = this.pool.particles[pos].y;
        this.data.positions[i + 2] = this.pool.particles[pos].z;

        this.data.sizes[pos] = this.pool.particles[pos].size;

        this.data.colors[i] = this.pool.particles[pos].color[0];
        this.data.colors[i + 1] = this.pool.particles[pos].color[1];
        this.data.colors[i + 2] = this.pool.particles[pos].color[2];
      }
      this.frameDelta -= 1 / MAX_FPS;
    }
  }
}
