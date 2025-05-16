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

export const createFirework = async (gl: WebGL2RenderingContext): Promise<{
  firework: ParticleEffect<FireworkSystem>,
  fireworkRenderData: RenderData,
  fireworkShader: BaseShaderProgram,
}> => {
  const fireworkShader = new BaseShaderProgram(vsSource, fsSource, gl);

  const firework = new ParticleEffect({
    particlesCount: PARTICLES_COUNT,
    particleSystem: new FireworkSystem(),
    spawnFramespan: 5,
  });

  const fireworkRenderData = new RenderData({
    gl,
    shaderProgram: fireworkShader,
    elementsCount: firework.particlesCount,
  });

  fireworkRenderData.createVertexBuffers([
    {
      name: 'aPosition',
      data: firework.data.positions,
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
      data: firework.data.colors,
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
      data: firework.data.sizes,
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

  fireworkRenderData.createTexture({
    name: 'u_pointTexture',
    source: htmlImage,
    unit: 0,
  });

  return {
    firework,
    fireworkRenderData,
    fireworkShader,
  };
};
