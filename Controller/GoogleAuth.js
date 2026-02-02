const database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");

// Google OAuth2 Client setup
const client = new OAuth2Client("786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com");

    const GoogleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        console.log("Google auth called");

        // 1️⃣ Verify token
        const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        // ❌ REMOVED: payload.sub usage
        // ❌ REMOVED: password hashing

        // 2️⃣ Check if user exists
        const existing = await database_conn.query(
        "SELECT user_id, email FROM accts WHERE email = $1",
        [email]
        );

        // 3️⃣ If exists → login
        if (existing.rows.length > 0) {
        return res.status(200).json(existing.rows[0]);
        }

        // 4️⃣ If not exists → let DB generate user_id
        const result = await database_conn.query(
        `
        INSERT INTO accts (email)
        VALUES ($1)
        RETURNING user_id, email
        `,
        [email]
        );

        // 5️⃣ ALWAYS return user_id
        return res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Google authentication failed" });
    }
};

module.exports = GoogleAuth;
