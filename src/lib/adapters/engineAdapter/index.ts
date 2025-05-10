export abstract class EngineAdapter {
  abstract getCameraMatrix(): Float32Array;
  abstract getViewportSize(): {
    width: number,
    height: number,
  };
  abstract executeInGLContext(callback: (gl: WebGLRenderingContext) => void): void;
}
