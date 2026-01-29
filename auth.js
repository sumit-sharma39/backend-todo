const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    users.push({ id: users.length + 1, email, password: hashed });

    res.json({ message: "Registered" });
    });

    // LOGIN
    router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    // 🍪 COOKIE
    res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // true in prod (HTTPS)
        maxAge: 60 * 60 * 1000
    });

    res.json({ message: "Logged in" });
    });

    // LOGOUT
    router.post("/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out" });
    });

module.exports = router;