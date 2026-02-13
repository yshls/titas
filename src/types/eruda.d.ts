// Type declarations for eruda
declare module 'eruda' {
  interface ErudaStatic {
    init(options?: { container?: HTMLElement; tool?: string[] }): void;
    destroy(): void;
  }
  
  const eruda: ErudaStatic;
  
  export default eruda;
}
