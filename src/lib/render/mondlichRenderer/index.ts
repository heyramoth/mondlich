import { RenderData } from '@/lib/render';
import { EngineAdapter } from '@/lib/adapters';

export class MondlichRenderer {
  private _adapter: EngineAdapter | undefined;

  constructor(adapter?: EngineAdapter) {
    if (adapter) {
      this.setAdapter(adapter);
    }
  }

  get adapter () {
    return this._adapter;
  }

  setAdapter(adapter: EngineAdapter) {
    console.log('Renderer adapter has been set');
    this._adapter = adapter;
  }

  render(renderData: RenderData): void {
    if (!this.adapter) throw new Error('Register adapter before rendering');

    this.adapter.executeInGLContext((gl: WebGLRenderingContext) => {
      renderData.shaderProgram.use();
      renderData.shaderProgram.updateUniforms(this.adapter!);

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
