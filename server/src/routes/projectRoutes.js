// src/routes/projectRoutes.js
const express = require("express");
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  regenerateLink,
  addComment,
  updatePageContent,
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // every route below requires a logged-in freelancer

router.post("/", createProject);
router.get("/", listProjects);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/regenerate-link", regenerateLink);
router.post("/:id/comments", addComment);
router.put("/:id/content/:page", updatePageContent);

module.exports = router;
