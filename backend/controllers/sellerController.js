
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Order = require("../models/Order");

// ========================================
// SELLER DASHBOARD
// ========================================

const getDashboard = async (req, res) => {
    try {
        const sellerId = req.user.userId;

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

        const outOfStockProducts = await Product.countDocuments({
            sellerId,
            quantity: 0
        });

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

        const recentOrders = await Order.find({ sellerId })
            .sort({ purchaseDate: -1 })
            .limit(5)
            .select("orderId productName quantity totalPrice purchaseDate");

        const totalSales = revenueResult[0]?.totalSales || 0;
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        return res.status(200).json({
            message: "Seller dashboard retrieved successfully",
            dashboard: {
                totalProducts,
                availableProducts,
                soldProducts,
                totalProductsSold: totalSales,
                outOfStockProducts,
                totalSales,
                totalRevenue,
                recentOrders
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            message: "Unable to load seller dashboard"
        });
    }
};


// ========================================
// SELLER SALES HISTORY
// ========================================

const getSellerOrders = async (req, res) => {
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
        console.error("Seller orders error:", error);

        return res.status(500).json({
            message: "Unable to retrieve seller sales history"
        });
    }
};

module.exports = {
    getDashboard,
    getSellerOrders
};
