const Database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
    );

    const LogGoogleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
        logger.warn({
            message: "Google login attempted without token",
            ip: req.ip,
        });

        return res.status(400).json({ msg: "Token missing" });
        }

        const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email?.trim();

        const result = await Database_conn.query(
        "SELECT user_id, email FROM users WHERE email=$1",
        [email]
        );

        if (result.rows.length === 0) {
        logger.warn({
            message: "Google login attempted with unregistered email",
            email,
            ip: req.ip,
        });

        return res.status(404).json({ msg: "User not registered" });
        }

        const user = result.rows[0];

        const jwtToken = jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
        );

        res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        });

        logger.info({
        message: "Google login successful",
        user_id: user.user_id,
        email: user.email,
        ip: req.ip,
        });

        return res.status(200).json({
        msg: "Google login successful",
        });

    } catch (err) {

        logger.error({
        message: "Google authentication failed",
        error: err.message,
        stack: err.stack,
        ip: req.ip,
        });

        return res.status(401).json({ msg: "Google authentication failed" });
    }
};

module.exports = LogGoogleAuth;