const CANVAS_DEFAULT_OPTIONS: WebGLContextAttributes = {
  alpha: false, // better performance
  antialias: true,
  depth: true, // enable depth buffer
  stencil: false, // disable stencil buffer
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  powerPreference: 'high-performance',
};


type TcreateWebGLCanvasArguments = {
  width: number,
  height: number,
  containerId: string,
  options?: WebGLContextAttributes,
};

type TcreateWebGLCanvasReturnValue = {
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
};

export const createWebGLCanvas = ({
  width,
  height,
  containerId,
  options = {},
}: TcreateWebGLCanvasArguments): TcreateWebGLCanvasReturnValue => {
  const appContainer = document.getElementById(containerId);
  if (!appContainer) {
    throw new Error('Element with ID "app" not found');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.display = 'block'; // removes default inline spacing

  appContainer.appendChild(canvas);

  const canvasOptions: WebGLContextAttributes = {
    ...CANVAS_DEFAULT_OPTIONS,
    ...options,
  };

  const gl: WebGL2RenderingContext | null = canvas.getContext('webgl2', canvasOptions);

  if (!gl) {
    throw new Error('WebGL2 is not supported in this browser');
  }

  return {
    canvas,
    gl,
  };
};
