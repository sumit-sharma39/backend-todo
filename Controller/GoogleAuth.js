const database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const client = new OAuth2Client(
    "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com"
    );

    const RegGoogleAuth = async (req, res) => {
    try {
        if (!req.body || !req.body.token) {
        return res.status(400).json({ error: "Google token missing" });
        }

        if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET not defined");
        return res.status(500).json({ error: "Server configuration error" });
        }
        
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
        idToken: token,
        audience:
            "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
        return res.status(400).json({ error: "Invalid Google payload" });
        }

        const email = payload.email;

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
        }
        else {
        user = queryResult.rows[0];
        }

        if (!user || !user.user_id) {
        return res.status(500).json({ error: "User creation failed" });
        }

        console.log("Google user:", user);
        console.log(payload);


        const Token = jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
        );


        res.cookie("token", Token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        });

        logger.info({
            message: "registration successful",
            });

        console.log("toen generated:", Token);
        return res.status(200).json({
        message: "Google login successful",
        });

    } catch (err) {

        logger.info({
            message: "registration failed",
            });
        console.error("Google Auth Error:", err.message);
        return res.status(401).json({
        error: "Google authentication failed",
        });
    }
};

module.exports = RegGoogleAuth;
