const multer = require('multer');
const path = require('path');

// 1. ፎቶዎች የሚቀመጡበት ቦታ እና የስም አሰጣጥ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 2. የፋይል አይነት ፍተሻ (ምስል ብቻ እንዲቀበል)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpg, jpeg, png, webp)!'));
  }
};

// 3. ✅ እዚህ ጋር pictureupload ተብሎ ተፈጥሯል
const pictureupload = multer({ storage, fileFilter });

// 4. ✅ አሁን እዚሁ pictureupload ተብሎ Export ይደረጋል
module.exports = pictureupload;
