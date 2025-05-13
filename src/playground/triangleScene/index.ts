import { CanvasAdapter } from '@/lib/adapters/canvasAdapter';
import { BaseShaderProgram } from '@/lib/core/mondlichRenderer/domain/baseShaderProgram';
import { MondlichRenderer } from '@/lib/core/mondlichRenderer';

import { fsSource, vsSource } from './domain/constants';
import { RenderData } from '@/lib/core/mondlichRenderer/domain/renderData';
import { setupWebGLCanvas } from '../domain/setupWebGLCanvas';

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

export const setupTriangleScene = (): void => {
  const width = 800;
  const height = 600;

  const { gl, canvas } = setupWebGLCanvas({
    width,
    height,
    containerId: 'app',
  });

  configureRenderingContext({
    gl,
    width,
    height,
  });

  const adapter = new CanvasAdapter(gl, canvas);

  const shaderProgram = new BaseShaderProgram(vsSource, fsSource, gl);

  const mondlichRenderer = new MondlichRenderer(adapter);

  const positions = new Float32Array([
    // (x, y, z)
    0.0, 0.5, 0.0, // Top
    -0.5, -0.5, 0.0, // Bottom left
    0.5, -0.5, 0.0, // Bottom right
  ]);

  const colors = new Float32Array([
    // (r, g, b)
    1.0, 0.0, 0.0, // Red
    0.0, 1.0, 0.0, // Green
    0.0, 0.0, 1.0, // Blue
  ]);

  const indices = new Uint16Array([0, 1, 2]);

  const renderData = new RenderData({
    gl,
    shaderProgram,
    elementsCount: 3,
  });

  renderData.createIndexBuffer({ data: indices });

  const positionAttrSize = 3;

  renderData.createVertexBuffer({
    name: 'aPosition',
    data: positions,
    attributeConfig: {
      size: positionAttrSize,
      type: gl.FLOAT,
      normalized: false,
      stride: positionAttrSize * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
  });

  const colorAttrSize = 3;

  renderData.createVertexBuffer({
    name: 'aColor',
    data: colors,
    attributeConfig: {
      size: colorAttrSize,
      type: gl.FLOAT,
      normalized: false,
      stride: colorAttrSize * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
  });

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mondlichRenderer.render(
      {
        shaderProgram: renderData.program,
        renderData,
        count: 3, // number of vertices (3 for a triangle)
      });

    requestAnimationFrame(render);
  };

  render();
};
