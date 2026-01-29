import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/error.middleware';
import * as importService from '../services/import.service';
import { IMPORT_CONFIG } from '@ppop/config';
import { AppError } from '@ppop/utils';
import path from 'path';

export const importRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMPORT_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (IMPORT_CONFIG.SUPPORTED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'));
    }
  },
});

// POST /api/import/file
importRouter.post(
  '/file',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 'NO_FILE', 400);
    }

    const result = await importService.importFromFile(req.file.buffer, req.file.originalname);
    res.json({ success: true, data: result });
  })
);

// GET /api/import/template
importRouter.get('/template', (_req, res) => {
  res.json({
    success: true,
    data: {
      requiredColumns: IMPORT_CONFIG.REQUIRED_COLUMNS,
      supportedFormats: IMPORT_CONFIG.SUPPORTED_EXTENSIONS,
      maxFileSizeMB: IMPORT_CONFIG.MAX_FILE_SIZE_MB,
    },
  });
});
