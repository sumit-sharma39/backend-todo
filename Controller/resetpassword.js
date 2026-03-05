const database_conn = require("../Database/Database");
const logger = require("../utils/logger");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
        logger.warn({
            action: "RESET_PASSWORD_FAILED",
            message: "Token or password missing in request"
        });

        return res.status(400).json({ error: "Token and password required" });
        }

        // Hash incoming token (must match hashed value stored in DB)
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user by token
        const result = await database_conn.query(
        `SELECT user_id, reset_password_expires, email
        FROM users
        WHERE reset_password_token = $1`,
        [hashedToken]
        );

        if (result.rowCount === 0) {
        logger.warn({
            action: "RESET_PASSWORD_FAILED",
            message: "Invalid password reset token attempted",
            token_hash: hashedToken
        });

        return res.status(400).json({ error: "Invalid token" });
        }

        const user = result.rows[0];

        // Check expiry
        const now = new Date();
        const expiry = new Date(user.reset_password_expires);

        if (!user.reset_password_expires || expiry < now) {
        logger.warn({
            action: "RESET_PASSWORD_FAILED",
            message: "Expired password reset token",
            user_id: user.user_id,
            email: user.email
        });

        return res.status(400).json({ error: "Token expired" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password and clear reset token/expiry
        await database_conn.query(
        `UPDATE users
        SET password = $1,
            reset_password_token = NULL,
            reset_password_expires = NULL
        WHERE user_id = $2`,
        [hashedPassword, user.user_id]
        );

        logger.info({
        action: "RESET_PASSWORD_SUCCESS",
        message: "Password reset successfully",
        user_id: user.user_id,
        email: user.email
        });

        return res.json({ message: "Password successfully reset" });

    } catch (error) {
        logger.error({
        action: "RESET_PASSWORD_ERROR",
        message: "Unexpected error during password reset",
        error: error.message
        });

        console.error("Reset Password Error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = ResetPassword;