const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Upload destination:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    console.log('Upload filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('Upload file filter:', file.originalname, file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload; 