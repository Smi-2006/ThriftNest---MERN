
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    emailId: {
        type: String,
        required: true,
        unique: true
    },

    age: {
        type: Number,
        required: true
    },

    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;
