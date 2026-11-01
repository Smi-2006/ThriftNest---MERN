require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const User = require("./User");
const Product = require("./Product");

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Shopping App Backend is Running!");
});

// USER REGISTRATION
app.post("/api/users", async (req, res) => {
    try {
        const { username, emailId, age, password } = req.body;

        if (!username || !emailId || !age || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (Number(age) <= 0 || !Number.isFinite(Number(age))) {
            return res.status(400).json({
                message: "Please enter a valid age"
            });
        }

        const existingUser = await User.findOne({ emailId });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const user = await User.create({
            username,
            emailId,
            age: Number(age),
            password
        });

        return res.status(201).json({
            message: `Successfully registered! Welcome, ${user.username}.`
        });

    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        return res.status(500).json({
            message: "Registration failed"
        });
    }
});

// USER LOGIN - GENERATE JWT TOKEN
app.post("/api/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).json({
                message: "User Not Registered."
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid Password."
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                emailId: user.emailId
            },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.status(200).json({
            message: "Login successful",
            username: user.username,
            token: token
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Login failed"
        });
    }
});

// JWT AUTHENTICATION MIDDLEWARE
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please login to view products"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired login token"
        });
    }
};

// GET PRODUCTS - PROTECTED ROUTE
app.get("/api/products", verifyToken, async (req, res) => {
    try {
        const products = await Product.find();

        return res.status(200).json(products);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error retrieving products"
        });
    }
});

// PUT - UPDATE COMPLETE USER DETAILS
app.put("/api/users", async (req, res) => {
    try {
        const { emailId } = req.query;
        const { username, age, password } = req.body;

        if (!emailId || !username || !age || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user = await User.findOneAndUpdate(
            { emailId },
            {
                username,
                age: Number(age),
                password
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User details updated successfully",
            user
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Update failed"
        });
    }
});

// PATCH - UPDATE SELECTED USER DETAILS
app.patch("/api/users", async (req, res) => {
    try {
        const { emailId } = req.query;

        if (!emailId) {
            return res.status(400).json({
                message: "Email ID is required"
            });
        }

        const updates = {};

        if (req.body.username !== undefined) {
            updates.username = req.body.username;
        }

        if (req.body.age !== undefined) {
            updates.age = Number(req.body.age);
        }

        if (req.body.password !== undefined) {
            updates.password = req.body.password;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No fields to update"
            });
        }

        const user = await User.findOneAndUpdate(
            { emailId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Selected user details updated successfully",
            user
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Update failed"
        });
    }
});

// DELETE USER
app.delete("/api/users", async (req, res) => {
    try {
        const { emailId } = req.query;

        if (!emailId) {
            return res.status(400).json({
                message: "Email ID is required"
            });
        }

        const user = await User.findOneAndDelete({ emailId });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Deletion failed"
        });
    }
});

// CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });
