import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
  // Versiunea ajunge în aplicație, ca să se vadă dintr-o privire ce build rulează.
  define: { __VERSIUNE__: JSON.stringify(version) },
  base: './',
  plugins: [react()],
  server: { port: 3000, host: '0.0.0.0', allowedHosts: true },
});
