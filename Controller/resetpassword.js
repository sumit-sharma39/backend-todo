const database_conn = require("../Database/Database");
const logger = require("../utils/logger");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
        return res.status(400).json({ error: "Token and password required" });
        }

        // Hash incoming token (must match hashed value stored in DB)
        const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

        // Find user by token ONLY (expiry checked separately for clarity)
        const result = await database_conn.query(
        `SELECT user_id, reset_password_expires
        FROM users
        WHERE reset_password_token = $1`,
        [hashedToken]
        );

        if (result.rowCount === 0) {
        return res.status(400).json({ error: "Invalid token" });
        }

        const user = result.rows[0];
        console.log("DB expiry ISO:", new Date(user.reset_password_expires).toISOString());
console.log("Server now ISO:", new Date().toISOString());
        // Check expiry explicitly in JS
        if (!user.reset_password_expires || new Date(user.reset_password_expires) < new Date()) {
        return res.status(400).json({ error: "Token expired" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password and clear reset fields
        await database_conn.query(
        `UPDATE users
        SET password = $1,
            reset_password_token = NULL,
            reset_password_expires = NULL
        WHERE user_id = $2`,
        [hashedPassword, user.user_id]
        );

        logger.info({ message: "password reset successful" });

        return res.json({ message: "Password successfully reset" });

    } catch (error) {
        logger.error({ message: "password reset failed" });
        console.error("Reset Password Error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = ResetPassword;