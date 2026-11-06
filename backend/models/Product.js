
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // Authenticated seller who uploaded the product
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        productName: {
            type: String,
            required: true,
            trim: true
        },

        productPrice: {
            type: Number,
            required: true,
            min: 0.01
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            validate: Number.isInteger
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        // Teammate's product form fields
        brand: {
            type: String,
            default: "Unbranded",
            trim: true
        },

        size: {
            type: String,
            required: true,
            trim: true
        },

        condition: {
            type: String,
            required: true,
            enum: ["New", "Like New", "Good", "Fair"]
        },

        image: {
            type: String,
            required: true,
            trim: true
        },

        // Your stock availability functionality
        status: {
            type: String,
            enum: ["Available", "Sold"],
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

// Automatically update availability when saving a product
productSchema.pre("save", function () {
    this.status = this.quantity === 0 ? "Sold" : "Available";
});

const Product = mongoose.model("Product", productSchema, "Products");

module.exports = Product;
