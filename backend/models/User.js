
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },

        emailId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        age: {
            type: Number,
            required: true,
            min: 1
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["customer", "seller"],
            default: "customer",
            required: true
        },

        points: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;
