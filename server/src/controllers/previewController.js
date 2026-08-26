// src/controllers/previewController.js
// PUBLIC controller — every function here is reachable with no auth token,
// using only the shareToken from the URL. Every response is built from an
// explicit allow-list of fields so a client link can NEVER leak the
// freelancer's account info or any other project.
const Project = require("../models/Project");

const PUBLIC_FIELDS =
  "name clientName status templateId themeId motionId pages brandName sectionTemplates content files comments createdAt";

function trimmed(project) {
  return {
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    templateId: project.templateId,
    themeId: project.themeId,
    motionId: project.motionId,
    pages: project.pages,
    brandName: project.brandName,
    sectionTemplates: project.sectionTemplates,
    content: project.content,
    files: project.files,
    comments: project.comments,
    createdAt: project.createdAt,
  };
}

// GET /api/preview/:token
async function getPreview(req, res, next) {
  try {
    const project = await Project.findOne({ shareToken: req.params.token }).select(PUBLIC_FIELDS);
    if (!project) return res.status(404).json({ message: "This link is no longer valid" });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// POST /api/preview/:token/comment
async function addComment(req, res, next) {
  try {
    const { authorName, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const project = await Project.findOne({ shareToken: req.params.token });
    if (!project) return res.status(404).json({ message: "This link is no longer valid" });

    project.comments.push({
      authorName: (authorName || "Client").trim(),
      authorType: "client",
      text: text.trim(),
    });
    await project.save();

    res.json(trimmed(project));
  } catch (err) {
    next(err);
  }
}

// POST /api/preview/:token/approve
async function approve(req, res, next) {
  try {
    const project = await Project.findOne({ shareToken: req.params.token });
    if (!project) return res.status(404).json({ message: "This link is no longer valid" });

    project.status = "approved";
    await project.save();
    res.json(trimmed(project));
  } catch (err) {
    next(err);
  }
}

// POST /api/preview/:token/request-changes
async function requestChanges(req, res, next) {
  try {
    const project = await Project.findOne({ shareToken: req.params.token });
    if (!project) return res.status(404).json({ message: "This link is no longer valid" });

    project.status = "changes_requested";
    await project.save();
    res.json(trimmed(project));
  } catch (err) {
    next(err);
  }
}

module.exports = { getPreview, addComment, approve, requestChanges };
