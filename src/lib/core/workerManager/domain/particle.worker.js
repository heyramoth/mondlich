class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.mass = 0;
    this.alive = false;
    this.size = 0;
    this.decay = 0;
    this.life = 0;
    this.gravity = -9.82;
  }

  /**
     * @param {number} dt
     */
  update(dt) {
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
  }
}

self.onmessage = function(e) {

  const {
    positions,
    sizes,
    frameDelta,
    particlesCount,
    velocities,
    masses,
    decays,
    lives,
    gravities,
    aliveStatus,
  } = e.data;

  // TODO: refactor
  const updatedPositions = new Float32Array(positions);
  const updatedSizes = new Float32Array(sizes);
  const updatedVelocities = new Float32Array(velocities);
  const updatedMasses = new Float32Array(masses);
  const updatedDecays = new Float32Array(decays);
  const updatedLives = new Float32Array(lives);

  const particle = new Particle();
  for (let i = 0, posIdx = 0, velIdx = 0; i < particlesCount; i++) {
    posIdx = i * 3;
    velIdx = i * 3;

    if (aliveStatus[i] !== 1) continue;

    particle.x = positions[posIdx];
    particle.y = positions[posIdx + 1];
    particle.z = positions[posIdx + 2];
    particle.vx = velocities[velIdx];
    particle.vy = velocities[velIdx + 1];
    particle.vz = velocities[velIdx + 2];
    particle.mass = masses[i];
    particle.alive = aliveStatus[i] === 1;
    particle.size = sizes[i];
    particle.decay = decays[i];
    particle.life = lives[i];
    particle.gravity = gravities[i];

    particle.update(frameDelta);

    updatedPositions[posIdx] = particle.x;
    updatedPositions[posIdx + 1] = particle.y;
    updatedPositions[posIdx + 2] = particle.z;
    updatedVelocities[velIdx] = particle.vx;
    updatedVelocities[velIdx + 1] = particle.vy;
    updatedVelocities[velIdx + 2] = particle.vz;
    updatedSizes[i] = particle.size;
    updatedMasses[i] = particle.mass;
    updatedDecays[i] = particle.decay;
    updatedLives[i] = particle.life;
  }


  const data = {
    positions: updatedPositions,
    sizes: updatedSizes,
    velocities: updatedVelocities,
    masses: updatedMasses,
    decays: updatedDecays,
    lives: updatedLives,
  };
  self.postMessage(data, {
    transfer: [
      updatedPositions.buffer,
      updatedSizes.buffer,
      updatedVelocities.buffer,
      updatedMasses.buffer,
      updatedDecays.buffer,
      updatedLives.buffer,
    ],
  });
};
