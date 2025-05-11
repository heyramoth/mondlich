import { EngineAdapter } from '@/lib/adapters/engineAdapter';

export class CanvasAdapter implements EngineAdapter {
  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly canvas: HTMLCanvasElement,
  ) {}

  getCameraMatrix(): Float32Array {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  getViewportSize(): { width: number,
    height: number, } {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  executeInGLContext(callback: (gl: WebGL2RenderingContext) => void): void {
    callback(this.gl);
  }
}
