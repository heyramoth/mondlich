type TInterval = {
  min: number,
  max: number,
};

export const getInInterval = (int: TInterval): number => int.min + Math.random() * (int.max - int.min);
