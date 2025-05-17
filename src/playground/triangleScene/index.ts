import { MondlichAdapter } from '@/lib/adapters/mondlichAdapter';
import {
  BaseShaderProgram,
  RenderData,
  MondlichRenderer,
} from '@/lib/render';

import { fsSource, vsSource } from './domain/constants';
import { setupWebGLCanvas } from '../domain/setupWebGLCanvas';
import { DEFAULT_CANVAS_SIZE } from '@/playground/domain/constants';
import { MondlichEngine } from '@/lib/engine';

const configureRenderingContext = ({ gl, width, height }: {
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
}): void => {
  gl.viewport(0, 0, width, height);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 1);
};

const POSITIONS_CONFIG = {
  attrSize: 3,
  data: new Float32Array([
    // (x, y, z)
    0.0, 0.5, 0.0, // Top
    -0.5, -0.5, 0.0, // Bottom left
    0.5, -0.5, 0.0, // Bottom right
  ]),
};

const COLOR_CONFIG = {
  attrSize: 3,
  data: new Float32Array([
    // (r, g, b)
    1.0, 0.0, 0.0, // Red
    0.0, 1.0, 0.0, // Green
    0.0, 0.0, 1.0, // Blue
  ]),
};

const INDICES_DATA = new Uint16Array([0, 1, 2]);

export const setupTriangleScene = (): void => {
  const { gl, canvas } = setupWebGLCanvas({
    ...DEFAULT_CANVAS_SIZE,
    containerId: 'app',
  });

  configureRenderingContext({
    gl,
    ...DEFAULT_CANVAS_SIZE,
  });

  const engine = new MondlichEngine(canvas);
  const adapter = new MondlichAdapter(engine);

  const shaderProgram = new BaseShaderProgram(vsSource, fsSource, gl);

  const mondlichRenderer = new MondlichRenderer(adapter);


  const renderData = new RenderData({
    gl,
    shaderProgram,
    elementsCount: 3,
  });

  renderData.createIndexBuffer({ data: INDICES_DATA });

  renderData.createVertexBuffers([
    {
      name: 'aPosition',
      data: POSITIONS_CONFIG.data,
      attributeConfig: {
        size: POSITIONS_CONFIG.attrSize,
        type: gl.FLOAT,
        normalized: false,
        stride: POSITIONS_CONFIG.attrSize * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
      },
    },
    {
      name: 'aColor',
      data: COLOR_CONFIG.data,
      attributeConfig: {
        size: COLOR_CONFIG.attrSize,
        type: gl.FLOAT,
        normalized: false,
        stride: COLOR_CONFIG.attrSize * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
      },
    },
  ]);

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mondlichRenderer.render(renderData);

    requestAnimationFrame(render);
  };

  render();
};
