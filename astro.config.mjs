import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ivanmamedio.github.io',
  base: '/Projeto-Loteria',
  output: 'static',
  build: {
    assets: 'assets',
    cssCodeSplit: false,
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});