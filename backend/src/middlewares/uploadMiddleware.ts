import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

export const PASTA_UPLOADS = path.resolve(__dirname, '..', '..', 'uploads');
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

const EXTENSOES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
};

// Nome aleatório: a pasta é servida publicamente, então o nome não pode ser adivinhável.
export const uploadFoto = multer({
  storage: multer.diskStorage({
    destination: PASTA_UPLOADS,
    filename: (_req, file, cb) => cb(null, randomUUID() + EXTENSOES[file.mimetype]),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (EXTENSOES[file.mimetype]) return cb(null, true);
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'foto'));
  },
}).single('foto');
