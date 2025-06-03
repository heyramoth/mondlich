import { ParticleSystemSettings } from '@/lib/core/particleSystem/domain/particleSystemSettings';
import { vec3 } from 'gl-matrix';

export class FireSystemSettings extends ParticleSystemSettings {
  constructor(
    public origin: vec3 = [0, 0, 0],
    public maxParticleSize: number = 10,
    public maxParticleVelocity: number = 10,
    public color: vec3 = vec3.fromValues(1.0, 1.0, 1.0),
  ) {
    super();
  }
}
