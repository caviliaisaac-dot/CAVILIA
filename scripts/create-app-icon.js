/**
 * Cria ícone do app NO CELULAR (PWA) - emblema BARBEARIA.
 * NÃO altera o emblem.png da tela inicial do app.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BARBEARIA_IMAGE = 'C:\\Users\\bsbth\\.cursor\\projects\\c-Users-bsbth-cavilia\\assets\\c__Users_bsbth_AppData_Roaming_Cursor_User_workspaceStorage_b284263b4900c2200867616a3eed4240_images_image-0ea04f8a-035e-4d2f-8bfc-6bd50015b2cc.png';
const OUTPUT_DIR = path.join(__dirname, '../public/images');

async function createIcon() {
  if (!fs.existsSync(BARBEARIA_IMAGE)) {
    console.error('Arquivo BARBEARIA não encontrado:', BARBEARIA_IMAGE);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const size of [192, 512]) {
    const out = path.join(OUTPUT_DIR, size === 512 ? 'app-icon.png' : 'app-icon-192.png');
    await sharp(BARBEARIA_IMAGE)
      .resize({ width: size, height: size, fit: 'cover' })
      .png()
      .toFile(out);
    console.log('Criado:', out);
  }
}

createIcon().catch((e) => { console.error(e); process.exit(1); });
