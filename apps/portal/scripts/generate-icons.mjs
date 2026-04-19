// Node.js でSVGからPNGアイコンを生成
// 依存なし（SVGを直接publicに配置）
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '../public/icons')

function makeSvg(size) {
  const fontSize = Math.round(size * 0.46)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#1e40af"/>
  <text x="50%" y="54%" font-family="Hiragino Sans,sans-serif" font-size="${fontSize}"
    font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">業</text>
</svg>`
}

writeFileSync(join(iconsDir, 'icon-192.svg'), makeSvg(192))
writeFileSync(join(iconsDir, 'icon-512.svg'), makeSvg(512))
console.log('SVG icons written to public/icons/')
console.log('NOTE: For production, convert these SVGs to PNG with:')
console.log('  npx sharp-cli -i public/icons/icon-192.svg -o public/icons/icon-192.png')
