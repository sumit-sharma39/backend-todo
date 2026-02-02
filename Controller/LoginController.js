const database_conn = require("../Database/Database");
const bcrypt = require("bcrypt");

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({ error: "missing" });
        }

        const result = await database_conn.query(
        "select user_id, password from accts where lower(email)=lower($1)",
        [email]
        );

        if (result.rowCount === 0) {
        return res.status(401).json({ error: "invalid" });
        }

        const isMatch = await bcrypt.compare(
        password,
        result.rows[0].password
        );

        if (!isMatch) {
        return res.status(401).json({ error: "invalid" });
        }

        return res.status(200).json({
        user_id: result.rows[0].user_id
        });

    } catch {
        return res.status(500).json({ error: "server" });
    }
};

module.exports = Login;
