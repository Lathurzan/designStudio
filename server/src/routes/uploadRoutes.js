// src/routes/uploadRoutes.js
const express = require("express");
const { uploadFiles } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/:id/upload", authMiddleware, upload.array("files", 10), uploadFiles);

module.exports = router;
