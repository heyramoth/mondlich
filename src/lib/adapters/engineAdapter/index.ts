import { TViewportSize } from '@/lib/domain/types';

export abstract class EngineAdapter {
  abstract get cameraMatrix(): Float32Array;
  abstract get cameraWorldMatrix(): Float32Array;
  abstract get cameraViewMatrix(): Float32Array;
  abstract get cameraProjectionMatrix(): Float32Array;
  abstract get viewportSize(): TViewportSize;

  abstract executeInGLContext(callback: (gl: WebGLRenderingContext) => void): void;
}
