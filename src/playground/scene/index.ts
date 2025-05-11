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

  // Triangle vertices (x, y, z) and colors (r, g, b)
  const vertices = new Float32Array([
    // Positions     // Colors
    0.0, 0.5, 0.0, 1.0, 0.0, 0.0, // Top - Red
    -0.5, -0.5, 0.0, 0.0, 1.0, 0.0, // Bottom left - Green
    0.5, -0.5, 0.0, 0.0, 0.0, 1.0, // Bottom right - Blue
  ]);

  const renderData = new RenderData(gl, shaderProgram);
  renderData.createVertexBuffer('position', vertices);

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
