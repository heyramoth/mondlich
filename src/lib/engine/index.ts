import { MondlichCamera } from '@/lib/utils/mondlichCamera';
import {
  DEFAULT_CAMERA_PROJECTION_CONFIG,
  DEFAULT_CAMERA_VIEW_CONFIG,
} from '@/lib/adapters/mondlichAdapter/domain/constants';
import { GL_CONTEXT_DEFAULT_CONFIG } from '@/lib/domain/constants';
import { TViewportSize } from '@/lib/domain/types';

export class MondlichEngine {
  readonly camera: MondlichCamera;
  readonly gl: WebGL2RenderingContext;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    glOptions: WebGLContextAttributes = {},
  ) {
    const gl: WebGL2RenderingContext | null = canvas.getContext('webgl2', {
      ...GL_CONTEXT_DEFAULT_CONFIG,
      ...glOptions,
    });
    if (!gl) throw new Error('WebGL2 is not supported in this browser.');
    this.gl = gl;

    this.camera = new MondlichCamera({
      viewConfig: DEFAULT_CAMERA_VIEW_CONFIG,
      projectionConfig: {
        ...DEFAULT_CAMERA_PROJECTION_CONFIG,
        aspect: canvas.width / canvas.height,
      },
    });
  }

  get viewportSize(): TViewportSize {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }
}
