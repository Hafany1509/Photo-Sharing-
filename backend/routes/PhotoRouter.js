const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Multer setup — lưu ảnh vào thư mục images/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET /api/photo/photosOfUser/:id
router.get("/photosOfUser/:id", requireLogin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  try {
    const photos = await Photo.find({ user_id: req.params.id });

    // Build response: thay user_id trong comment thành object {_id, first_name, last_name}
    const result = await Promise.all(
      photos.map(async (photo) => {
        const comments = await Promise.all(
          photo.comments.map(async (c) => {
            const user = await User.findById(c.user_id, "_id first_name last_name");
            return {
              _id:       c._id,
              comment:   c.comment,
              date_time: c.date_time,
              user:      user,
            };
          })
        );
        return {
          _id:       photo._id,
          user_id:   photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments:  comments,
        };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/photo/commentsOfPhoto/:photo_id
router.post("/commentsOfPhoto/:photo_id", requireLogin, async (req, res) => {
  const { comment } = req.body;
  if (!comment || comment.trim() === "") {
    return res.status(400).send("Comment cannot be empty");
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.photo_id)) {
    return res.status(400).json({ error: "Invalid photo ID" });
  }
  try {
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(400).json({ error: "Photo not found" });

    photo.comments.push({
      comment:   comment.trim(),
      date_time: new Date(),
      user_id:   req.session.user._id,
    });
    await photo.save();
    res.status(200).json({ message: "Comment added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/photo/new — upload ảnh mới
router.post("/new", requireLogin, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  try {
    const photo = await Photo.create({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id:   req.session.user._id,
    });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
