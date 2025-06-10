# mondlich
Master's thesis on the topic "Development of VFX-components library for web-games"


https://github.com/user-attachments/assets/2f695f0e-a9a6-4e57-9101-600cca9800d7

## Getting started
```yarn add mondlich```

or

```npm install mondlich```

## Basic usage
```
// 1. Create canvas for rendering
const canvas: HTMLCanvasElement = document.createElement('canvas');

const { gl, canvas } = createWebGLCanvas({
  ...DEFAULT_CANVAS_SIZE,
  containerId: 'app',
});

configureRenderingContext({
  gl,
  ...DEFAULT_CANVAS_SIZE,
});

// 2. Initialize particle manager and load textures for effects
const manager = new ParticleEffectsManager();
await manager.textureManager.loadTextureLibrary();

const engine = new MondlichEngine(canvas);

/*
  For engines whose adapters are not represented in the library, you may implement your own adapters
  (See EngineAdapter interface)
*/
const adapter = new MondlichAdapter(engine);
manager.setAdapter(adapter);

// 3. Prepare camera state
engine.camera.moveEye([0, -550, -20]);
engine.camera.moveLookAt([0, -1100, -500]);

// 4. Create effects
const fire = manager.createFire({
  particlesCount: 20000,
  spawnFramespan: 1,
});

// 5. (Optional) Enable WebWorker execution context for effect computations
manager.setWorkerEnabled(fire, true);

// 6. Enable effects and start game loop

fire.start();

const loop = async () => {
  await manager.update();
  userInput.update();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  manager.render();

  requestAnimationFrame(loop);
};

loop();
```
