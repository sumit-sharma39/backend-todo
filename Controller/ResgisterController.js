const database_conn = require("../Database/Database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const Register = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        });
        }

        const validatePassword = (password) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{8,25}$/;
        return regex.test(password);
        };

        if (!validatePassword(password)) {
        return res.status(400).json({
            error:
            "Password must be 8–25 characters and include uppercase, lowercase, number and special character"
        });
        }

        // CHECK IF USER EXISTS
        const check = await database_conn.query(
        "SELECT user_id FROM users WHERE lower(email) = lower($1)",
        [email]
        );

        if (check.rowCount > 0) {

        logger.warn("Registration attempt with existing email", {
            email: email,
            ip: req.ip
        });

        return res.status(409).json({
            error: "User already exists. Please login."
        });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await database_conn.query(
        `INSERT INTO users (email, password)
        VALUES ($1, $2)
        RETURNING user_id, email`,
        [email, hashedPassword]
        );

        const newUser = result.rows[0];

        const token = jwt.sign(
        {
            user_id: newUser.user_id,
            email: newUser.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
        );

        res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
        });

        logger.info("User registration successful", {
        user_id: newUser.user_id,
        email: newUser.email,
        ip: req.ip
        });

        return res.status(201).json({
        message: "Registration successful",
        user_id: newUser.user_id
        });

    } catch (err) {

        logger.error("Registration controller error", {
        error: err.message,
        stack: err.stack,
        email: req.body?.email,
        ip: req.ip
        });

        return res.status(500).json({
        error: "Internal server error"
        });
    }
};

module.exports = Register;