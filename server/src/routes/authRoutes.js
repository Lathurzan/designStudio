// src/routes/authRoutes.js
const express = require("express");
const { register, login, me, updateMe, updatePassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateMe);
router.put("/password", authMiddleware, updatePassword);

module.exports = router;
