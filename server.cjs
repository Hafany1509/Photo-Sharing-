"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");

// ── Load model data (ESM export → dùng dynamic import) ──────────────────────
// models.js dùng `export default` nên cần dynamic import
let models;

async function startServer() {
  const mod = await import("./src/modelData/models.js");
  models = mod.default;

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Serve static images
  app.use("/images", express.static(path.join(__dirname, "src/images")));

  // ── GET /test/info ────────────────────────────────────────────────────────
  app.get("/test/info", (req, res) => {
    res.json(models.schemaInfo());
  });

  // ── GET /user/list ────────────────────────────────────────────────────────
  app.get("/user/list", (req, res) => {
    res.json(models.userListModel());
  });

  // ── GET /user/:id ─────────────────────────────────────────────────────────
  app.get("/user/:id", (req, res) => {
    const user = models.userModel(req.params.id);
    if (!user) {
      return res.status(400).send("User not found");
    }
    res.json(user);
  });

  // ── GET /photosOfUser/:id ─────────────────────────────────────────────────
  app.get("/photosOfUser/:id", (req, res) => {
    const user = models.userModel(req.params.id);
    if (!user) {
      return res.status(400).send("User not found");
    }
    const photos = models.photoOfUserModel(req.params.id);
    res.json(photos);
  });

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
    console.log("  GET /test/info");
    console.log("  GET /user/list");
    console.log("  GET /user/:id");
    console.log("  GET /photosOfUser/:id");
  });
}

startServer();
