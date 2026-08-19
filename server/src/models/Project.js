// src/models/Project.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },       // Cloudinary secure URL
    publicId: { type: String, required: true },   // Cloudinary public_id (needed to delete later)
    type: { type: String, enum: ["image", "pdf", "other"], default: "image" },
    originalName: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  authorType: { type: String, enum: ["freelancer", "client"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, trim: true, lowercase: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "in_review", "changes_requested", "approved"],
      default: "draft",
    },
    shareToken: { type: String, required: true, unique: true, index: true },

    // ---- template/theme/motion/pages config — mirrors lib/templateEngine.ts on the frontend ----
    templateId: { type: String, enum: ["modern", "minimal", "bold"], default: "modern" },
    themeId: {
      type: String,
      enum: ["blue", "green", "purple", "orange", "dark", "neutral"],
      default: "blue",
    },
    motionId: { type: String, enum: ["subtle", "smooth", "dynamic"], default: "smooth" },
    pages: {
      type: [{ type: String, enum: ["home", "about", "services", "contact", "login"] }],
      default: ["home", "about", "services", "contact", "login"],
    },

    // ---- freelancer-editable copy (page-level replacement, mirrors lib/templateEngine.ts's
    // resolveContent()) — a single flexible Mixed object rather than named sub-fields, so new
    // editable sections (nav, footer, future pages) never require a schema change. Keys are
    // whatever updatePageContent's :page param allows — see EDITABLE_PAGES in
    // projectController.js. Each key's own shape is already fully typed on the frontend via
    // the exported ContentHome/ContentAbout/ContentServices/ContentContact/ContentNav/ContentFooter interfaces.
    brandName: { type: String, trim: true }, // overrides the template's built-in business name; empty = use template default
    content: { type: mongoose.Schema.Types.Mixed, default: {} },

    files: [fileSchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
