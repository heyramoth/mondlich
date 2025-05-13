export const loadImage = async (src: string): Promise<HTMLImageElement> => {
  console.log(`Loading texture ${src}...`);
  const image: HTMLImageElement = new Image();
  image.crossOrigin = 'anonymous';
  image.src = src;
  await image.decode();
  console.log(`Loaded texture ${src}.`);
  return image;
};
