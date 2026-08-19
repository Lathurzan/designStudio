// src/controllers/uploadController.js
const Project = require("../models/Project");

function fileType(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  return "other";
}

// POST /api/projects/:id/upload   (multipart/form-data, field name "files")
async function uploadFiles(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.id, freelancer: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    const newFiles = req.files.map((file) => ({
      url: file.path,           // Cloudinary secure URL (set by CloudinaryStorage)
      publicId: file.filename,  // Cloudinary public_id (set by CloudinaryStorage)
      type: fileType(file.mimetype),
      originalName: file.originalname,
    }));

    project.files.push(...newFiles);
    await project.save();

    res.status(201).json({ files: project.files });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadFiles };
