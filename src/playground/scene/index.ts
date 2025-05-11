import { setupWebGLCanvas } from '@/playground/scene/domain/setupWebGLCanvas';

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

  const { gl } = setupWebGLCanvas({
    width,
    height,
    containerId: 'app',
  });

  configureRenderingContext({
    gl,
    width,
    height,
  });
};
