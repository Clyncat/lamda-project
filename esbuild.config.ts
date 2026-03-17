import * as esbuild from 'esbuild';
import { rmSync, statSync, writeFileSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });

const result = await esbuild.build({
  entryPoints: ['src/adapters/inbound/lambda/handler.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: 'dist/handler.mjs',
  minify: true,
  sourcemap: true,
  metafile: true,
  alias: {
    '@': './src',
  },
});

// บันทึก metafile ไว้ใช้กับ bundle analyzer
writeFileSync('dist/meta.json', JSON.stringify(result.metafile));

// แสดงแค่ summary
const { size } = statSync('dist/handler.mjs');
const kb = (size / 1024).toFixed(1);
const mb = (size / 1024 / 1024).toFixed(2);
console.log(`✅ Build complete → dist/handler.mjs (${kb} kb / ${mb} Mb)`);