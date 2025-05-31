declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.worker.js?worker&url' {
  const url: string;
  export default url;
}
