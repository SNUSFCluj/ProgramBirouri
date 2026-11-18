/// <reference types="vite/client" />

/** Versiunea din package.json, pusă la compilare. */
declare const __VERSIUNE__: string;

declare module '*?url' {
  const src: string;
  export default src;
}
