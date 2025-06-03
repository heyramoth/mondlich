export const MAX_FPS = 60;

export const GL_CONTEXT_DEFAULT_CONFIG: WebGLContextAttributes = {
  alpha: false, // better performance
  antialias: true,
  depth: true, // enable depth buffer
  stencil: false, // disable stencil buffer
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  powerPreference: 'high-performance',
};
