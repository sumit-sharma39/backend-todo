const database_conn = require("../Database/Database");
const bcrypt = require("bcrypt");

const Register = async (req, res) => {
    try {
        console.log("Entered Register API");
        console.log("req.body:", req.body);

        const { email, password } = req.body;

        const check = await database_conn.query(
        "SELECT 1 FROM accts WHERE email = $1",
        [email]
        );

        if (check.rowCount > 0) {
        return res.status(409).json({ error: "User already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        const result = await database_conn.query(
        `
        INSERT INTO accts (email, password)
        VALUES ($1, $2)
        RETURNING user_id, email
        `,
        [email, hashedPassword]
        );

        return res.status(201).json({ user_id: result.rows[0].user_id });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = Register;
