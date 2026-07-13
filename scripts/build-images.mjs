import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import path from 'path'

const imgDir = 'img'

// GIF → 애니메이션 WebP, 나머지 래스터 → 정적 WebP
const animatedGifs = ['home.gif', 'relation.gif', 'grow-up.gif', 'festival.gif', 'mission.gif']

const staticTargets = [
  '360.jpeg',
  '01.jpeg', '02.jpeg', '03.jpeg', '04.jpeg',
  'soon3.jpeg', 'soon4.jpg',
  'sc3.jpg', 'sc4.jpeg',
  'short3.jpg', 'short4.jpg',
  'welcome.png', 'contact-bg.png', 'main_background.png', 'thumbnail.png'
]

const convertAnimatedGif = async (filename) => {
  const inputPath = path.join(imgDir, filename)
  const outputPath = path.join(imgDir, filename.replace(/\.gif$/i, '.webp'))

  await sharp(inputPath, { animated: true })
    .webp({ quality: 75, effort: 4 })
    .toFile(outputPath)

  const inputSize = (await stat(inputPath)).size
  const outputSize = (await stat(outputPath)).size
  console.log(`✓ ${filename} → ${path.basename(outputPath)} (${formatSize(inputSize)} → ${formatSize(outputSize)})`)
}

const convertStatic = async (filename) => {
  const inputPath = path.join(imgDir, filename)
  const baseName = filename.replace(/\.(jpe?g|png)$/i, '')
  const outputPath = path.join(imgDir, `${baseName}.webp`)

  try {
    await stat(inputPath)
  } catch {
    console.log(`⊘ ${filename} 없음, 건너뜀`)
    return
  }

  await sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(outputPath)

  const inputSize = (await stat(inputPath)).size
  const outputSize = (await stat(outputPath)).size
  console.log(`✓ ${filename} → ${path.basename(outputPath)} (${formatSize(inputSize)} → ${formatSize(outputSize)})`)
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

console.log('이미지 WebP 변환 시작...\n')

for (const gif of animatedGifs) {
  await convertAnimatedGif(gif)
}

for (const file of staticTargets) {
  await convertStatic(file)
}

console.log('\n이미지 변환 완료')
