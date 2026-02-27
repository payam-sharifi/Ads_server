declare module '@jimp/wasm-webp' {
  import type { JimpFormat } from '@jimp/core';
  const webp: () => JimpFormat;
  export default webp;
}
