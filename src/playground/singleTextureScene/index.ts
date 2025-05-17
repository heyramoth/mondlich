import { setupWebGLCanvas } from '@/playground/domain/setupWebGLCanvas';
import { DEFAULT_CANVAS_SIZE } from '@/playground/domain/constants';
import { loadImage } from '@/lib/utils';
import {
  BaseShaderProgram,
  RenderData,
  MondlichRenderer,
} from '@/lib/render';
import { fsSource, vsSource } from './domain/constants';
import { MondlichAdapter } from '@/lib/adapters/mondlichAdapter';

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

const IMAGE_SRC = '/src/assets/textures/clown-emoji.png';

const POSITIONS_CONFIG = {
  data: new Float32Array([
    0.0, 0.0, 0.0,
  ]),
  attrSize: 3,
};

export const setupSingleTextureScene = async (): Promise<void> => {

  const { gl, canvas } = setupWebGLCanvas({
    ...DEFAULT_CANVAS_SIZE,
    containerId: 'app',
  });

  configureRenderingContext({
    gl,
    ...DEFAULT_CANVAS_SIZE,
  });

  const shaderProgram = new BaseShaderProgram(vsSource, fsSource, gl);

  const renderData = new RenderData({
    gl,
    shaderProgram,
    elementsCount: 1,
  });

  renderData.createVertexBuffer({
    name: 'aPosition',
    data: POSITIONS_CONFIG.data,
    attributeConfig: {
      size: POSITIONS_CONFIG.attrSize,
      type: gl.FLOAT,
      normalized: false,
      stride: POSITIONS_CONFIG.attrSize * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
  });

  const htmlImage: HTMLImageElement = await loadImage(IMAGE_SRC);

  renderData.createTexture({
    name: 'u_pointTexture',
    source: htmlImage,
    unit: 0,
  });

  const adapter = new MondlichAdapter(gl, canvas);

  const mondlichRenderer = new MondlichRenderer(adapter);

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mondlichRenderer.render({
      renderData,
      useAdapterUniforms: ({ cameraMatrix }) => {
        shaderProgram.setMat4('mCamera', cameraMatrix);
      },
    });
    requestAnimationFrame(render);
  };

  render();
};
