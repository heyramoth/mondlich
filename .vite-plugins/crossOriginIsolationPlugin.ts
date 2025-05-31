import { Plugin } from 'vite';

export default function crossOriginIsolation(): Plugin {
  return {
    name: 'vite-plugin-coi',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        next();
      });
    },
  };
}
