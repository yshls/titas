
declare module '@vitejs/plugin-basic-ssl' {
  import type { Plugin } from 'vite';
  
  interface BasicSslOptions {
 
    name?: string;
   
    certDir?: string;
   
    domains?: string[];
  }
  
  function basicSsl(options?: BasicSslOptions): Plugin;
  
  export default basicSsl;
}
