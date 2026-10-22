// 用法：node /data/tools/stills.mjs <compId> <outDir> frame1 frame2 ...（一次打包，逐帧渲染静帧）
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [comp, out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp});
for (const fr of frames) {
  await renderStill({serveUrl, composition, frame: Number(fr), output: `${out}/f${String(fr).padStart(5, '0')}.jpg`, imageFormat: 'jpeg', scale: 0.5, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log('ok', fr);
}
process.exit(0);
