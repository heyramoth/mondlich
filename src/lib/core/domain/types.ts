export type TParticleData = {
  x: number,
  y: number,
  z: number,
  vx: number,
  vy: number,
  vz: number,
  mass: number,
  alive: boolean,
  size: number,
  decay: number,
  life: number,
  gravity: number,
  r: number,
  g: number,
  b: number,
};

export type TParticleCallbacks = {
  isActionTriggered: (data: TParticleData, dt: number, time: number) => boolean,
  action: (data: TParticleData, dt: number, time: number) => void,
  persistentEffect: (data: TParticleData, dt: number, time: number) => void,
};
