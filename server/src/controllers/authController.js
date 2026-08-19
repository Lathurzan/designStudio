// src/controllers/authController.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are all required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json(publicUser(req.user));
}

// PUT /api/auth/me  (update name and/or email)
async function updateMe(req, res, next) {
  try {
    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && String(existing._id) !== String(req.user._id)) {
        return res.status(409).json({ message: "That email is already in use" });
      }
    }

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/password
async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are both required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const matches = await user.comparePassword(currentPassword);
    if (!matches) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword; // the pre-save hook re-hashes since this field changed
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateMe, updatePassword };
