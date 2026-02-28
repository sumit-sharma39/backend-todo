const database_conn = require("../Database/Database");
const crypto = require("crypto");
const transporter = require("../utils/mailer");
const logger = require("../utils/logger");

const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // Check if user exists
    const result = await database_conn.query(
      "SELECT user_id FROM users WHERE lower(email) = lower($1)",
      [email]
    );

    // Prevent account enumeration
    if (result.rowCount === 0) {
      return res.json({
        message: "If account exists, reset link has been sent.",
      });
    }

    const user = result.rows[0];

    // Generate raw reset token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // ✅ Generate expiry in Node (UTC safe)
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Store token + expiry
    const updateResult = await database_conn.query(
      `UPDATE users
       SET reset_password_token = $1,
           reset_password_expires = $2
       WHERE user_id = $3
       RETURNING reset_password_expires`,
      [hashedToken, expires, user.user_id]
    );

    console.log("New expiry from Node:", expires.toISOString());

    logger.info({
      message: "Password reset requested",
      user_id: user.user_id,
      email: email,
    });

    const resetLink = `http://localhost:5173/reset-password/${rawToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    return res.json({
      message: "If account exists, reset link has been sent.",
    });

  } catch (error) {
    logger.error({
      message: "Password reset failed",
      email: email,
      error: error.message,
    });

    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = ForgotPassword;