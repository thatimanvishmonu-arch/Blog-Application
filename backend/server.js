const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const User = require("./models/user");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend files from main project folder
app.use(express.static("../"));


// ===============================
// MONGODB CONNECTION
// ===============================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {
  res.send("Blog API is running!");
});


// ===============================
// REGISTER API
// ===============================
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ===============================
// LOGIN API
// ===============================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );
    const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }


res.json({
    message: "Login successful",
    token,
    user
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ===============================
// BLOG SCHEMA
// ===============================
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    content: {
      type: String,
      required: true
    },

    author: {
      type: String,
      default: "Anonymous"
    }
  },
  {
    timestamps: true
  }
);

const Blog = mongoose.model("Blog", blogSchema);


// ===============================
// CREATE BLOG API
// ===============================
app.post("/api/blogs", async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    const newBlog = new Blog({
      title,
      content,
      author: author || "Anonymous"
    });

    await newBlog.save();

    res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create blog"
    });
  }
});


// ===============================
// GET ALL BLOGS API
// ===============================
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.json(blogs);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch blogs"
    });
  }
});
// =========================
// UPDATE BLOG API
// =========================

app.put("/api/blogs/:id", async (req, res) => {
  try {
    const { title, content, author } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        author: author || "Anonymous"
      },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        message: "Blog not found"
      });
    }

    res.json({
      message: "Blog updated successfully",
      blog: updatedBlog
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update blog"
    });
  }
});

// ===============================
// DELETE BLOG API
// ===============================
app.delete("/api/blogs/:id", async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      message: "Blog deleted successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete blog"
    });
  }
});


// ===============================
// SERVER
// ===============================
module.exports = app;