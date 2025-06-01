import { MondlichRenderer, RenderData } from '@/lib/render';
import { ParticleSystemSettings } from '@/lib/core/particleSystem/domain/particleSystemSettings';
import { ParticleSystem } from '@/lib/core/particleSystem';
import { ParticleEffect } from '@/lib/core';
import { EngineAdapter } from '@/lib/adapters';
import { FireworkSystem } from '@/lib/core/particleSystem/behaviors';
import { TextureManager } from '@/lib/render/textureManager';

import { createParticleSystemShader } from './application/createParticleSystemShader';
import { createParticleSystemRenderData } from './application/createParticleSystemRenderData';
import { ExecutionContextManager } from '@/lib/core/particleEffectsManager/domain/ExecutionContextManager';

const DEFAULT_SPAWN_FRAMESPAN = 10;

export class ParticleEffectsManager {
  private contextManager: ExecutionContextManager;
  private renderer: MondlichRenderer;
  private effectsData: Map<ParticleEffect<any>, RenderData> = new Map<ParticleEffect<any>, RenderData>();
  readonly textureManager: TextureManager = new TextureManager();

  constructor(private readonly adapter: EngineAdapter) {
    this.renderer = new MondlichRenderer(adapter);
    this.contextManager = new ExecutionContextManager();
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
    this.contextManager.terminateContext(effect);
    effect.cleanup();
  }

  setWorkerEnabled<T extends ParticleSystem>(effect: ParticleEffect<T>, enabled: boolean): void {
    this.contextManager.setWorkerEnabled(effect, enabled);
  }

  async update(): Promise<void> {
    const effects = Array.from(this.effectsData.keys());
    return this.contextManager.update(effects);
  }

  render(): void {
    this.effectsData.forEach((renderData, effect) => {
      // todo: is activeParticlesCount <= 0 case is possible at all?
      if (effect.isActive /*&& effect.activeParticlesCount > 0*/) {
        this.renderer.render(renderData);
      }
    });
  }

  // todo: стоит вынести наверно в отдельный класс когда остальные эффекты добавлю
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
