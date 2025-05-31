import { BaseShaderProgram } from '@/lib/render';
import {
  TIndexBufferConfig,
  TVertexAttribPointerConfig,
  TVertexBufferConfig,
} from './domain/types';

type TCreateVertexBufferArguments = {
  name: string,
  data: Float32Array,
  attributeConfig: TVertexAttribPointerConfig,
  usage?: number,
};

export class RenderData {
  private readonly gl: WebGLRenderingContext;
  readonly shaderProgram: BaseShaderProgram;
  readonly elementsCount: number;

  private vertexBuffers: Map<string, TVertexBufferConfig> = new Map();
  private indexBufferConfig: TIndexBufferConfig | null = null;
  private textures: Map<string, {
    texture: WebGLTexture,
    unit: number,
  }> = new Map();

  constructor({
    gl,
    shaderProgram,
    elementsCount,
  }: {
    gl: WebGLRenderingContext,
    shaderProgram: BaseShaderProgram,
    elementsCount: number,
  }) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.elementsCount = elementsCount;
  }

  createVertexBuffer({
    name,
    data,
    attributeConfig,
    usage = this.gl.STATIC_DRAW,
  }: TCreateVertexBufferArguments): void {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create vertex buffer');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
    this.vertexBuffers.set(name, {
      buffer,
      data,
      attributeConfig,
      usage,
    });
  }

  createVertexBuffers(buffers: Array<TCreateVertexBufferArguments>): void {
    buffers.forEach(({
      name,
      data,
      attributeConfig,
      usage = this.gl.STATIC_DRAW,
    }) => {
      this.createVertexBuffer({
        name,
        data,
        attributeConfig,
        usage,
      });
    });
  }

  createIndexBuffer({
    data,
    usage = this.gl.STATIC_DRAW,
  }: {
    data: Uint16Array | Uint32Array,
    usage?: number,
  }): void {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create index buffer');
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, usage);
    this.indexBufferConfig = {
      buffer,
      data,
      usage,
    };
  }

  enableVertexBuffer(name: string): void {
    if (!this.shaderProgram.program) throw new Error('Shader program not found');

    const config = this.vertexBuffers.get(name);
    if (!config) throw new Error(`Vertex buffer ${name} not found`);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, config.buffer);
    if (name === 'aPosition')
      console.log(config.data.length);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, config.data, config.usage);

    const location = this.gl.getAttribLocation(this.shaderProgram.program, name);
    if (location === -1) {
      console.log(`Attribute ${name} not found. Skipping...`);
      return;
    }
    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(
      location,
      config.attributeConfig.size,
      config.attributeConfig.type,
      config.attributeConfig.normalized,
      config.attributeConfig.stride,
      config.attributeConfig.offset,
    );
  }

  enableAllVertexBuffers(): void {
    this.vertexBuffers.forEach((_, name) => {
      this.enableVertexBuffer(name);
    });
  }

  enableIndexBuffer(): void {
    if (!this.indexBufferConfig) return;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferConfig.buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferConfig.data, this.indexBufferConfig.usage);
  }

  createTexture({
    name,
    unit,
    source = null,
    width = 1,
    height = 1,
  }: {
    name: string,
    unit: number,
    source?: TexImageSource | null,
    width?: number,
    height?: number ,
  }): void {
    const texture: WebGLTexture = this.gl.createTexture();
    if (!texture) throw new Error('Failed to create texture');

    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    if (source) {
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        source,
      );
    } else {
      // placeholder (white pixel) if no source provided
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        width,
        height,
        0,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        new Uint8Array([255, 255, 255, 255]),
      );
    }

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    this.textures.set(name, {
      texture,
      unit,
    });
  }

  bindTextures(): void {
    this.textures.forEach(({ texture, unit }, name) => {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.shaderProgram.setInt(name, unit);
    });
  }

  disableAllVertexBuffers(): void {
    this.vertexBuffers.forEach((_, name) => {
      const location = this.gl.getAttribLocation(this.shaderProgram.program!, name);
      if (location !== -1) {
        this.gl.disableVertexAttribArray(location);
      }
    });
  }

  disableIndexBuffer(): void {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  disableTextures(): void {
    this.textures.forEach(({ unit }) => {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    });
  }

  dispose(): void {
    this.vertexBuffers.forEach(buffer => this.gl.deleteBuffer(buffer));
    if (this.indexBufferConfig) this.gl.deleteBuffer(this.indexBufferConfig.buffer);
    this.textures.forEach(({ texture }) => this.gl.deleteTexture(texture));
  }


  get hasIndexBuffer(): boolean {
    return this.indexBufferConfig !== null;
  }

  get program(): BaseShaderProgram {
    return this.shaderProgram;
  }
}
