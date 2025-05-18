import SparkImg from '@/assets/textures/spark.png';

export class TextureManager {
  private textureCache: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();

  public async loadImage(id: string, url: string): Promise<HTMLImageElement> {
    const cachedTexture = this.textureCache.get(url);
    if (cachedTexture) {
      return cachedTexture;
    }

    const image: HTMLImageElement = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    await image.decode();

    this.textureCache.set(id, image);
    return image;
  }

  public getTexture(id: string): HTMLImageElement {
    const texture = this.textureCache.get(id);
    if (!texture) throw new Error(`Texture with id "${id}" not loaded.`);
    return texture;
  }

  public loadTextureLibrary(): Promise<HTMLImageElement[]> {
    return Promise.all([
      this.loadImage('spark', SparkImg),
    ]);
  }
}
