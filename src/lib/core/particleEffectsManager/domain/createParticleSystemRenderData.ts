import { BaseShaderProgram, RenderData } from '@/lib/render';
import { ParticleEffect } from '@/lib/core';
import { BUFFER_CONFIGS } from '@/playground/fireworksScene/domain/constants';

export const createParticleSystemRenderData = (options: {
  gl: WebGL2RenderingContext,
  shader: BaseShaderProgram,
  effect: ParticleEffect<never>,
  htmlTexture: HTMLImageElement,
}): RenderData => {
  const renderData = new RenderData({
    gl: options.gl,
    shaderProgram: options.shader,
    elementsCount: options.effect.particlesCount,
  });


  renderData.createVertexBuffers([
    {
      name: 'aPosition',
      data: options.effect.data.positions,
      attributeConfig: {
        size: BUFFER_CONFIGS.aPosition.attrSize,
        type: options.gl.FLOAT,
        normalized: false,
        stride: BUFFER_CONFIGS.aPosition.attrSize * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
      },
    },
    {
      name: 'aColor',
      data: options.effect.data.colors,
      attributeConfig: {
        size: BUFFER_CONFIGS.aColor.attrSize,
        type: options.gl.FLOAT,
        normalized: false,
        stride: BUFFER_CONFIGS.aColor.attrSize * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
      },
    },
    {
      name: 'aSize',
      data: options.effect.data.sizes,
      attributeConfig: {
        size: BUFFER_CONFIGS.aSize.attrSize,
        type: options.gl.FLOAT,
        normalized: false,
        stride: BUFFER_CONFIGS.aSize.attrSize * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
      },
    },
  ]);

  renderData.createTexture({
    name: 'u_pointTexture',
    source: options.htmlTexture,
    unit: 0,
  });

  return renderData;
};
