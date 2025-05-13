import { BaseShaderProgram } from '@/lib/core/particleRenderer/domain/baseShaderProgram';
import { RenderData } from '@/lib/core/particleRenderer/domain/renderData';
import { EngineAdapter } from '@/lib/adapters/engineAdapter';

export class ParticleRenderer {
  private adapter?: EngineAdapter;

  constructor(adapter?: EngineAdapter) {
    this.adapter = adapter;
  }

  setAdapter(adapter: EngineAdapter): void {
    this.adapter = adapter;
  }

  render({
    shaderProgram,
    renderData,
    updateUniforms,
  }: {
    shaderProgram: BaseShaderProgram,
    renderData: RenderData,
    count: number,
    updateUniforms?: (args: {
      shaderProgram: BaseShaderProgram,
      cameraMatrix: Float32Array,
      viewport: {
        height: number,
        width: number,
      },
    }) => void,
  }): void {
    if (!this.adapter) return;

    this.adapter.executeInGLContext((gl: WebGLRenderingContext) => {
      const viewport = this.adapter!.getViewportSize();
      const cameraMatrix = this.adapter!.getCameraMatrix();

      updateUniforms?.({
        shaderProgram,
        cameraMatrix,
        viewport,
      });

      this.draw({
        gl,
        renderData,
      });
    });
  }

  draw({
    gl,
    renderData,
  }: {
    gl: WebGLRenderingContext,
    renderData: RenderData,
  }): void {
    // renderData.bindTextures();
    renderData.enableAllVertexBuffers();

    if (renderData.hasIndexBuffer) {
      renderData.enableIndexBuffer();
      gl.drawElements(gl.TRIANGLES, renderData.elementsCount, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, renderData.elementsCount);
    }
  }
}
