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
  private readonly spawnFramespan: number;
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
    timer,
  }: TConstructorArguments) {
    this.pool = new ParticlePool();
    this.timer = timer;
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

  initPool (): void {
    for (let i = 0; i < this.particlesCount; i ++ ) {
      const p = new Particle(i);
      this.pool.particles.push(p);
    }
  }

  launchParticleSystem (): void {
    this.particleSystem.launch(this.pool);
  }

  update(): void {
    const time = Date.now() * 0.001;
    this.frameDelta += this.timer.getDelta();

    if (this.spawnFramespan) {
      this.spawnCounter += 1;
      if (this.spawnCounter > this.spawnFramespan) {
        this.launchParticleSystem();
        this.spawnCounter = 0;
      }
    }

    while(this.frameDelta >= 1 / MAX_FPS) {
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
      }
      this.frameDelta -= 1 / MAX_FPS;
    }
  }
}
