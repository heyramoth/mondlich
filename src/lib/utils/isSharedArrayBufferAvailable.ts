export function isSharedArrayBufferAvailable(): boolean {
  return typeof SharedArrayBuffer !== 'undefined' && self.crossOriginIsolated;
}
