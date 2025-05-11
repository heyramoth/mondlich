import { setupWebGLCanvas } from '@/playground/scene/domain/setupWebGLCanvas';
import { CanvasAdapter } from '@/lib/adapters/canvasAdapter';
import { BaseShaderProgram } from '@/lib/core/particleRenderer/domain/baseShaderProgram';
import { ParticleRenderer } from '@/lib/core/particleRenderer';

import { fsSource, vsSource } from './domain/constants';
import { RenderData } from '@/lib/core/particleRenderer/domain/renderData';

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

export const setupPlaygroundScene = (): void => {
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

  const particleRenderer = new ParticleRenderer(adapter);

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


  const renderData = new RenderData(gl, shaderProgram);
  renderData.createVertexBuffer('aPosition', positions, gl.STATIC_DRAW);
  renderData.createVertexBuffer('aColor', colors, gl.STATIC_DRAW);

  renderData.setupVertexAttributes([
    {
      name: 'aPosition',
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 6 * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
    {
      name: 'aColor',
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 6 * Float32Array.BYTES_PER_ELEMENT,
      offset: 3 * Float32Array.BYTES_PER_ELEMENT,
    },
  ]);

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    particleRenderer.render(
      {
        shaderProgram: renderData.program,
        renderData,
        particleCount: 3, // number of vertices (3 for a triangle)
      });

    requestAnimationFrame(render);
  };

  render();
};
