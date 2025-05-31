import { BaseShaderProgram, RenderData } from '@/lib/render';
import {
  BUFFER_CONFIGS,
  fsSource,
  IMAGE_SRC,
  PARTICLES_COUNT,
  vsSource,
} from '@/playground/fireworksScene/domain/constants';
import { loadImage } from '@/lib/utils';
import { ParticleEffect } from '@/lib/core';
import { FireworkSystem } from '@/lib/core/particleSystem/behaviors';
import { ShaderUniformsManager } from '@/lib/render/baseShaderProgram/domain/shaderUniformsManager';
import { EngineAdapter } from '@/lib/adapters';

export class FireworkShaderUniformsManager extends ShaderUniformsManager {
  updateUniforms({ adapter, shader }: {
    adapter: EngineAdapter,
    shader: BaseShaderProgram,
  }): void {
    shader.setMat4('mWorld', adapter.cameraWorldMatrix);
    shader.setMat4('mView', adapter.cameraViewMatrix);
    shader.setMat4('mProj', adapter.cameraProjectionMatrix);
  }
}

export const createFirework = async (gl: WebGL2RenderingContext)=> {
  const shader = new BaseShaderProgram(vsSource, fsSource, gl);
  const cameraUniformsManager = new FireworkShaderUniformsManager();
  shader.setUniformsManager(cameraUniformsManager);

  const effect = new ParticleEffect({
    particlesCount: PARTICLES_COUNT,
    particleSystem: new FireworkSystem(),
    spawnFramespan: 5,
  });

  const renderData = new RenderData({
    gl,
    shaderProgram: shader,
    elementsCount: effect.particlesCount,
  });

  renderData.createVertexBuffers([
    {
      name: 'aPosition',
      getData: () => effect.data.positions,
      attributeConfig: {
        size: BUFFER_CONFIGS.aPosition.attrSize,
        type: gl.FLOAT,
        normalized: false,
        stride: BUFFER_CONFIGS.aPosition.attrSize * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
      },
    },
    {
      name: 'aColor',
      getData: () => effect.data.colors,
      attributeConfig: {
        size: BUFFER_CONFIGS.aColor.attrSize,
        type: gl.FLOAT,
        normalized: false,
        stride: BUFFER_CONFIGS.aColor.attrSize * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
      },
    },
    {
      name: 'aSize',
      getData: () => effect.data.sizes,
      attributeConfig: {
        size: BUFFER_CONFIGS.aSize.attrSize,
        type: gl.FLOAT,
        normalized: false,
        stride: BUFFER_CONFIGS.aSize.attrSize * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
      },
    },
  ]);

  const htmlImage: HTMLImageElement = await loadImage(IMAGE_SRC);

  renderData.createTexture({
    name: 'u_pointTexture',
    source: htmlImage,
    unit: 0,
  });

  return {
    firework: effect,
    fireworkRenderData: renderData,
  };
};
