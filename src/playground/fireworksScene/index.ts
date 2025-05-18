
import {
  MondlichAdapter,
  MondlichEngine,
  Timer,
  UserInput,
  createWebGLCanvas,
} from '@/lib';

import { vec3 } from 'gl-matrix';
import { createFirework } from './application/createFirework';
import { MondlichMath } from '@/lib/utils/mondlichMath';
import { MondlichRenderer } from '@/lib/render';

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

  const { gl, canvas } = createWebGLCanvas({
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
  } = await createFirework(gl);

  firework.settings.origin = [0, 0, -500];

  const timer = new Timer(false);

  const updateFireworkSettings = () => {
    const elapsedTime = timer.getElapsedTime();
    firework.settings.color = vec3.fromValues(Math.random(), Math.random(), Math.random());
    firework.settings.origin = MondlichMath.rotatePointAroundAxis({
      point: firework.settings.origin,
      axisOrigin: [0, 0, 0],
      axisDirection: [0, 1, 0],
      rotationAngle: elapsedTime,
    });
  };

  const engine = new MondlichEngine(canvas);
  const adapter = new MondlichAdapter(engine);

  const userInput = new UserInput({
    camera: engine.camera,
    sensitivity: 1,
  });

  const mondlichRenderer = new MondlichRenderer(adapter);

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mondlichRenderer.render(fireworkRenderData);
  };

  timer.start();
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
