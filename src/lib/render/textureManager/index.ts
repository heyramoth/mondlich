export class TextureManager {
  private textureCache: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();

  public async loadImage(url: string): Promise<HTMLImageElement> {
    const cachedTexture = this.textureCache.get(url);
    if (cachedTexture) {
      return cachedTexture;
    }

    const image: HTMLImageElement = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    await image.decode();

    this.textureCache.set(url, image);
    return image;
  }

  public getTexture(url: string): HTMLImageElement {
    const texture = this.textureCache.get(url);
    if (!texture) throw new Error(`Texture "${url}" not loaded.`);
    return texture;
  }
}
