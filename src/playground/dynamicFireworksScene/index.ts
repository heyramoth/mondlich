import {
  MondlichAdapter,
  MondlichEngine,
  ParticleEffectsManager,
  Timer,
  UserInput,
  MondlichMath,
  createWebGLCanvas,
} from '@/lib';

import { vec3 } from 'gl-matrix';

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

export const setupDynamicFireworksScene = async (): Promise<void> => {

  const { gl, canvas } = createWebGLCanvas({
    ...DEFAULT_CANVAS_SIZE,
    containerId: 'app',
  });

  configureRenderingContext({
    gl,
    ...DEFAULT_CANVAS_SIZE,
  });

  const engine = new MondlichEngine(canvas);
  const adapter = new MondlichAdapter(engine);
  const manager = new ParticleEffectsManager(adapter);

  await manager.textureManager.loadTextureLibrary();
  const fireworks = Array.from(
    { length: 6 },
    () => manager.createFirework({ particlesCount: 20000 }),
  );

  fireworks[0].settings.origin = [0, 0, -2000];
  fireworks[2].settings.origin = [1000, 0, 0];
  fireworks[3].settings.origin = [-1000, 0, 0];
  fireworks[4].settings.origin = [0, 0, -1000];
  fireworks[5].settings.origin = [0, 0, 1000];

  fireworks.forEach((effect) => {
    manager.setWorkerEnabled(effect, true);
  });

  const timer = new Timer(false);

  const updateFireworkSettings = () => {
    const elapsedTime = timer.getElapsedTime();
    fireworks[0].settings.color = vec3.fromValues(Math.random(), Math.random(), Math.random());
    fireworks[0].settings.origin = MondlichMath.rotatePointAroundAxis({
      point: fireworks[0].settings.origin,
      axisOrigin: [0, 0, 0],
      axisDirection: [0, 1, 0],
      rotationAngle: elapsedTime * 0.25,
    });
  };

  const userInput = new UserInput({
    camera: engine.camera,
    sensitivity: 1,
  });

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    manager.render();
  };

  timer.start();
  fireworks.forEach((effect) => {
    effect.start();
  });

  const loop = async () => {
    updateFireworkSettings();
    await manager.update();
    userInput.update();

    render();

    requestAnimationFrame(loop);
  };

  loop();
};
