import { setupWebGLCanvas } from '@/playground/domain/setupWebGLCanvas';
import { DEFAULT_CANVAS_SIZE } from '@/playground/domain/constants';
import { loadImage, Timer } from '@/lib/utils';
import {
  BaseShaderProgram,
  RenderData,
  MondlichRenderer,
} from '@/lib/render';
import { CanvasAdapter } from '@/lib/adapters';
import {
  vsSource,
  fsSource,
  BUFFER_CONFIGS,
  IMAGE_SRC,
  PARTICLES_COUNT,
} from './domain/constants';
import { glMatrix } from 'gl-matrix';
import { setupCamera } from './domain/setupCamera';
import { ParticleEffect } from '@/lib/core';
import { FireworkSystem } from '@/lib/core/particleSystem/behaviors';

const configureRenderingContext = ({ gl, width, height }: {
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
}): void => {
  gl.viewport(0, 0, width, height);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  // doesnt really matter
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.clearColor(0, 0, 0, 1);
};

export const setupFireworksScene = async (): Promise<void> => {

  const { gl, canvas } = setupWebGLCanvas({
    ...DEFAULT_CANVAS_SIZE,
    containerId: 'app',
  });

  configureRenderingContext({
    gl,
    ...DEFAULT_CANVAS_SIZE,
  });

  const shaderProgram = new BaseShaderProgram(vsSource, fsSource, gl);

  const timer = new Timer();

  const firework = new ParticleEffect({
    particlesCount: PARTICLES_COUNT,
    particleSystem: new FireworkSystem(),
    spawnFramespan: 10,
    timer,
  });

  // TODO: сделать привязку данных ParticleEffect к RenderData
  const renderData = new RenderData({
    gl,
    shaderProgram,
    elementsCount: PARTICLES_COUNT,
  });

  renderData.createVertexBuffers(
    Array.from(BUFFER_CONFIGS.entries())
      .map(([name, config]) => ({
        name,
        data: config.data,
        attributeConfig: {
          size: config.attrSize,
          type: gl.FLOAT,
          normalized: false,
          stride: config.attrSize * Float32Array.BYTES_PER_ELEMENT,
          offset: 0,
        },
      })),
  );

  const htmlImage: HTMLImageElement = await loadImage(IMAGE_SRC);

  renderData.createTexture({
    name: 'u_pointTexture',
    source: htmlImage,
    unit: 0,
  });

  // TODO: move to canvas adapter
  const {
    worldMatrix,
    viewMatrix,
    projectionMatrix,
  } = setupCamera({
    viewConfig: {
      eye: [0, 1500, 750],
      center: [0, 500, 0], // lookAt
      up: [0, 1, 0],
    },
    projectionConfig: {
      fovy: glMatrix.toRadian(45),
      aspect: canvas.width / canvas.height,
      nearPlane: 0.1,
      farPlane: 5000.0,
    },
  });

  const adapter = new CanvasAdapter(gl, canvas);

  const mondlichRenderer = new MondlichRenderer(adapter);

  timer.init();

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mondlichRenderer.render({
      renderData,
      useAdapterUniforms: () => {
        shaderProgram.setMat4('mWorld', worldMatrix);
        shaderProgram.setMat4('mView', viewMatrix);
        shaderProgram.setMat4('mProj', projectionMatrix);
      },
    });
  };

  const loop = (): void => {
    timer.updateDelta();

    firework.update();
    // тут новую data надо распихивать в renderData

    render();

    requestAnimationFrame(loop);
  };

  loop();
};
