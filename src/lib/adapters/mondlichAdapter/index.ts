import { EngineAdapter } from '@/lib/adapters/engineAdapter';
import { mat4 } from 'gl-matrix';
import { MondlichEngine } from '@/lib/engine';
import { TViewportSize } from '@/lib/domain/types';

export class MondlichAdapter implements EngineAdapter {

  constructor(private readonly engine: MondlichEngine) { }

  get viewportSize(): TViewportSize {
    return this.engine.viewportSize;
  }

  get cameraWorldMatrix(): Float32Array {
    return this.engine.camera.worldMatrix;
  }

  get cameraViewMatrix(): Float32Array {
    return this.engine.camera.viewMatrix;
  }

  get cameraProjectionMatrix(): Float32Array {
    return this.engine.camera.projectionMatrix;
  }

  get cameraMatrix(): Float32Array {
    const matrix = new Float32Array(16);

    mat4.multiply(matrix, matrix, this.engine.camera.projectionMatrix);
    mat4.multiply(matrix, matrix, this.engine.camera.viewMatrix);
    mat4.copy(matrix, this.engine.camera.worldMatrix);

    return matrix;
  }

  executeInGLContext(callback: (gl: WebGL2RenderingContext) => void): void {
    callback(this.engine.gl);
  }
}
