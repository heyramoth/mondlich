import {
  MondlichAdapter,
  MondlichEngine,
  ParticleEffectsManager,
  UserInput,
  createWebGLCanvas,
  configureRenderingContext, Timer, MondlichMath,
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
    particlesCount: 100000,
    spawnFramespan: 1,
  });

  manager.setWorkerEnabled(effect, true);

  const timer = new Timer(false);

  const updateEffectSettings = () => {
    const t = timer.getElapsedTime();
    effect.settings.color = vec3.fromValues(
      MondlichMath.lerp(effect.settings.color[0], Math.random(), t),
      MondlichMath.lerp(effect.settings.color[1], Math.random(), t),
      MondlichMath.lerp(effect.settings.color[2], Math.random(), t),
    );
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
  effect.start();

  const loop = async () => {

    await manager.update();
    userInput.update();

    updateEffectSettings();
    render();

    requestAnimationFrame(loop);
  };

  loop();
};
