
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },

    productName: {
        type: String,
        required: true
    },

    productPrice: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    }
});

const Product = mongoose.model("Product", productSchema, "Products");

module.exports = Product;
