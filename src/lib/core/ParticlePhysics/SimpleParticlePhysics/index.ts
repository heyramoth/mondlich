import { ParticlePool } from '@/lib/core/particlePool';
import { ParticlePhysics } from '../ParticlePhysics';

export class SimpleParticlePhysics extends ParticlePhysics {
  update(dt: number, i: number, pool: ParticlePool): void {
    const posIdx = i * 3;
    const velIdx = i * 3;

    pool.lives[i] -= dt;
    pool.sizes[i] -= dt * pool.decays[i];

    const Cd = 0.47; // Dimensionless
    const rho = 1.22; // kg / m^3
    const A = Math.PI / 10000;

    let Fx = -0.5 * Cd * A * rho * pool.velocities[velIdx] * pool.velocities[velIdx] * pool.velocities[velIdx] / Math.abs(pool.velocities[velIdx]);
    let Fz = -0.5 * Cd * A * rho * pool.velocities[velIdx + 2] * pool.velocities[velIdx + 2] * pool.velocities[velIdx + 2] / Math.abs(pool.velocities[velIdx + 2]);
    let Fy = -0.5 * Cd * A * rho * pool.velocities[velIdx + 1] * pool.velocities[velIdx + 1] * pool.velocities[velIdx + 1] / Math.abs(pool.velocities[velIdx + 1]);

    Fx = isNaN(Fx) ? 0 : Fx;
    Fy = isNaN(Fy) ? 0 : Fy;
    Fz = isNaN(Fz) ? 0 : Fz;

    const ax = Fx / pool.masses[i];
    const ay = pool.gravities[i] + (Fy / pool.masses[i]);
    const az = Fz / pool.masses[i];

    pool.velocities[velIdx] += ax * dt;
    pool.velocities[velIdx + 1] += ay * dt;
    pool.velocities[velIdx + 2] += az * dt;

    pool.positions[posIdx] += pool.velocities[velIdx] * dt * 100;
    pool.positions[posIdx + 1] += pool.velocities[velIdx + 1] * dt * 100;
    pool.positions[posIdx + 2] += pool.velocities[velIdx + 2] * dt * 100;
  }

  reset(i: number, pool: ParticlePool): void {
    const posIdx = i * 3;
    const velIdx = i * 3;
    const colIdx = i * 3;

    pool.positions[posIdx] = 0;
    pool.positions[posIdx + 1] = 0;
    pool.positions[posIdx + 2] = 0;
    pool.velocities[velIdx] = 0;
    pool.velocities[velIdx + 1] = 0;
    pool.velocities[velIdx + 2] = 0;
    pool.masses[i] = 1;
    pool.aliveStatus[i] = 0;
    pool.sizes[i] = 0;
    pool.decays[i] = 0;
    pool.lives[i] = 0;
    pool.gravities[i] = -9.82;
    pool.colors[colIdx] = 1;
    pool.colors[colIdx + 1] = 1;
    pool.colors[colIdx + 2] = 1;
    pool.conditionCallbacks.set(i, () => false);
    pool.actionCallbacks.set(i, () => {});
    pool.effectCallbacks.set(i, () => {});
  }

  launchEffects(dt: number, time: number, i: number, pool: ParticlePool): void {
    const data = pool.getParticle(i);

    if (data.condition(data, dt, time)) {
      data.action(data, dt, time);
      this.reset(i, pool);
    }

    data.effect(data, dt, time);

    if (pool.lives[i] <= 0 || pool.sizes[i] <= 0) {
      this.reset(i, pool);
    }
  }
}
