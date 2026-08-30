const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "..")));

// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });


// ===============================
// USER MODEL
// ===============================

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);


// ===============================
// BLOG MODEL
// ===============================

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        author: {
            type: String,
            default: "Anonymous"
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

const Blog = mongoose.model("Blog", blogSchema);


// ===============================
// REGISTER
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

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});


// ===============================
// LOGIN + JWT
// ===============================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

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

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // CREATE JWT TOKEN
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});


// ===============================
// JWT MIDDLEWARE
// ===============================

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please login."
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, user) => {

            if (error) {
                return res.status(403).json({
                    message: "Invalid or expired token"
                });
            }

            req.user = user;

            next();
        }
    );
}


// ===============================
// CREATE BLOG
// ===============================

app.post("/api/blogs", authenticateToken, async (req, res) => {

    try {

        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const user = await User.findById(req.user.userId);

        const blog = new Blog({
            title,
            content,
            author: user ? user.name : "Anonymous",
            userId: req.user.userId
        });

        await blog.save();

        res.status(201).json({
            message: "Blog created successfully",
            blog
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create blog"
        });
    }
});


// ===============================
// GET USER BLOGS
// ===============================

app.get("/api/blogs", authenticateToken, async (req, res) => {

    try {

        const blogs = await Blog.find({
            userId: req.user.userId
        }).sort({
            createdAt: -1
        });

        res.json(blogs);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch blogs"
        });
    }
});


// ===============================
// GET SINGLE BLOG
// ===============================

app.get("/api/blogs/:id", authenticateToken, async (req, res) => {

    try {

        const blog = await Blog.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(blog);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch blog"
        });
    }
});


// ===============================
// UPDATE BLOG
// ===============================

app.put("/api/blogs/:id", authenticateToken, async (req, res) => {

    try {

        const { title, content } = req.body;

        const updatedBlog = await Blog.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.userId
            },
            {
                title,
                content
            },
            {
                new: true,
                runValidators: true
            }
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
// DELETE BLOG
// ===============================

app.delete("/api/blogs/:id", authenticateToken, async (req, res) => {

    try {

        const deletedBlog = await Blog.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!deletedBlog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

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
// HOME PAGE
// ===============================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "index.html")
    );
});


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});