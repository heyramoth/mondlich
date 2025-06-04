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

export const setupTestScene = async (): Promise<void> => {

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

  engine.camera.moveEye([0, -550, -20]);
  engine.camera.moveLookAt([0, -1100, -500]);

  await manager.textureManager.loadTextureLibrary();
  const fire = manager.createFire({
    particlesCount: 20000,
    spawnFramespan: 1,
  });

  const fire2 = manager.createFire({
    particlesCount: 20000,
    spawnFramespan: 0.1,
  });

  const firework = manager.createFirework({
    particlesCount: 20000,
    spawnFramespan: 0.1,
  });

  const R_MAX = 250;
  fire2.settings.origin = [0, 0, -750];
  fire.settings.origin = [0, 0, R_MAX];

  manager.setWorkerEnabled(fire, true);
  manager.setWorkerEnabled(fire2, true);
  manager.setWorkerEnabled(firework, true);

  const timer = new Timer(false);

  const T = 1; // period for one full cycle (inward + outward) in seconds
  const N = 1; // number of turns per cycle


  const updateEffectsSettings = () => {
    const t = timer.getElapsedTime();
    const u = (t % T) / T;
    const r = R_MAX * Math.abs(2 * u - 1);
    const theta = (2 * Math.PI * N / T) * t;

    fire.settings.color = vec3.fromValues(Math.random(), Math.random(), Math.random());
    fire.settings.origin = [-r * Math.sin(theta), 0, r * Math.cos(theta)];

    fire2.settings.color = vec3.fromValues(Math.random(), Math.random(), Math.random());
    fire2.settings.origin = MondlichMath.rotatePointAroundAxis({
      point: fire2.settings.origin,
      axisOrigin: [0, 0, 0],
      axisDirection: [0, 1, 0],
      rotationAngle: t * 0.01,
    });
    firework.settings.origin = vec3.copy(vec3.create(), fire2.settings.origin);
    firework.settings.color = vec3.copy(vec3.create(), fire2.settings.color);
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
  fire.start();
  fire2.start();
  firework.start();

  const loop = async () => {
    updateEffectsSettings();
    await manager.update();
    userInput.update();
    render();

    requestAnimationFrame(loop);
  };

  loop();
};
