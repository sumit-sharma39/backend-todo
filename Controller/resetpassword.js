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

        // Hash the token to match DB
        const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

        // Find user with valid token and not expired
        const result = await database_conn.query(
        `SELECT user_id 
        FROM users
        WHERE reset_password_token = $1
        AND reset_password_expires > NOW()`,
        [hashedToken]
        );

        if (result.rowCount === 0) {
        return res.status(400).json({ error: "Invalid or expired token" });
        }

        logger.info({
            message: "password reset attempt",
            user_id,
            title
            });
        const user = result.rows[0];

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
        logger.info({
            message: "password reset successful",
            user_id,
            title
            });

        return res.json({ message: "Password successfully reset" });

    } catch (error) {
        logger.error({
            message: "password reset failed",
            user_id,
            title
            });
        console.error("Reset Password Error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = ResetPassword;