export class Epubook {
  constructor() {}

  async bundle() {
    const { bundle } = await import('./bundle');
    return await bundle(this);
  }
}
