
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getDashboard,
    getSellerOrders
} = require("../controllers/sellerController");

// Seller dashboard
router.get("/dashboard", verifyToken, getDashboard);

// Seller sales history
router.get("/orders", verifyToken, getSellerOrders);

// Seller's own products (preserves original endpoint)
const { getMyProducts } = require("../controllers/productController");
router.get("/products", verifyToken, getMyProducts);

module.exports = router;
