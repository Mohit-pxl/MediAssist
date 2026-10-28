
const multer = require("multer");

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPEG, PNG, and PDF files are allowed")
      );
    }

    callback(null, true);
  },
});

module.exports = upload;
