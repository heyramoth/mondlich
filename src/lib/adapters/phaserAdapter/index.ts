import { mat4 } from 'gl-matrix';
import {
  Game,
  Renderer,
  Scene,
} from 'phaser';
import { EngineAdapter } from '@/lib';
import { TViewportSize } from '@/lib/domain/types';

export class PhaserAdapter extends EngineAdapter {
  private game: Game;
  private scene: Scene;

  constructor(game: Game, scene: Scene) {
    super();
    this.game = game;
    this.scene = scene;
    if (!(this.game.renderer instanceof Renderer.WebGL.WebGLRenderer)) {
      throw new Error('Phaser game must use WebGL renderer');
    }
    if (!(this.game.renderer.gl instanceof WebGL2RenderingContext)) {
      throw new Error('Phaser game must be configured to use WebGL2');
    }
  }

  get gl(): WebGL2RenderingContext {
    return (this.game.renderer as Renderer.WebGL.WebGLRenderer).gl as WebGL2RenderingContext;
  }

  get cameraMatrix(): Float32Array {
    const viewMatrix = this.cameraViewMatrix;
    const projectionMatrix = this.cameraProjectionMatrix;
    const vpMatrix = mat4.create();
    mat4.multiply(vpMatrix, projectionMatrix, viewMatrix);
    return vpMatrix as Float32Array;
  }

  get cameraWorldMatrix(): Float32Array {
    const worldMatrix = new Float32Array(16);
    const viewMatrix = this.cameraViewMatrix;
    mat4.invert(worldMatrix, viewMatrix);
    return worldMatrix;
  }

  get cameraViewMatrix(): Float32Array {
    if (!this.scene.cameras.main) {
      throw new Error('Main camera not initialized');
    }
    const camera = this.scene.cameras.main;
    const viewMatrix = new Float32Array(16);
    mat4.translate(viewMatrix, viewMatrix, [-camera.scrollX, -camera.scrollY, 0]);
    mat4.scale(viewMatrix, viewMatrix, [1 / camera.zoom, 1 / camera.zoom, 1]);
    return viewMatrix;
  }

  get cameraProjectionMatrix(): Float32Array {
    const { width, height } = this.viewportSize;
    const projectionMatrix = new Float32Array(16);
    mat4.ortho(projectionMatrix, 0, width, height, 0, -1000, 1000);
    return projectionMatrix;
  }

  get viewportSize(): TViewportSize {
    return {
      width: this.game.scale.width,
      height: this.game.scale.height,
    };
  }

  executeInGLContext(callback: (gl: WebGL2RenderingContext) => void): void {
    callback(this.gl);
  }
}
