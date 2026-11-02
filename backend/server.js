const crypto = require("crypto");
require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");

const { body, validationResult } = require("express-validator");

const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.MONGO_URI || !JWT_SECRET) {
    throw new Error("MONGO_URI and JWT_SECRET must be configured in .env");
}

// ========================================
// MIDDLEWARE
// ========================================

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// NoSQL injection protection for request bodies
const checkInput = (value) => {
    if (Array.isArray(value)) {
        return value.every(checkInput);
    }

    if (value !== null && typeof value === "object") {
        return Object.entries(value).every(([key, val]) => {
            if (key.startsWith("$") || key.includes(".")) {
                return false;
            }

            return checkInput(val);
        });
    }

    return true;
};

app.use((req, res, next) => {
    if (!checkInput(req.body)) {
        return res.status(400).json({
            message: "Invalid input detected"
        });
    }

    next();
});

// Validation error handler
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }

    next();
};

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {
    res.send("Thrift Store Backend is Running!");
});

// ========================================
// USER REGISTRATION
// POST /api/users
// ========================================

app.post(
    "/api/users",
    [
        body("username").isString().trim().notEmpty(),
        body("emailId").isString().trim().isEmail(),
        body("age").isInt({ min: 1 }),
        body("password").isString().isLength({ min: 8 }),
        checkValidation
    ],
    async (req, res) => {
        try {
            const username = req.body.username.trim();
            const emailId = req.body.emailId.trim().toLowerCase();
            const age = Number(req.body.age);
            const password = req.body.password;

            const existingUser = await User.findOne({ emailId });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                username,
                emailId,
                age,
                password: hashedPassword,
                points: 0
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
    }
);

// ========================================
// USER LOGIN
// POST /api/login
// ========================================

app.post(
    "/api/login",
    [
        body("emailId").isString().trim().isEmail(),
        body("password").isString().notEmpty(),
        checkValidation
    ],
    async (req, res) => {
        try {
            const emailId = req.body.emailId.trim().toLowerCase();
            const password = req.body.password;

            const user = await User.findOne({ emailId });

            if (!user) {
                return res.status(404).json({
                    message: "User Not Registered."
                });
            }

            let isMatch;

            // Temporary support for old plaintext passwords
            if (user.password.startsWith("$2")) {
                isMatch = await bcrypt.compare(
                    password,
                    user.password
                );
            } else {
                isMatch = user.password === password;

                if (isMatch) {
                    user.password = await bcrypt.hash(password, 10);
                    await user.save();
                }
            }

            if (!isMatch) {
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
                { expiresIn: "15m" }
            );

            return res.status(200).json({
                message: "Login successful",
                username: user.username,
                token
            });

        } catch (error) {
            console.log(error);

            return res.status(500).json({
                message: "Login failed"
            });
        }
    }
);

// ========================================
// JWT AUTHENTICATION MIDDLEWARE
// ========================================

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please login first"
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

// ========================================
// GET ALL AVAILABLE PRODUCTS
// GET /api/products
// ========================================

app.get("/api/products", verifyToken, async (req, res) => {
    try {
        const products = await Product.find({
            status: "Available",
            quantity: { $gt: 0 }
        });

        return res.status(200).json(products);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error retrieving products"
        });
    }
});

// ========================================
// ADD PRODUCT
// POST /api/products
// SELLER ONLY (AUTHENTICATED USER)
// ========================================

app.post(
    "/api/products",
    verifyToken,

    [
        body("productId")
            .isString()
            .trim()
            .notEmpty(),

        body("productName")
            .isString()
            .trim()
            .notEmpty(),

        body("productPrice")
            .isFloat({ min: 0 }),

        body("category")
            .isString()
            .trim()
            .notEmpty(),

        body("quantity")
            .isInt({ min: 1 }),

        body("description")
            .isString()
            .trim()
            .notEmpty(),

        checkValidation
    ],

    async (req, res) => {
        try {
            const {
                productId,
                productName,
                productPrice,
                category,
                quantity,
                description
            } = req.body;

            // Check whether product ID already exists
            const existingProduct = await Product.findOne({
                productId: productId.trim()
            });

            if (existingProduct) {
                return res.status(409).json({
                    message: "Product ID already exists"
                });
            }

            // Create product belonging to logged-in seller
            const newProduct = await Product.create({
                productId: productId.trim(),
                productName: productName.trim(),
                productPrice: Number(productPrice),
                category: category.trim(),
                quantity: Number(quantity),
                description: description.trim(),

                // Seller ID comes from verified JWT
                sellerId: req.user.userId,

                status: "Available"
            });

            return res.status(201).json({
                message: "Product added successfully!",
                product: newProduct
            });

        } catch (error) {
            console.error("Add product error:", error);

            if (error.code === 11000) {
                return res.status(409).json({
                    message: "Product ID already exists"
                });
            }

            return res.status(500).json({
                message: "Error adding product"
            });
        }
    }
);


// ========================================
// GET SELLER'S OWN PRODUCTS
// GET /api/seller/products
// ========================================

app.get("/api/seller/products", verifyToken, async (req, res) => {
    try {
        // Find products belonging only to the logged-in seller
        const products = await Product.find({
            sellerId: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Seller products retrieved successfully",
            totalProducts: products.length,
            products: products
        });

    } catch (error) {
        console.error("Seller products error:", error);

        return res.status(500).json({
            message: "Error retrieving seller products"
        });
    }
});


 // ========================================
 // SELLER DASHBOARD
 // GET /api/seller/dashboard
 // ========================================

app.get("/api/seller/dashboard", verifyToken, async (req, res) => {
    try {
        const sellerId = req.user.userId;

        // Get seller's product statistics
        const totalProducts = await Product.countDocuments({
            sellerId
        });

        const availableProducts = await Product.countDocuments({
            sellerId,
            status: "Available"
        });

        const soldProducts = await Product.countDocuments({
            sellerId,
            status: "Sold"
        });

        // Calculate total revenue from completed orders
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalSales: { $sum: "$quantity" }
                }
            }
        ]);

        const totalRevenue = revenueResult.length > 0
            ? revenueResult[0].totalRevenue
            : 0;

        const totalSales = revenueResult.length > 0
            ? revenueResult[0].totalSales
            : 0;

        // Get latest orders
        const recentOrders = await Order.find({ sellerId })
            .sort({ purchaseDate: -1 })
            .limit(5)
            .select("orderId productName quantity totalPrice purchaseDate");

        return res.status(200).json({
            message: "Seller dashboard retrieved successfully",

            dashboard: {
                totalProducts,
                availableProducts,
                soldProducts,
                totalSales,
                totalRevenue,
                recentOrders
            }
        });

    } catch (error) {
        console.error("Seller dashboard error:", error);

        return res.status(500).json({
            message: "Error loading seller dashboard"
        });
    }
});


 // ========================================
 // CART CHECKOUT
 // POST /api/cart/checkout
 // ========================================

app.post("/api/cart/checkout", verifyToken, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { items } = req.body;

        // Validate cart
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Your cart is empty"
            });
        }

        const seenProducts = new Set();

        for (const item of items) {
            if (
                !mongoose.isValidObjectId(item.productId) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                seenProducts.has(String(item.productId))
            ) {
                return res.status(400).json({
                    message: "Invalid or duplicate cart item"
                });
            }

            seenProducts.add(String(item.productId));
        }

        let checkoutResult;

        // Use a transaction so stock, orders and points
        // are updated together or not at all.
        await session.withTransaction(async () => {
            const buyer = await User.findById(req.user.userId)
                .session(session);

            if (!buyer) {
                throw new Error("BUYER_NOT_FOUND");
            }

            const orderDocuments = [];
            let totalAmount = 0;

            for (const item of items) {
                // Atomically check stock and reduce quantity
                const product = await Product.findOneAndUpdate(
                    {
                        _id: item.productId,
                        status: "Available",
                        quantity: { $gte: item.quantity }
                    },
                    {
                        $inc: { quantity: -item.quantity }
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!product) {
                    throw new Error("PRODUCT_UNAVAILABLE");
                }

                // Mark as sold when stock reaches zero
                if (product.quantity === 0) {
                    await Product.updateOne(
                        { _id: product._id },
                        { $set: { status: "Sold" } },
                        { session }
                    );
                }

                const itemTotal =
                    product.productPrice * item.quantity;

                totalAmount += itemTotal;

                orderDocuments.push({
                    orderId: crypto.randomUUID(),
                    buyerId: buyer._id,
                    sellerId: product.sellerId,
                    productId: product._id,
                    productName: product.productName,
                    quantity: item.quantity,
                    totalPrice: itemTotal,
                    pointsEarned: 0
                });
            }

            // 10 points for every completed Rs. 100 spent
            const pointsEarned =
                Math.floor(totalAmount / 100) * 10;

            // Distribute earned points across order records
            if (orderDocuments.length > 0) {
                orderDocuments[0].pointsEarned = pointsEarned;
            }

            // Create order records
            await Order.create(orderDocuments, { session });

            // Add reward points to buyer
            await User.updateOne(
                { _id: buyer._id },
                { $inc: { points: pointsEarned } },
                { session }
            );

            checkoutResult = {
                totalAmount,
                pointsEarned,
                orders: orderDocuments
            };
        });

        return res.status(200).json({
            message: "Checkout successful!",
            totalAmount: checkoutResult.totalAmount,
            pointsEarned: checkoutResult.pointsEarned,
            orders: checkoutResult.orders
        });

    } catch (error) {
        console.error("Checkout error:", error);

        if (error.message === "BUYER_NOT_FOUND") {
            return res.status(404).json({
                message: "Buyer account not found"
            });
        }

        if (error.message === "PRODUCT_UNAVAILABLE") {
            return res.status(409).json({
                message: "A product is unavailable or has insufficient stock. Please refresh your cart."
            });
        }

        return res.status(500).json({
            message: "Checkout failed"
        });

    } finally {
        await session.endSession();
    }
});


// ========================================
// BUYER ORDER HISTORY
// GET /api/orders/my-orders
// ========================================

app.get("/api/orders/my-orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({
            buyerId: req.user.userId
        }).sort({ purchaseDate: -1 });

        return res.status(200).json({
            message: "Order history retrieved successfully",
            totalOrders: orders.length,
            orders
        });

    } catch (error) {
        console.error("Order history error:", error);

        return res.status(500).json({
            message: "Error retrieving order history"
        });
    }
});


// ========================================
// SELLER SALES HISTORY
// GET /api/seller/orders
// ========================================

app.get("/api/seller/orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({
            sellerId: req.user.userId
        })
        .populate("buyerId", "username emailId")
        .sort({ purchaseDate: -1 });

        const totalRevenue = orders.reduce(
            (sum, order) => sum + order.totalPrice,
            0
        );

        return res.status(200).json({
            message: "Seller sales history retrieved successfully",
            totalOrders: orders.length,
            totalRevenue,
            orders
        });

    } catch (error) {
        console.error("Seller sales history error:", error);

        return res.status(500).json({
            message: "Error retrieving seller sales history"
        });
    }
});


// ========================================
// GET BUYER REWARD POINTS
// GET /api/users/points
// ========================================

app.get("/api/users/points", verifyToken, async (req, res) => {
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
            message: "Error retrieving reward points"
        });
    }
});


// ========================================
// PUT - UPDATE COMPLETE PRODUCT DETAILS
// PUT /api/products/:id
// ========================================

app.put("/api/products/:id", verifyToken, async (req, res) => {
    try {
        const { productName, productPrice, category, quantity, description } = req.body;

        // Check all required fields
        if (
            typeof productName !== "string" || !productName.trim() ||
            typeof category !== "string" || !category.trim() ||
            typeof description !== "string" || !description.trim() ||
            !Number.isFinite(Number(productPrice)) ||
            Number(productPrice) < 0 ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0
        ) {
            return res.status(400).json({
                message: "Please provide valid product details"
            });
        }

        // Find product belonging to the logged-in seller
        const product = await Product.findOne({
            _id: req.params.id,
            sellerId: req.user.userId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not its owner"
            });
        }

        // Update fields
        product.productName = productName.trim();
        product.productPrice = Number(productPrice);
        product.category = category.trim();
        product.quantity = Number(quantity);
        product.description = description.trim();

        // Save invokes the Product pre-save hook
        await product.save();

        return res.status(200).json({
            message: "Product updated successfully!",
            product
        });

    } catch (error) {
        console.error("Update product error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        return res.status(500).json({
            message: "Error updating product"
        });
    }
});


// ========================================
// PATCH - UPDATE SELECTED PRODUCT DETAILS
// PATCH /api/products/:id
// ========================================

app.patch("/api/products/:id", verifyToken, async (req, res) => {
    try {
        const allowedFields = [
            "productName",
            "productPrice",
            "category",
            "quantity",
            "description"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update"
            });
        }

        if (
            updates.productName !== undefined &&
            (typeof updates.productName !== "string" || !updates.productName.trim())
        ) {
            return res.status(400).json({ message: "Invalid product name" });
        }

        if (
            updates.category !== undefined &&
            (typeof updates.category !== "string" || !updates.category.trim())
        ) {
            return res.status(400).json({ message: "Invalid category" });
        }

        if (
            updates.description !== undefined &&
            (typeof updates.description !== "string" || !updates.description.trim())
        ) {
            return res.status(400).json({ message: "Invalid description" });
        }

        if (
            updates.productPrice !== undefined &&
            (!Number.isFinite(Number(updates.productPrice)) ||
                Number(updates.productPrice) < 0)
        ) {
            return res.status(400).json({ message: "Invalid product price" });
        }

        if (
            updates.quantity !== undefined &&
            (!Number.isInteger(Number(updates.quantity)) ||
                Number(updates.quantity) < 0)
        ) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        // Find only the logged-in seller's product
        const product = await Product.findOne({
            _id: req.params.id,
            sellerId: req.user.userId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not its owner"
            });
        }

        // Apply only the supplied updates
        for (const [field, value] of Object.entries(updates)) {
            if (["productName", "category", "description"].includes(field)) {
                product[field] = value.trim();
            } else if (["productPrice", "quantity"].includes(field)) {
                product[field] = Number(value);
            }
        }

        await product.save();

        return res.status(200).json({
            message: "Selected product details updated successfully!",
            product
        });

    } catch (error) {
        console.error("Patch product error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        return res.status(500).json({
            message: "Error updating product"
        });
    }
});


// ========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ========================================

app.delete("/api/products/:id", verifyToken, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            sellerId: req.user.userId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not its owner"
            });
        }

        return res.status(200).json({
            message: "Product deleted successfully!",
            deletedProduct: product.productName
        });

    } catch (error) {
        console.error("Delete product error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        return res.status(500).json({
            message: "Error deleting product"
        });
    }
});


// ========================================
// PUT - UPDATE COMPLETE USER DETAILS
// ========================================

app.put(
    "/api/users",
    verifyToken,
    [
        body("username").isString().trim().notEmpty(),
        body("age").isInt({ min: 1 }),
        body("password").isString().isLength({ min: 8 }),
        checkValidation
    ],
    async (req, res) => {
        try {
            const emailId = req.query.emailId;

            if (
                typeof emailId !== "string" ||
                emailId.toLowerCase() !== req.user.emailId
            ) {
                return res.status(403).json({
                    message: "You can only update your own account"
                });
            }

            const hashedPassword = await bcrypt.hash(
                req.body.password,
                10
            );

            const user = await User.findOneAndUpdate(
                { emailId: req.user.emailId },
                {
                    username: req.body.username.trim(),
                    age: Number(req.body.age),
                    password: hashedPassword
                },
                { new: true, runValidators: true }
            );

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            return res.status(200).json({
                message: "User details updated successfully"
            });

        } catch (error) {
            console.log(error);

            return res.status(500).json({
                message: "Update failed"
            });
        }
    }
);

// ========================================
// PATCH - UPDATE SELECTED USER DETAILS
// ========================================

app.patch(
    "/api/users",
    verifyToken,
    async (req, res) => {
        try {
            const emailId = req.query.emailId;

            if (
                typeof emailId !== "string" ||
                emailId.toLowerCase() !== req.user.emailId
            ) {
                return res.status(403).json({
                    message: "You can only update your own account"
                });
            }

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
                if (
                    !Number.isInteger(Number(req.body.age)) ||
                    Number(req.body.age) < 1
                ) {
                    return res.status(400).json({
                        message: "Invalid age"
                    });
                }

                updates.age = Number(req.body.age);
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

            const user = await User.findOneAndUpdate(
                { emailId: req.user.emailId },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            return res.status(200).json({
                message: "Selected user details updated successfully"
            });

        } catch (error) {
            console.log(error);

            return res.status(500).json({
                message: "Update failed"
            });
        }
    }
);

// ========================================
// DELETE USER
// ========================================

app.delete("/api/users", verifyToken, async (req, res) => {
    try {
        const emailId = req.query.emailId;

        if (
            typeof emailId !== "string" ||
            emailId.toLowerCase() !== req.user.emailId
        ) {
            return res.status(403).json({
                message: "You can only delete your own account"
            });
        }

        const user = await User.findOneAndDelete({
            emailId: req.user.emailId
        });

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

// ========================================
// CONNECT TO MONGODB
// ========================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection error:",
            error.message
        );
    });
