import { MondlichRenderer, RenderData } from '@/lib/render';
import { ParticleSystemSettings } from '@/lib/core/particleSystem/domain/particleSystemSettings';
import { ParticleSystem } from '@/lib/core/particleSystem';
import { ParticleEffect } from '@/lib/core';
import { EngineAdapter } from '@/lib/adapters';
import {
  FireSystem, FireworkSystem, FountainSystem, SmokeSystem,
} from '@/lib/core/particleSystem/behaviors';
import { TextureManager } from '@/lib/render/textureManager';

import { createParticleSystemShader } from './application/createParticleSystemShader';
import { createParticleSystemRenderData } from './application/createParticleSystemRenderData';
import { ExecutionContextManager } from '@/lib/core/particleEffectsManager/domain/ExecutionContextManager';
import { TUpdateTime } from '@/lib/domain/types';

const DEFAULT_SPAWN_FRAMESPAN = 10;

export class ParticleEffectsManager {
  private contextManager: ExecutionContextManager;
  private renderer: MondlichRenderer;
  private _adapter: EngineAdapter | undefined;
  private effectsData: Map<ParticleEffect<any>, RenderData> = new Map<ParticleEffect<any>, RenderData>();
  readonly textureManager: TextureManager = new TextureManager();

  constructor(adapter?: EngineAdapter) {
    if (adapter) {
      this._adapter = adapter;
    }
    this.renderer = new MondlichRenderer(adapter);
    this.contextManager = new ExecutionContextManager();
  }

  setAdapter(adapter: EngineAdapter) {
    this._adapter = adapter;
    this.renderer.setAdapter(adapter);
  }

  get adapter () {
    return this._adapter;
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

  async update(externalTime?: TUpdateTime): Promise<void> {
    const effects = Array.from(this.effectsData.keys());
    return this.contextManager.update(effects, externalTime);
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
    if (!this.adapter) throw new Error('Register adapter before effect creation');

    const system = new FireworkSystem();

    const shader = createParticleSystemShader(this.adapter.gl);
    const htmlTexture = this.textureManager.getTexture('spark');

    return this.createEffect({
      system,
      particlesCount: options.particlesCount,
      spawnFramespan: options.spawnFramespan || DEFAULT_SPAWN_FRAMESPAN,
      // хреново получается, как-то криво
      createRenderData: (effect: ParticleEffect<never>) => createParticleSystemRenderData({
        gl: this.adapter!.gl,
        shader,
        effect,
        htmlTexture,
      }),
    });
  }

  createFire(options: {
    particlesCount: number,
    spawnFramespan?: number,
  }): ParticleEffect<FireSystem> {
    if (!this.adapter) throw new Error('Register adapter before effect creation');

    const system = new FireSystem();

    const shader = createParticleSystemShader(this.adapter.gl);
    const htmlTexture = this.textureManager.getTexture('flame');

    return this.createEffect({
      system,
      particlesCount: options.particlesCount,
      spawnFramespan: options.spawnFramespan || DEFAULT_SPAWN_FRAMESPAN,
      createRenderData: (effect: ParticleEffect<never>) => createParticleSystemRenderData({
        gl: this.adapter!.gl,
        shader,
        effect,
        htmlTexture,
      }),
    });
  }

  createFountain(options: {
    particlesCount: number,
    spawnFramespan?: number,
  }): ParticleEffect<FountainSystem> {
    if (!this.adapter) throw new Error('Register adapter before effect creation');

    const system = new FountainSystem();

    const shader = createParticleSystemShader(this.adapter.gl);
    const htmlTexture = this.textureManager.getTexture('drop');

    return this.createEffect({
      system,
      particlesCount: options.particlesCount,
      spawnFramespan: options.spawnFramespan || DEFAULT_SPAWN_FRAMESPAN,
      createRenderData: (effect: ParticleEffect<never>) => createParticleSystemRenderData({
        gl: this.adapter!.gl,
        shader,
        effect,
        htmlTexture,
      }),
    });
  }

  createSmoke(options: {
    particlesCount: number,
    spawnFramespan?: number,
  }): ParticleEffect<SmokeSystem> {
    if (!this.adapter) throw new Error('Register adapter before effect creation');

    const system = new SmokeSystem();

    const shader = createParticleSystemShader(this.adapter.gl);
    const htmlTexture = this.textureManager.getTexture('smoke');

    return this.createEffect({
      system,
      particlesCount: options.particlesCount,
      spawnFramespan: options.spawnFramespan || DEFAULT_SPAWN_FRAMESPAN,
      createRenderData: (effect: ParticleEffect<never>) => createParticleSystemRenderData({
        gl: this.adapter!.gl,
        shader,
        effect,
        htmlTexture,
      }),
    });
  }
}
