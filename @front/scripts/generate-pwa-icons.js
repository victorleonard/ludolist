import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const publicDir = join(__dirname, '../public')
const sourceIcon = join(publicDir, 'icon-base.png')

// Créer le dossier public/icons s'il n'existe pas
const iconsDir = join(publicDir, 'icons')
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true })
}

const sizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
]

const appleIconSizes = [
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' }
]

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...\n')

  try {
    // Générer les icônes standards
    for (const { size, name } of sizes) {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 2, g: 132, b: 199, alpha: 1 } // #0284c7 primary-700
        })
        .png()
        .toFile(join(iconsDir, name))
      console.log(`✅ Généré: ${name} (${size}x${size})`)
    }

    // Générer les icônes Apple
    console.log('\n🍎 Génération des icônes Apple...\n')
    for (const { size, name } of appleIconSizes) {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 22, g: 163, b: 74, alpha: 1 }
        })
        .png()
        .toFile(join(publicDir, name))
      console.log(`✅ Généré: ${name} (${size}x${size})`)
    }

    // Générer l'icône maskable (avec padding pour safe zone)
    console.log('\n😷 Génération de l\'icône maskable...\n')
    const maskableSize = 512
    const padding = 80 // 20% de padding pour la safe zone
    
    await sharp({
      create: {
        width: maskableSize,
        height: maskableSize,
        channels: 4,
        background: { r: 2, g: 132, b: 199, alpha: 1 }
      }
    })
      .composite([{
        input: await sharp(sourceIcon)
          .resize(maskableSize - (padding * 2), maskableSize - (padding * 2), {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .toBuffer(),
        top: padding,
        left: padding
      }])
      .png()
      .toFile(join(iconsDir, 'maskable-icon-512x512.png'))
    
    console.log('✅ Généré: maskable-icon-512x512.png (512x512)')

    // Copier l'icône principale aussi dans public
    await sharp(sourceIcon)
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'icon-512x512.png'))
    console.log('✅ Généré: icon-512x512.png dans /public')

    await sharp(sourceIcon)
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'icon-192x192.png'))
    console.log('✅ Généré: icon-192x192.png dans /public')

    console.log('\n✨ Toutes les icônes ont été générées avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error)
    process.exit(1)
  }
}

generateIcons()
