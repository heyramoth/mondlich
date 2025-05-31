import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from "url";
import eslint from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';
import crossOriginIsolation from './.vite-plugins/crossOriginIsolationPlugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        eslint(),
        dts({  rollupTypes: true, tsconfigPath: "./tsconfig.json",}),
        crossOriginIsolation(),
    ],
    build: {
        lib: {
            name: 'mondlich',
            entry: path.resolve(__dirname, './src/lib/index.ts'),
            fileName: (format) => `mondlich.${format}.js`,
            formats: ['es'],
        },
        emptyOutDir: true,
        rollupOptions: {
            external: ['gl-matrix'],
            output: {
                exports: 'named',
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})