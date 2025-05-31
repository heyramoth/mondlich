export type TVertexAttribPointerConfig = {
  size: number,
  type: number,
  normalized: boolean,
  stride: number,
  offset: number,
};

export type TVertexBufferConfig = {
  buffer: WebGLBuffer,
  getData: () => Float32Array,
  usage: number,
  attributeConfig: TVertexAttribPointerConfig,
};

export type TIndexBufferConfig = {
  buffer: WebGLBuffer,
  data: Uint16Array | Uint32Array,
  usage: number,
};
