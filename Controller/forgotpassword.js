const database_conn = require("../Database/Database");
const crypto = require("crypto");
const transporter = require("../utils/mailer");
const logger = require("../utils/logger");

const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    logger.warn({
      action: "FORGOT_PASSWORD_FAILED",
      message: "Email not provided in request"
    });

    return res.status(400).json({ error: "Email required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {

    const result = await database_conn.query(
      `SELECT user_id, email 
       FROM users 
       WHERE lower(email) = $1`,
      [normalizedEmail]
    );

    // Prevent account enumeration
    if (result.rowCount === 0) {

      logger.warn({
        action: "FORGOT_PASSWORD_ATTEMPT",
        message: "Password reset requested for non-existing account",
        email: normalizedEmail
      });

      return res.json({
        message: "If account exists, reset link has been sent."
      });
    }

    const user = result.rows[0];

    // Generate secure reset token
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await database_conn.query(
      `UPDATE users
       SET reset_password_token = $1,
           reset_password_expires = $2
       WHERE user_id = $3`,
      [hashedToken, expires, user.user_id]
    );

    logger.info({
      action: "FORGOT_PASSWORD_REQUEST",
      message: "Password reset token generated",
      user_id: user.user_id,
      email: normalizedEmail,
      expires_at: expires
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    try {

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Password Reset Request",
        html: `
          <h3>Password Reset</h3>
          <p>You requested to reset your password.</p>
          <p>Click the link below to reset it:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link expires in 15 minutes.</p>
        `
      });

      logger.info({
        action: "RESET_EMAIL_SENT",
        message: "Password reset email sent",
        user_id: user.user_id,
        email: normalizedEmail
      });

    } catch (mailError) {

      logger.error({
        action: "RESET_EMAIL_FAILED",
        message: "Failed to send password reset email",
        user_id: user.user_id,
        email: normalizedEmail,
        error: mailError.message
      });

      return res.status(500).json({
        error: "Unable to send reset email"
      });
    }

    return res.json({
      message: "If account exists, reset link has been sent."
    });

  } catch (error) {

    logger.error({
      action: "FORGOT_PASSWORD_ERROR",
      message: "Unexpected error in forgot password",
      email: normalizedEmail,
      error: error.message
    });

    return res.status(500).json({
      error: "Server error"
    });
  }
};

module.exports = ForgotPassword;