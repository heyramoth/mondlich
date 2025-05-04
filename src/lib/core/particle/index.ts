import { TColor } from '@/lib/core/domain/types';

export class Particle {
  i: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mass: number;
  alive: boolean;
  size: number;
  color: TColor;
  decay: number;
  life: number;
  gravity: number;

  condition: (particle: Particle, dt: number, time: number) => boolean;
  action: (particle: Particle, dt: number, time: number) => void;
  effect: (particle: Particle, dt: number, time: number) => void;

  constructor(i: number) {
    this.i = i;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.mass = 0;
    this.alive = false;
    this.size = 0;
    this.color = [1,1,1];
    this.decay = 0;
    this.life = 0;
    this.gravity = -9.82;

    this.condition = () => false;

    this.action = () => {};

    this.effect = () => {};
  }

  update(dt: number, time: number): void {
    this.life -= dt;
    this.size -= dt * this.decay;

    const Cd = 0.47; // Dimensionless
    const rho = 1.22; // kg / m^3
    const A = Math.PI / 10000;
    let Fx = -0.5 * Cd * A * rho * this.vx * this.vx * this.vx / Math.abs(this.vx);
    let Fz = -0.5 * Cd * A * rho * this.vz * this.vz * this.vz / Math.abs(this.vz);
    let Fy = -0.5 * Cd * A * rho * this.vy * this.vy * this.vy / Math.abs(this.vy);

    Fx = isNaN(Fx) ? 0 : Fx;
    Fy = isNaN(Fy) ? 0 : Fy;
    Fz = isNaN(Fz) ? 0 : Fz;

    // Calculate acceleration ( F = ma )
    const ax = Fx / this.mass;
    const ay = this.gravity + (Fy / this.mass);
    const az = Fz / this.mass;

    // Integrate to get velocity
    this.vx += ax * dt;
    this.vy += ay * dt;
    this.vz += az * dt;

    // Integrate to get position
    this.x += this.vx * dt * 100;
    this.z += this.vz * dt * 100;
    this.y += this.vy * dt * 100;

    if (this.condition(this, dt, time)) {
      this.action(this, dt, time);
      this.reset();
    }

    this.effect(this, dt, time);

    if (this.life <= 0 || this.size <= 0) {
      this.reset();
    }
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.mass = 0;
    this.alive = false;
    this.size = 0;
    this.decay = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.life = 0;
  }
}
