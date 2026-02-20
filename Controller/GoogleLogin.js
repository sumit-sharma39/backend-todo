const Database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(
    "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com"
    );

    const LogGoogleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
        idToken: token,
        audience:
            "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        const result = await Database_conn.query(
        "SELECT user_id FROM accts WHERE email=$1",
        [email]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({ msg: "User not registered" });
        }

        const user = result.rows[0];

        const jwtToken = jwt.sign(
        { user_id: user.user_id,
          email: result.rows[0].email
         },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
        );

        res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: true, // true in production
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        });
        console.log("jwttoekn", jwtToken);

        return res.status(200).json({
        msg: "Google login successful",
        });

    } catch (err) {
        console.log("errors: ", err);
        return res.status(401).json({ msg: "Google authentication failed" });
    }
    };

module.exports = LogGoogleAuth;
