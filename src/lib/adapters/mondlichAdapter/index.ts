import { EngineAdapter } from '@/lib/adapters/engineAdapter';
import { MondlichCamera } from '@/lib/utils/mondlichCamera';
import { DEFAULT_CAMERA_VIEW_CONFIG, DEFAULT_CAMERA_PROJECTION_CONFIG } from './domain/constants';
import { mat4 } from 'gl-matrix';

export class MondlichAdapter implements EngineAdapter {
  readonly camera: MondlichCamera;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.camera = new MondlichCamera({
      viewConfig: DEFAULT_CAMERA_VIEW_CONFIG,
      projectionConfig: {
        ...DEFAULT_CAMERA_PROJECTION_CONFIG,
        aspect: canvas.width / canvas.height,
      },
    });
  }

  get cameraWorldMatrix(): Float32Array {
    return this.camera.worldMatrix;
  }

  get cameraViewMatrix(): Float32Array {
    return this.camera.viewMatrix;
  }

  get cameraProjectionMatrix(): Float32Array {
    return this.camera.projectionMatrix;
  }

  get cameraMatrix(): Float32Array {
    const matrix = new Float32Array(16);

    mat4.multiply(matrix, matrix, this.camera.projectionMatrix);
    mat4.multiply(matrix, matrix, this.camera.viewMatrix);
    mat4.copy(matrix, this.camera.worldMatrix);

    return matrix;
  }

  get viewportSize(): {
    width: number,
    height: number,
  } {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  executeInGLContext(callback: (gl: WebGL2RenderingContext) => void): void {
    callback(this.gl);
  }
}
