const database_conn = require("../Database/Database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
        return res.status(409).json({ message: "User already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const result = await database_conn.query(`INSERT INTO accts (email, password)
            VALUES ($1, $2)
            RETURNING user_id, email `,
            [email, hashedPassword]
        );
        
        console.log("email stored.")
        const newUser = result.rows[0];
        
        const token = jwt.sign(
        { user_id: newUser.user_id, 
            email: newUser.email
         },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
        );

        res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
        });

        console.log("token is: " , token);
        console.log("User registered with ID:", newUser.user_id);
        return res.status(201).json({ message: "Registered successfully" });


        // return res.status(201).json({ user_id: result.rows[0].user_id });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = Register;
