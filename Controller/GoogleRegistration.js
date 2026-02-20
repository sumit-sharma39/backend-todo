const database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(
    "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com"
    );

    const RegGoogleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
        idToken: token,
        audience:
            "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        // Check if user exists
        let result = await database_conn.query(
        "SELECT user_id FROM accts WHERE email=$1",
        [email]
        );

        let user;

        if (result.rowCount === 0) {
        // Create new user
        const insert = await database_conn.query(
            "INSERT INTO accts(email) VALUES($1) RETURNING user_id",
            [email]
        );
        user = insert.rows[0];
        } else {
        user = result.rows[0];
        }

        // Generate JWT
        const jwtToken = jwt.sign(
        { user_id: user.user_id, 
            email: user.email
         },
        "NIGGA88",
        { expiresIn: "1d" }
        );

        // Set cookie
        res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
        message: "Google login successful",
        });

    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Google authentication failed" });
    }
};

module.exports = RegGoogleAuth;
