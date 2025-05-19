import { MondlichRenderer, RenderData } from '@/lib/render';
import { ParticleSystemSettings } from '@/lib/core/particleSystem/domain/particleSystemSettings';
import { ParticleSystem } from '@/lib/core/particleSystem';
import { ParticleEffect } from '@/lib/core';
import { EngineAdapter } from '@/lib/adapters';
import { FireworkSystem } from '@/lib/core/particleSystem/behaviors';
import { TextureManager } from '@/lib/render/textureManager';

import { createParticleSystemShader } from './application/createParticleSystemShader';
import { createParticleSystemRenderData } from './application/createParticleSystemRenderData';
import { WorkerManager } from '@/lib/core/workerManager';
import { WorkerContext } from '@/lib/core/executionContexts/workerContext';

const DEFAULT_SPAWN_FRAMESPAN = 10;

export class ParticleEffectsManager {
  private workerManager: WorkerManager | undefined;
  private renderer: MondlichRenderer;
  private effectsData: Map<ParticleEffect<never>, RenderData> = new Map<ParticleEffect<never>, RenderData>();
  readonly textureManager: TextureManager = new TextureManager();

  constructor(private readonly adapter: EngineAdapter, workerScript?: string) {
    this.renderer = new MondlichRenderer(adapter);
    if (workerScript) {
      this.workerManager = new WorkerManager(workerScript);
    }
  }

  addEffect(effect: ParticleEffect<never>, renderData: RenderData): void {
    this.effectsData.set(effect, renderData);
  }

  deleteEffect(effect: ParticleEffect<never>): void {
    const renderData = this.effectsData.get(effect);
    if (renderData) {
      renderData.dispose(); // release GPU resources
      this.effectsData.delete(effect);
    }
  }

  async update(): Promise<void> {
    const updates = Array.from(this.effectsData.keys()).map(effect => {
      if (effect.isWorkerUsed && this.workerManager) {
        const worker = this.workerManager.getLeastBusyWorker();
        effect.setExecutionContext(new WorkerContext(worker));
      }
      return effect.update();
    });

    await Promise.all(updates);
  }

  render(): void {
    this.effectsData.forEach((renderData, effect) => {
      if (effect.isActive && effect.activeParticlesCount > 0) {
        this.renderer.render(renderData);
      }
    });
  }

  // стоит вынести наверно в отдельный класс
  createEffect<S extends ParticleSystemSettings, T extends ParticleSystem<S>>(options: {
    system: T,
    particlesCount: number,
    spawnFramespan?: number,
    createRenderData: (effect: ParticleEffect<never>) => RenderData,
  }): ParticleEffect<T> {
    const effect = new ParticleEffect({
      particlesCount: options.particlesCount,
      particleSystem: options.system,
      spawnFramespan: options.spawnFramespan || DEFAULT_SPAWN_FRAMESPAN,
    });

    const renderData = options.createRenderData(effect as ParticleEffect<never>);
    this.addEffect(effect as ParticleEffect<never>, renderData);

    return effect;
  }

  createFirework(options: {
    particlesCount: number,
    spawnFramespan?: number,
  }): ParticleEffect<FireworkSystem> {
    const system = new FireworkSystem();

    const shader = createParticleSystemShader(this.adapter.gl);
    const htmlTexture = this.textureManager.getTexture('spark');

    return this.createEffect({
      system,
      particlesCount: options.particlesCount,
      spawnFramespan: options.spawnFramespan || DEFAULT_SPAWN_FRAMESPAN,
      // хреново получается, как-то криво
      createRenderData: (effect: ParticleEffect<never>) => createParticleSystemRenderData({
        gl: this.adapter.gl,
        shader,
        effect,
        htmlTexture,
      }),
    });
  }
}
