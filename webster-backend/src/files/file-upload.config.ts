import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';

export const fileUploadConfig = {
  storage: diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${randomUUID()}${ext}`;
      cb(null, filename);
    },
  }),

  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
