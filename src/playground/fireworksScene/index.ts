import { setupWebGLCanvas } from '@/playground/domain/setupWebGLCanvas';
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
  // gl.enable(gl.DEPTH_TEST); // this makes background bleed through png's transparent area and overlap rear particle textures somehow
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);
  gl.clearColor(0, 0, 0, 1);
};

export const DEFAULT_CANVAS_SIZE = {
  width: 1920,
  height: 1080,
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

  const timer = new Timer(false);

  const firework = new ParticleEffect({
    particlesCount: PARTICLES_COUNT,
    particleSystem: new FireworkSystem(),
    spawnFramespan: 10,
    timer,
  });

  const renderData = new RenderData({
    gl,
    shaderProgram,
    elementsCount: firework.particlesCount,
  });

  renderData.createVertexBuffers([
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
      eye: [0, 1500, 1000],
      center: [0, 800, 0], // lookAt
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

  timer.start();

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
    firework.update();
    render();

    requestAnimationFrame(loop);
  };

  loop();
};
