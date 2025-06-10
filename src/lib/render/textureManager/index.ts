import SparkImg from '@/assets/textures/spark.png';
import Spark2Img from '@/assets/textures/spark-emoji.png';
import ClownImg from '@/assets/textures/clown-emoji.png';
import DiamondImg from '@/assets/textures/diamond-emoji.png';
import SmokeImg from '@/assets/textures/smoke.png';
import Smoke2Img from '@/assets/textures/smoke2.png';
import FlameImg from '@/assets/textures/flame.png';
import DropImg from '@/assets/textures/drop.png';

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

  // todo: add load-on-demand
  public loadTextureLibrary(): Promise<HTMLImageElement[]> {
    return Promise.all([
      this.loadImage('spark', SparkImg),
      this.loadImage('spark2', Spark2Img),
      this.loadImage('clown', ClownImg),
      this.loadImage('diamond', DiamondImg),
      this.loadImage('smoke', SmokeImg),
      this.loadImage('smoke2', Smoke2Img),
      this.loadImage('flame', FlameImg),
      this.loadImage('drop', DropImg),
    ]);
  }
}
