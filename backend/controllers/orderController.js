
const mongoose = require("mongoose");
const crypto = require("crypto");

const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

// Checkout
const checkout = async (req, res) => {
    let session;

    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Your cart is empty"
            });
        }

        const seenProducts = new Set();

        for (const item of items) {
            if (
                !item.productId ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid product ID or quantity"
                });
            }

            if (seenProducts.has(String(item.productId))) {
                return res.status(400).json({
                    message: "Duplicate products in cart are not allowed"
                });
            }

            seenProducts.add(String(item.productId));
            item.quantity = Number(item.quantity);
        }

        session = await mongoose.startSession();

        let result;

        await session.withTransaction(async () => {
            const buyer = await User.findById(req.user.userId).session(session);

            if (!buyer) {
                throw new Error("BUYER_NOT_FOUND");
            }

            const orderDocuments = [];
            let totalAmount = 0;

            for (const item of items) {
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
                        session,
                        runValidators: true
                    }
                );

                if (!product) {
                    throw new Error("PRODUCT_UNAVAILABLE");
                }

                if (product.quantity === 0) {
                    await Product.updateOne(
                        { _id: product._id },
                        { $set: { status: "Sold" } },
                        { session }
                    );
                }

                const itemTotal = product.productPrice * item.quantity;
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

            const pointsEarned = Math.floor(totalAmount / 100) * 10;

            if (orderDocuments.length > 0) {
                orderDocuments[0].pointsEarned = pointsEarned;
            }

            const createdOrders = await Order.create(orderDocuments, { session });

            await User.updateOne(
                { _id: buyer._id },
                { $inc: { points: pointsEarned } },
                { session }
            );

            result = {
                totalAmount,
                pointsEarned,
                orders: createdOrders
            };
        });

        res.status(201).json({
            message: "Checkout successful",
            ...result
        });

    } catch (error) {
        console.error("Checkout error:", error);

        if (error.message === "BUYER_NOT_FOUND") {
            return res.status(404).json({
                message: "Buyer account not found"
            });
        }

        if (error.message === "PRODUCT_UNAVAILABLE") {
            return res.status(400).json({
                message: "One or more products are no longer available or do not have enough stock. Please update your cart and try again."
            });
        }

        res.status(500).json({
            message: "Checkout failed",
            error: error.message
        });

    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

// Buyer's order history
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            buyerId: req.user.userId
        }).sort({ purchaseDate: -1 });

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch order history"
        });
    }
};

module.exports = {
    checkout,
    getMyOrders
};
