const database_conn = require("../Database/Database");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15; // minutes

const Login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        });
        }

        const result = await database_conn.query(
        `SELECT user_id, email, password,
                failed_login_attempts,
                account_locked_until
        FROM users
        WHERE lower(email) = lower($1)`,
        [email]
        );

        if (result.rowCount === 0) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
        }

        const user = result.rows[0];

        // CHECK IF ACCOUNT LOCKED
        if (
        user.account_locked_until &&
        new Date(user.account_locked_until) > new Date()
        ) {

        const remainingTime = Math.ceil(
            (new Date(user.account_locked_until) - new Date()) / 60000
        );

        return res.status(403).json({
            error: `Account locked. Try again in ${remainingTime} minute(s).`
        });
        }

        // CHECK PASSWORD
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

        const attempts = (user.failed_login_attempts || 0) + 1;

        if (attempts >= MAX_ATTEMPTS) {

            await database_conn.query(
            `UPDATE users
            SET failed_login_attempts = 0,
                account_locked_until = NOW() + INTERVAL '${LOCK_TIME} minutes'
            WHERE user_id = $1`,
            [user.user_id]
            );

            return res.status(403).json({
            error: `Too many failed attempts. Account locked for ${LOCK_TIME} minutes.`
            });
        }

        await database_conn.query(
            `UPDATE users
            SET failed_login_attempts = $1
            WHERE user_id = $2`,
            [attempts, user.user_id]
        );

        return res.status(401).json({
            error: `Invalid email or password. Attempt ${attempts}/${MAX_ATTEMPTS}`
        });
        }

        // SUCCESS LOGIN → RESET ATTEMPTS
        await database_conn.query(
        `UPDATE users
        SET failed_login_attempts = 0,
            account_locked_until = NULL
        WHERE user_id = $1`,
        [user.user_id]
        );

        const token = jwt.sign(
        { user_id: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
        );

        res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
        });

        logger.info({
        message: "User login successful",
        user_id: user.user_id
        });

        return res.status(200).json({
        message: "Login successful",
        user_id: user.user_id
        });

    } catch (err) {

        logger.error({
        message: "Login error",
        error: err.message
        });

        return res.status(500).json({
        error: "Internal server error"
        });
    }
};

module.exports = Login;