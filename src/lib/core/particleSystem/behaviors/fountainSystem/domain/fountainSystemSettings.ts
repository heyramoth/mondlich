import { ParticleSystemSettings } from '@/lib/core/particleSystem/domain/particleSystemSettings';
import { vec3 } from 'gl-matrix';

export class FountainSystemSettings extends ParticleSystemSettings {
  constructor(
    public origin: [number, number, number] = [0, 0, 0],
    public maxParticleSize: number = 10,
    public maxParticleVelocity: number = 10,
    public color: vec3 = [1.0, 0, 0],
  ) {
    super();
  }
}
