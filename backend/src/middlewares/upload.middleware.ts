import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },

  filename: (req, file, cb) => {
    const nombreUnico =
      Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(
      null,
      nombreUnico + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage
});

export default upload;