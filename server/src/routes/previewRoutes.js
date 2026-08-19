// src/routes/previewRoutes.js
// No authMiddleware anywhere in this file — these routes are public by design.
const express = require("express");
const { getPreview, addComment, approve, requestChanges } = require("../controllers/previewController");

const router = express.Router();

router.get("/:token", getPreview);
router.post("/:token/comment", addComment);
router.post("/:token/approve", approve);
router.post("/:token/request-changes", requestChanges);

module.exports = router;
