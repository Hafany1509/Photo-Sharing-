const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// GET /api/user/list
router.get("/list", requireLogin, async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/:id
router.get("/:id", requireLogin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  try {
    const user = await User.findById(req.params.id,
      "_id first_name last_name location description occupation");
    if (!user) return res.status(400).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user — register
router.post("/", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
  if (!login_name) return res.status(400).send("login_name is required");
  if (!password)   return res.status(400).send("password is required");
  if (!first_name) return res.status(400).send("first_name is required");
  if (!last_name)  return res.status(400).send("last_name is required");

  try {
    const existing = await User.findOne({ login_name });
    if (existing) return res.status(400).send("login_name already exists");
    const user = await User.create({ login_name, password, first_name, last_name, location, description, occupation });
    res.status(201).json({ login_name: user.login_name, _id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
