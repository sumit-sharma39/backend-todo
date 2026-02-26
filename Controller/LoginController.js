const database_conn = require("../Database/Database");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({ error: "Missing credentials" });
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
        return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];

        //  Account lock check
        if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
        return res.status(403).json({
            error: "Account locked. Try again later."
        });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
        const attempts = (user.failed_login_attempts || 0) + 1;

        if (attempts >= 5) {
            await database_conn.query(
            `UPDATE users
            SET failed_login_attempts = $1,
                account_locked_until = NOW() + INTERVAL '15 minutes'
            WHERE user_id = $2`,
            [attempts, user.user_id]
            );
        } else {
            await database_conn.query(
            `UPDATE users
            SET failed_login_attempts = $1
            WHERE user_id = $2`,
            [attempts, user.user_id]
            );
        }

        return res.status(401).json({ error: "Invalid credentials" });
        }

        // Reset failed attempts after successful login
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
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
        });

        // logging successful login
        logger.info({
            message: "login successful"
            });

        return res.status(200).json({
        user_id: user.user_id
        });

    } catch (error) {
        // logging failed login attempt
        logger.error({
            message: "Login failed",
        });
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = Login;