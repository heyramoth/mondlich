import { ShaderUniformsManager } from '@/lib/render/baseShaderProgram/domain/shaderUniformsManager';
import { EngineAdapter } from '@/lib/adapters';
import { BaseShaderProgram } from '@/lib/render';
import { fsSource, vsSource } from '../domain/constants';

export class CameraUniformsManager extends ShaderUniformsManager {
  updateUniforms({ adapter, shader }: {
    adapter: EngineAdapter,
    shader: BaseShaderProgram,
  }): void {
    shader.setMat4('mWorld', adapter.cameraWorldMatrix);
    shader.setMat4('mView', adapter.cameraViewMatrix);
    shader.setMat4('mProj', adapter.cameraProjectionMatrix);
  }
}

export const createParticleSystemShader = (gl: WebGL2RenderingContext) => {
  const shader = new BaseShaderProgram(vsSource, fsSource, gl);
  const cameraUniformsManager = new CameraUniformsManager();
  shader.setUniformsManager(cameraUniformsManager);

  return shader;
};
