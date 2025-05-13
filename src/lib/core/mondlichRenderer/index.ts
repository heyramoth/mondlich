import { RenderData } from '@/lib/core/mondlichRenderer/domain/renderData';
import { EngineAdapter } from '@/lib/adapters/engineAdapter';

export class MondlichRenderer {
  private adapter?: EngineAdapter;

  constructor(adapter?: EngineAdapter) {
    this.adapter = adapter;
  }

  setAdapter(adapter: EngineAdapter): void {
    this.adapter = adapter;
  }

  render({
    renderData,
    useAdapterUniforms,
  }: {
    renderData: RenderData,
    useAdapterUniforms?: (args: {
      cameraMatrix: Float32Array,
      viewport: {
        height: number,
        width: number,
      },
    }) => void,
  }): void {
    if (!this.adapter) return;

    this.adapter.executeInGLContext((gl: WebGLRenderingContext) => {
      renderData.shaderProgram.use();

      const viewport = this.adapter!.getViewportSize();
      const cameraMatrix = this.adapter!.getCameraMatrix();

      useAdapterUniforms?.({
        cameraMatrix,
        viewport,
      });

      this.draw({
        gl,
        renderData,
      });

      renderData.shaderProgram.disable();
    });
  }

  draw({
    gl,
    renderData,
  }: {
    gl: WebGLRenderingContext,
    renderData: RenderData,
  }): void {
    renderData.bindTextures();
    renderData.enableAllVertexBuffers();

    if (renderData.hasIndexBuffer) {
      renderData.enableIndexBuffer();
      gl.drawElements(gl.TRIANGLES, renderData.elementsCount, gl.UNSIGNED_SHORT, 0);
      renderData.disableIndexBuffer();
    } else {
      gl.drawArrays(gl.POINTS, 0, renderData.elementsCount);
    }

    renderData.disableAllVertexBuffers();
    renderData.disableTextures();
  }
}
