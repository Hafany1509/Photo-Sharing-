const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;
  if (!login_name) return res.status(400).send("login_name is required");

  try {
    const user = await User.findOne({ login_name });
    if (!user) return res.status(400).send("Invalid login_name");
    if (user.password !== password) return res.status(400).send("Invalid password");

    // Lưu vào session
    req.session.user = {
      _id:        user._id,
      first_name: user.first_name,
      last_name:  user.last_name,
      login_name: user.login_name,
    };
    res.json({
      _id:        user._id,
      first_name: user.first_name,
      last_name:  user.last_name,
      login_name: user.login_name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(400).send("No user is logged in");
  }
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.status(200).json({ message: "Logged out" });
  });
});

// GET /api/admin/session — check session còn không
router.get("/session", (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

module.exports = router;
