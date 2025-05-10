import { BaseShaderProgram } from '@/lib/core/particleRenderer/domain/baseShaderProgram';

export class RenderData {
  private readonly gl: WebGLRenderingContext;
  private readonly shaderProgram: BaseShaderProgram;
  private vertexBuffers: Map<string, WebGLBuffer> = new Map();
  private indexBuffer: WebGLBuffer | null = null;
  private textures: Map<string, { texture: WebGLTexture,
    unit: number, }> = new Map();
  private vertexArrayObject: WebGLVertexArrayObject | null = null;

  constructor(gl: WebGLRenderingContext, shaderProgram: BaseShaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;

    // Create VAO if WebGL2 or extension is available
    if ('createVertexArray' in gl) {
      this.vertexArrayObject = (gl as WebGL2RenderingContext).createVertexArray();
    } else {
      const vaoExt = gl.getExtension('OES_vertex_array_object');
      if (vaoExt) {
        this.vertexArrayObject = vaoExt.createVertexArrayOES();
      }
    }
  }

  createVertexBuffer(name: string, data: Float32Array, usage: number = this.gl.STATIC_DRAW): void {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create vertex buffer');

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
    this.vertexBuffers.set(name, buffer);
  }

  createIndexBuffer(data: Uint16Array | Uint32Array, usage: number = this.gl.STATIC_DRAW): void {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create index buffer');

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, usage);
    this.indexBuffer = buffer;
  }

  createTexture(
    name: string,
    unit: number,
    source: TexImageSource | null = null,
    width: number = 1,
    height: number = 1,
  ): void {
    const texture = this.gl.createTexture();
    if (!texture) throw new Error('Failed to create texture');

    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Default texture (white pixel) if no source provided
    if (source) {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source);
    } else {
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

  setupVertexAttributes(attributes: Array<{
    name: string,
    size: number,
    type: number,
    normalized: boolean,
    stride: number,
    offset: number,
  }>): void {
    if (this.vertexArrayObject) {
      if ('bindVertexArray' in this.gl) {
        (this.gl as WebGL2RenderingContext).bindVertexArray(this.vertexArrayObject);
      } else {
        const vaoExt = this.gl.getExtension('OES_vertex_array_object');
        vaoExt?.bindVertexArrayOES(this.vertexArrayObject);
      }
    }

    this.shaderProgram.use();

    attributes.forEach(attr => {
      const buffer = this.vertexBuffers.get(attr.name);
      if (!buffer) throw new Error(`Vertex buffer ${attr.name} not found`);
      if (!this.shaderProgram.program) throw new Error('Shader program not found');

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      const location = this.gl.getAttribLocation(this.shaderProgram.program, attr.name);
      if (location === -1) return; // Silently skip if attribute not found

      this.gl.enableVertexAttribArray(location);
      this.gl.vertexAttribPointer(
        location,
        attr.size,
        attr.type,
        attr.normalized,
        attr.stride,
        attr.offset,
      );
    });

    if (this.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    if (this.vertexArrayObject) {
      if ('bindVertexArray' in this.gl) {
        (this.gl as WebGL2RenderingContext).bindVertexArray(null);
      } else {
        const vaoExt = this.gl.getExtension('OES_vertex_array_object');
        vaoExt?.bindVertexArrayOES(null);
      }
    }
  }

  bindTextures(): void {
    this.textures.forEach(({ texture, unit }, name) => {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.shaderProgram.setInteger(name, unit);
    });
  }

  cleanup(): void {
    // Clean up buffers
    this.vertexBuffers.forEach(buffer => this.gl.deleteBuffer(buffer));
    if (this.indexBuffer) this.gl.deleteBuffer(this.indexBuffer);

    // Clean up textures
    this.textures.forEach(({ texture }) => this.gl.deleteTexture(texture));

    // Clean up VAO
    if (this.vertexArrayObject) {
      if ('deleteVertexArray' in this.gl) {
        (this.gl as WebGL2RenderingContext).deleteVertexArray(this.vertexArrayObject);
      } else {
        const vaoExt = this.gl.getExtension('OES_vertex_array_object');
        vaoExt?.deleteVertexArrayOES(this.vertexArrayObject);
      }
    }
  }

  get hasIndexBuffer(): boolean {
    return this.indexBuffer !== null;
  }
}
