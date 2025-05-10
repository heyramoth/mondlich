import { BaseShaderProgram } from '@/lib/core/particleRenderer/domain/baseShaderProgram';
import { RenderData } from '@/lib/core/particleRenderer/domain/renderData';
import { EngineAdapter } from '@/lib/adapters/engineAdapter';

export class ParticleRenderer {
  private adapter?: EngineAdapter;
  private currentShader?: BaseShaderProgram;
  private renderDataMap: Map<BaseShaderProgram, RenderData> = new Map();

  constructor(adapter?: EngineAdapter) {
    this.adapter = adapter;
  }

  setAdapter(adapter: EngineAdapter): void {
    this.adapter = adapter;
  }

  createRenderData(
    shaderProgram: BaseShaderProgram,
    buffers: Array<{
      name: string,
      data: Float32Array,
      usage?: number,
      attributes: Array<{
        name: string,
        size: number,
        type?: number,
        normalized?: boolean,
        stride?: number,
        offset?: number,
      }>,
    }>,
    indexData?: Uint16Array | Uint32Array,
    textures?: Array<{
      name: string,
      unit: number,
      source?: TexImageSource,
      width?: number,
      height?: number,
    }>,
  ): RenderData {
    if (!this.adapter) throw new Error('Adapter not set');

    let renderData: RenderData;

    this.adapter.executeInGLContext((gl: WebGLRenderingContext) => {
      renderData = new RenderData(gl, shaderProgram);

      // Create vertex buffers and setup attributes
      buffers.forEach(bufferConfig => {
        renderData!.createVertexBuffer(
          bufferConfig.name,
          bufferConfig.data,
          bufferConfig.usage || gl.STATIC_DRAW,
        );

        // Setup attributes for this buffer
        const attributes = bufferConfig.attributes.map(attr => ({
          name: attr.name,
          size: attr.size,
          type: attr.type || gl.FLOAT,
          normalized: attr.normalized || false,
          stride: attr.stride || 0,
          offset: attr.offset || 0,
        }));

        renderData!.setupVertexAttributes(attributes);
      });

      // Create index buffer if provided
      if (indexData) {
        renderData!.createIndexBuffer(indexData);
      }

      // Create textures if provided
      if (textures) {
        textures.forEach(textureConfig => {
          renderData!.createTexture(
            textureConfig.name,
            textureConfig.unit,
            textureConfig.source,
            textureConfig.width,
            textureConfig.height,
          );
        });
      }
    });

    this.renderDataMap.set(shaderProgram, renderData!);
    return renderData!;
  }

  setShader(shaderProgram: BaseShaderProgram): void {
    this.currentShader = shaderProgram;
  }

  updateUniforms(
    shaderProgram: BaseShaderProgram,
    cameraMatrix: Float32Array,
    viewport: { width: number,
      height: number, },
    customUniforms?: (shader: BaseShaderProgram) => void,
  ): void {
    shaderProgram.use();

    // Set standard uniforms
    shaderProgram.setMat4('uViewProjection', cameraMatrix);
    shaderProgram.setVec2('uViewportSize', [viewport.width, viewport.height]);

    // Set any custom uniforms
    if (customUniforms) {
      customUniforms(shaderProgram);
    }
  }

  draw(gl: WebGLRenderingContext, renderData: RenderData, count: number): void {
    // Bind all textures
    renderData.bindTextures();

    // Draw
    if (renderData.hasIndexBuffer) {
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(gl.POINTS, 0, count);
    }
  }

  render(
    shaderProgram: BaseShaderProgram,
    particleCount: number,
    customUniforms?: (shader: BaseShaderProgram) => void,
  ): void {
    if (!this.adapter) return;

    const renderData = this.renderDataMap.get(shaderProgram);
    if (!renderData) {
      throw new Error('No render data found for the specified shader program');
    }

    this.adapter.executeInGLContext((gl) => {
      const viewport = this.adapter!.getViewportSize();
      const cameraMatrix = this.adapter!.getCameraMatrix();

      this.updateUniforms(shaderProgram, cameraMatrix, viewport, customUniforms);
      this.draw(gl, renderData, particleCount);
    });
  }

  cleanup(): void {
    if (!this.adapter) return;

    this.adapter.executeInGLContext(() => {
      this.renderDataMap.forEach(renderData => renderData.cleanup());
      this.renderDataMap.clear();
      this.currentShader = undefined;
    });
  }

  getCurrentShader(): BaseShaderProgram | undefined {
    return this.currentShader;
  }

  getRenderData(shaderProgram: BaseShaderProgram): RenderData | undefined {
    return this.renderDataMap.get(shaderProgram);
  }
}
