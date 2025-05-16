import { ParticleSystemSettings } from '@/lib/core/particleSystem/domain/particleSystemSettings';
import { vec3 } from 'gl-matrix';

export class FireworkSystemSettings extends ParticleSystemSettings {
  constructor(
    public origin: vec3 = [0, 0, 0],
    public minParticleSize: number = 20,
    public maxParticleSize: number = 10,
    public maxParticleSizeStep: number = 10,
    public color: vec3 = [1.0, 0, 0],
  ) {
    super();
  }
}
