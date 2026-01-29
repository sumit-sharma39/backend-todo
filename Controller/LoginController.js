const database_conn = require("../Database/Database");
const bcrypt = require("bcrypt");

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({ error: "Missing credentials" });
        }

        const result = await database_conn.query(
        "SELECT  password FROM users WHERE LOWER(email) = LOWER($1)",
        [email]
        );

        if (result.rowCount === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const user = result.rows[0];
        if (!user.password) {
        console.error("Password missing in DB for user:", email);
        return res.status(500).json({ error: "Server configuration error" });
        }

        // Compare password 
        const isMatch = await bcrypt.compare(password, user.password);
        // console.log("PASSWORD MATCH:", isMatch);

        if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
        }

        return res.status(200).json({ message: "Login successful" });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = Login;
