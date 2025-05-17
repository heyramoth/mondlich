import { RenderData } from '@/lib/render';
import { EngineAdapter } from '@/lib/adapters';

export class MondlichRenderer {
  constructor(private readonly adapter: EngineAdapter) {
    this.adapter = adapter;
  }

  render(renderData: RenderData): void {
    if (!this.adapter) return;

    this.adapter.executeInGLContext((gl: WebGLRenderingContext) => {
      renderData.shaderProgram.use();
      renderData.shaderProgram.updateUniforms(this.adapter);

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
