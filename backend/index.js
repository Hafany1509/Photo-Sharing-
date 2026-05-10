const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");

const app = express();

// Kết nối DB
dbConnect();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // 1 ngày
}));

// Serve ảnh tĩnh
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/admin", AdminRouter);

app.get("/", (req, res) => {
  res.json({ message: "Photo Sharing API is running!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
