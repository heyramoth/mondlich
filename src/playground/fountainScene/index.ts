import {
  MondlichAdapter,
  MondlichEngine,
  ParticleEffectsManager,
  Timer,
  UserInput,
  MondlichMath,
  createWebGLCanvas,
  configureRenderingContext,
} from '@/lib';

import { vec3 } from 'gl-matrix';

export const DEFAULT_CANVAS_SIZE = {
  width: 1920,
  height: 1080,
};

export const setupFountainScene = async (): Promise<void> => {

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

  engine.camera.moveEye([0, -1000, -500]);
  engine.camera.moveLookAt([0, -1100, 0]);

  await manager.textureManager.loadTextureLibrary();
  const effect = manager.createFountain({
    particlesCount: 20000,
    spawnFramespan: 1,
  });

  manager.setWorkerEnabled(effect, true);

  const updateEffectsSettings = () => {
    effect.settings.color = vec3.fromValues(Math.random(), Math.random(), Math.random());
  };

  const userInput = new UserInput({
    camera: engine.camera,
    sensitivity: 1,
  });

  const render = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    manager.render();
  };

  effect.start();

  const loop = async () => {
    updateEffectsSettings();
    await manager.update();
    userInput.update();

    render();

    requestAnimationFrame(loop);
  };

  loop();
};
