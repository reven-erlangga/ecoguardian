import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [
    svelte(),
    tailwind({ applyBaseStyles: false }),
  ],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.svelte.ts', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@components': path.resolve(__dirname, './src/components'),
        '@modules': path.resolve(__dirname, './src/modules'),
        '$shared': path.resolve(__dirname, './src/shared'),
        '$components': path.resolve(__dirname, './src/components'),
        '$modules': path.resolve(__dirname, './src/modules'),
      },
    },
  },
});