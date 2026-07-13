import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const cssFiles = [
  'css/normalize.css',
  'css/swiper.min.css',
  'css/pannellum.css',
  'css/style.css'
]

let bundle = `/* kccc.info bundled CSS - ${new Date().toISOString().split('T')[0]} */\n`

for (const file of cssFiles) {
  const content = await readFile(file, 'utf-8')
  bundle += `\n/* --- ${path.basename(file)} --- */\n${content}\n`
}

// 간단한 minify: 주석·불필요 공백 제거
const minified = bundle
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>+~])\s*/g, '$1')
  .trim()

await writeFile('css/bundle.css', bundle)
await writeFile('css/bundle.min.css', minified)

console.log(`✓ css/bundle.css (${(bundle.length / 1024).toFixed(1)}KB)`)
console.log(`✓ css/bundle.min.css (${(minified.length / 1024).toFixed(1)}KB)`)
