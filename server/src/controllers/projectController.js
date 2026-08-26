// src/controllers/projectController.js
const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const generateShareToken = require("../utils/shareToken");

// Ownership check helper — a freelancer can only ever touch their own projects.
async function findOwnedProject(projectId, userId) {
  const project = await Project.findOne({ _id: projectId, freelancer: userId });
  return project;
}

// POST /api/projects
async function createProject(req, res, next) {
  try {
    const { name, clientName, clientEmail, description, templateId, themeId, motionId, pages } = req.body;
    if (!name || !clientName) {
      return res.status(400).json({ message: "Project name and client name are required" });
    }

    const project = await Project.create({
      freelancer: req.user._id,
      name,
      clientName,
      clientEmail,
      description,
      shareToken: generateShareToken(),
      // omit-if-undefined so Mongoose's schema defaults (modern/blue/smooth/all pages) still apply
      ...(templateId !== undefined && { templateId }),
      ...(themeId !== undefined && { themeId }),
      ...(motionId !== undefined && { motionId }),
      ...(pages !== undefined && { pages }),
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

// GET /api/projects
async function listProjects(req, res, next) {
  try {
    const projects = await Project.find({ freelancer: req.user._id }).sort("-updatedAt");
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:id
async function getProject(req, res, next) {
  try {
    const project = await findOwnedProject(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// PUT /api/projects/:id
async function updateProject(req, res, next) {
  try {
    const project = await findOwnedProject(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const allowed = [
      "name", "clientName", "clientEmail", "description", "status",
      "templateId", "themeId", "motionId", "pages", "brandName", "sectionTemplates",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:id
async function deleteProject(req, res, next) {
  try {
    const project = await findOwnedProject(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Best-effort Cloudinary cleanup — don't block deletion if this fails.
    await Promise.all(
      project.files.map((f) =>
        cloudinary.uploader.destroy(f.publicId).catch(() => null)
      )
    );

    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:id/regenerate-link
async function regenerateLink(req, res, next) {
  try {
    const project = await findOwnedProject(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.shareToken = generateShareToken();
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:id/comments  (freelancer leaving a note for the client)
async function addComment(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const project = await findOwnedProject(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.comments.push({ authorName: req.user.name, authorType: "freelancer", text: text.trim() });
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// PUT /api/projects/:id/content/:page
// Replaces ONE page's entire content object — never a partial field patch.
// A page is either "using the template default" (content.<page> is null)
// or "using exactly what the freelancer wrote," never a confusing mix.
const EDITABLE_PAGES = ["home", "about", "services", "contact", "nav", "footer"];
async function updatePageContent(req, res, next) {
  try {
    const { page } = req.params;
    if (!EDITABLE_PAGES.includes(page)) {
      return res.status(400).json({ message: `Invalid page — must be one of ${EDITABLE_PAGES.join(", ")}` });
    }
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Request body must be the page's content object" });
    }

    const project = await findOwnedProject(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.content = { ...(project.content ? project.content.toObject?.() ?? project.content : {}), [page]: req.body };
    project.markModified("content"); // Mongoose can't auto-detect deep mutations on a Mixed field
    await project.save();

    res.json(project);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  regenerateLink,
  addComment,
  updatePageContent,
};
