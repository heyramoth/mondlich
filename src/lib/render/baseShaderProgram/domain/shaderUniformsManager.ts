import { EngineAdapter } from '@/lib/adapters';
import { BaseShaderProgram } from '@/lib/render';

export abstract class ShaderUniformsManager {
  abstract updateUniforms({ adapter, shader }: {
    adapter: EngineAdapter,
    shader: BaseShaderProgram,
  }): void;
}
