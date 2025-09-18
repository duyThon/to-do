import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../modules/Users.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "2h";

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const existsUser = await User.findOne({ username: username });
    if(existsUser) {
        return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: "User created successfully" });
})

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username: username });
    if(!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    } else if (!await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
    res.json({ token, user: { id: user._id, username: user.username} });
})

export default router;