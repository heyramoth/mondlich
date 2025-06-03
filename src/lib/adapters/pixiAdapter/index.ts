import { Application, RendererType } from 'pixi.js';
import { mat4 } from 'gl-matrix';
import { EngineAdapter } from '@/lib';
import { TViewportSize } from '@/lib/domain/types';

export class PixiJSEngineAdapter extends EngineAdapter {
  private app: Application;
  readonly gl: WebGL2RenderingContext;

  constructor(app: Application, gl: WebGL2RenderingContext) {
    super();
    this.app = app;
    if (this.app.renderer.type !== RendererType.WEBGL) {
      throw new Error('PixiJS application must use WebGL renderer');
    }
    this.gl = gl;
  }

  get cameraMatrix(): Float32Array {
    const viewMatrix = this.cameraViewMatrix;
    const projectionMatrix = this.cameraProjectionMatrix;
    const vpMatrix = new Float32Array(16);
    mat4.multiply(vpMatrix, projectionMatrix, viewMatrix);
    return vpMatrix;
  }

  get cameraWorldMatrix(): Float32Array {
    const matrix = new Float32Array(16);
    mat4.identity(matrix);
    return matrix;
  }

  get cameraViewMatrix(): Float32Array {
    const matrix = new Float32Array(16);
    mat4.identity(matrix);
    return matrix;
  }

  get cameraProjectionMatrix(): Float32Array {
    const { width, height } = this.viewportSize;
    const matrix = new Float32Array(16);
    mat4.ortho(matrix, 0, width, height, 0, -1000, 1000);
    return matrix;
  }

  get viewportSize(): TViewportSize {
    return {
      width: this.app.renderer.width,
      height: this.app.renderer.height,
    };
  }

  executeInGLContext(callback: (gl: WebGL2RenderingContext) => void): void {
    callback(this.gl);
  }
}
