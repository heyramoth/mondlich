import { setupWebGLCanvas } from '@/playground/domain/setupWebGLCanvas';

import { MondlichRenderer } from '@/lib/render';
import { CanvasAdapter } from '@/lib/adapters';
import { glMatrix, vec3 } from 'gl-matrix';
import { MondlichCamera } from '@/lib/utils/mondlichCamera';
import { UserInput } from '@/lib/utils/userInput';
import { createFirework } from './application/createFirework';

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

  const {
    firework,
    fireworkRenderData,
    fireworkShader,
  } = await createFirework(gl);

  const updateFireworkSettings = () => {
    firework.settings.color = vec3.fromValues(Math.random(), Math.random(), Math.random());
  };

  const camera = new MondlichCamera({
    viewConfig: {
      eye: [0, 2000, 1000],
      center: [0, 1100, 0], // lookAt
      up: [0, 1, 0],
    },
    projectionConfig: {
      fovy: glMatrix.toRadian(45),
      aspect: canvas.width / canvas.height,
      nearPlane: 0.1,
      farPlane: 20000.0,
    },
  });

  const userInput = new UserInput({
    camera,
    sensitivity: 1,
  });

  const adapter = new CanvasAdapter(gl, canvas);

  const mondlichRenderer = new MondlichRenderer(adapter);

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mondlichRenderer.render({
      renderData: fireworkRenderData,
      useAdapterUniforms: () => {
        fireworkShader.setMat4('mWorld', camera.worldMatrix);
        fireworkShader.setMat4('mView', camera.viewMatrix);
        fireworkShader.setMat4('mProj', camera.projectionMatrix);
      },
    });
  };

  firework.start();

  const loop = (): void => {
    updateFireworkSettings();
    firework.update();
    userInput.update();

    render();

    requestAnimationFrame(loop);
  };

  loop();
};
