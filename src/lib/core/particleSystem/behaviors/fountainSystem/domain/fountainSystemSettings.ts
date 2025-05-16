import { ParticleSystemSettings } from '@/lib/core/particleSystem/domain/particleSystemSettings';
import { TColor } from '@/lib/core/domain/types';

export class FountainSystemSettings extends ParticleSystemSettings {
  constructor(
    public origin: [number, number, number] = [0, 0, 0],
    public maxParticleSize: number = 10,
    public maxParticleVelocity: number = 10,
    public color: TColor = [1.0, 0, 0],
  ) {
    super();
  }
}
