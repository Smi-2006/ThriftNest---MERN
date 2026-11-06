
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    checkout,
    getMyOrders
} = require("../controllers/orderController");

router.post("/checkout", verifyToken, checkout);

router.get("/my-orders", verifyToken, getMyOrders);

module.exports = router;
