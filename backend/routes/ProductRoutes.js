
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const validateProduct = require("../validators/productValidator");

const {
    addProduct,
    getAllProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// View all available products (public)
router.get("/", getAllProducts);

// Add a product (support both endpoints)
router.post("/", verifyToken, validateProduct, addProduct);
router.post("/add", verifyToken, validateProduct, addProduct);

// View products belonging to logged-in seller
router.get("/my-products", verifyToken, getMyProducts);

// View a product including its current available quantity
router.get("/:id", getProductById);

// Update a product
router.put("/:id", verifyToken, updateProduct);
router.patch("/:id", verifyToken, updateProduct);

// Delete a product
router.delete("/:id", verifyToken, deleteProduct);

module.exports = router;
