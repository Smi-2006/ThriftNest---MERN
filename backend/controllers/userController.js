
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ========================================
// REGISTER USER
// ========================================

const registerUser = async (req, res) => {
    try {
        const { username, emailId, age, password, role } = req.body;

        if (!username || !emailId || !age || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const selectedRole = role || "customer";

        if (!["customer", "seller"].includes(selectedRole)) {
            return res.status(400).json({
                message: "Role must be customer or seller"
            });
        }

        const normalizedEmail = emailId.trim().toLowerCase();

        const existingUser = await User.findOne({
            emailId: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username: username.trim(),
            emailId: normalizedEmail,
            age: Number(age),
            password: hashedPassword,
            role: selectedRole,
            points: 0
        });

        return res.status(201).json({
            message: "Registration successful!",
            user: {
                id: user._id,
                username: user.username,
                emailId: user.emailId,
                age: user.age,
                role: user.role,
                points: user.points
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Registration failed"
        });
    }
};


// ========================================
// LOGIN USER
// ========================================

const loginUser = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            emailId: emailId.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Support bcrypt hashes and migrate old plaintext passwords
        const isMatch = user.password.startsWith("$2")
            ? await bcrypt.compare(password, user.password)
            : user.password === password;

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Migrate an old plaintext password after successful login
        if (!user.password.startsWith("$2")) {
            user.password = await bcrypt.hash(password, 10);
        }

        // Existing users without a role are treated as customers
        if (!user.role) {
            user.role = "customer";
        }

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                emailId: user.emailId,
                age: user.age,
                role: user.role,
                points: user.points
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed"
        });
    }
};


// ========================================
// UPDATE USER
// ========================================

const updateUser = async (req, res) => {
    try {
        const updates = {};

        if (req.body.username !== undefined) {
            if (
                typeof req.body.username !== "string" ||
                !req.body.username.trim()
            ) {
                return res.status(400).json({
                    message: "Invalid username"
                });
            }

            updates.username = req.body.username.trim();
        }

        if (req.body.age !== undefined) {
            const age = Number(req.body.age);

            if (!Number.isInteger(age) || age < 1) {
                return res.status(400).json({
                    message: "Invalid age"
                });
            }

            updates.age = age;
        }

        if (req.body.password !== undefined) {
            if (
                typeof req.body.password !== "string" ||
                req.body.password.length < 8
            ) {
                return res.status(400).json({
                    message: "Password must contain at least 8 characters"
                });
            }

            updates.password = await bcrypt.hash(
                req.body.password,
                10
            );
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user
        });

    } catch (error) {
        console.error("Update user error:", error);

        return res.status(500).json({
            message: "User update failed"
        });
    }
};


// ========================================
// DELETE USER
// ========================================

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(
            req.user.userId
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);

        return res.status(500).json({
            message: "Account deletion failed"
        });
    }
};


// ========================================
// GET REWARD POINTS
// ========================================

const getRewardPoints = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("username points");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Reward points retrieved successfully",
            username: user.username,
            points: user.points
        });

    } catch (error) {
        console.error("Reward points error:", error);

        return res.status(500).json({
            message: "Unable to retrieve reward points"
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getRewardPoints
};
