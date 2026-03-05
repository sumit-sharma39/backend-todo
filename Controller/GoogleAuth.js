const database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const RegGoogleAuth = async (req, res) => {
    try {

        if (!req.body || !req.body.token) {
            return res.status(400).json({
                error: "Google token missing"
            });
        }

        if (!process.env.JWT_SECRET) {
            logger.error({
                message: "JWT_SECRET not defined in environment"
            });

            return res.status(500).json({
                error: "Server configuration error"
            });
        }

        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({
                error: "Invalid Google payload"
            });
        }

        if (!payload.email_verified) {
            return res.status(401).json({
                error: "Google email not verified"
            });
        }

        const email = payload.email.trim().toLowerCase();

        logger.info({
            message: "Google token verified",
            email: email
        });

        let queryResult = await database_conn.query(
            "SELECT user_id, email FROM users WHERE email=$1",
            [email]
        );

        let user;

        if (queryResult.rowCount === 0) {

            const insertResult = await database_conn.query(
                "INSERT INTO users(email) VALUES($1) RETURNING user_id, email",
                [email]
            );

            user = insertResult.rows[0];

            logger.info({
                message: "New Google user registered",
                user_id: user.user_id,
                email: user.email
            });

        } else {

            user = queryResult.rows[0];

            logger.info({
                message: "Existing Google user login",
                user_id: user.user_id,
                email: user.email
            });
        }

        if (!user || !user.user_id) {
            return res.status(500).json({
                error: "User creation failed"
            });
        }

        const jwtToken = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        });

        logger.info({
            message: "Google authentication successful",
            user_id: user.user_id,
            email: user.email
        });

        return res.status(200).json({
            message: "Google login successful",
            user_id: user.user_id
        });

    } catch (err) {

        logger.error({
            message: "Google authentication failed",
            error: err.message,
            stack: err.stack
        });

        return res.status(401).json({
            error: "Google authentication failed"
        });
    }
};

module.exports = RegGoogleAuth;