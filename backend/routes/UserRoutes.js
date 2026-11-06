
const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getRewardPoints
} = require("../controllers/userController");

const verifyToken = require("../middleware/authMiddleware");

router.post("/users", registerUser);
router.post("/login", loginUser);

router.put("/users", verifyToken, updateUser);
router.patch("/users", verifyToken, updateUser);
router.delete("/users", verifyToken, deleteUser);

router.get("/users/points", verifyToken, getRewardPoints);

module.exports = router;
