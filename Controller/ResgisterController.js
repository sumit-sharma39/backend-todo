const database_conn = require("../Database/Database");
const bcrypt = require("bcrypt");

const Register = async (req, res) => {

    console.log("Entered the register APi: ")
    try {
        console.log("req.body: " , req.body);
        const { user_id, email, password } = req.body;

        console.log("Register request received with email:", email);
        console.log("user_id is: " , user_id);

        // Check if user already exists
        const check = await database_conn.query(
        "SELECT 1 FROM accounts WHERE email = $1",
        [email]
        );

        if (check.rowCount > 0) {
        return res.status(409).json({ error: "User already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        await database_conn.query(
        "INSERT INTO accounts (user_id ,email, password) VALUES ($1, $2, $3)",
        [user_id , email, hashedPassword]
        );
        console.log("User registered  email");

        res.status(201).json({ msg: "User registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = Register;
