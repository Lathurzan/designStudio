// src/middleware/upload.js
// Files go straight to Cloudinary — the server holds the API keys,
// so the frontend never touches them. Max 10 files per request, 15MB each.
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "client-collaboration-platform",
    resource_type: "auto", // lets images AND pdfs upload correctly
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

module.exports = upload;
