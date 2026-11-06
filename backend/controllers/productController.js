
const crypto = require("crypto");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Add a new product
const addProduct = async (req, res) => {
    try {
        const {
            productName,
            description,
            category,
            brand,
            size,
            condition,
            productPrice,
            quantity,
            image
        } = req.body;

        const product = await Product.create({
            productId: crypto.randomUUID(),
            sellerId: req.user.userId,
            productName,
            description,
            category,
            brand,
            size,
            condition,
            productPrice,
            quantity,
            image,
            status: quantity === 0 ? "Sold" : "Available"
        });

        res.status(201).json({
            message: "Product added successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add product",
            error: error.message
        });
    }
};

// Get all available products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({
            status: "Available",
            quantity: { $gt: 0 }
        }).select("-sellerId");

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

// Get a single product by its MongoDB ID or public product ID
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({
            $or: [
                ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
                { productId: id }
            ]
        }).select("-sellerId");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch product"
        });
    }
};

// Get products belonging to logged-in seller
const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({
            sellerId: req.user.userId
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your products" });
    }
};

// Update a seller's product
const updateProduct = async (req, res) => {
    try {
        const allowedFields = [
            "productName",
            "description",
            "category",
            "brand",
            "size",
            "condition",
            "productPrice",
            "quantity",
            "image"
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

        if (updates.quantity !== undefined) {
            const quantity = Number(updates.quantity);

            if (!Number.isInteger(quantity) || quantity < 0) {
                return res.status(400).json({
                    message: "Quantity must be a non-negative integer"
                });
            }

            updates.quantity = quantity;
            updates.status = quantity === 0 ? "Sold" : "Available";
        }

        const product = await Product.findOneAndUpdate(
            {
                _id: req.params.id,
                sellerId: req.user.userId
            },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not its seller"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
};

// Delete a seller's product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            sellerId: req.user.userId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not its seller"
            });
        }

        const hasOrders = await Order.exists({
            productId: product._id
        });

        if (hasOrders) {
            return res.status(400).json({
                message: "Products with existing orders cannot be deleted"
            });
        }

        await product.deleteOne();

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};

module.exports = {
    addProduct,
    getAllProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct
};
