const database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");

const client = new OAuth2Client("786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com");

const RegGoogleAuth=  async (req, res) => {
    const { token } = req.body;

    const checked = await client.verifyIdToken({
        idToken: token,
        check: "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com",
    });

    const payload = checked.getPayload();
    const email = payload.email;
    const userid = payload.user_id;
    const password = "google_user";
    const saltRounds = 10;
    const hashedpassword = await bcrypt.hash(password, saltRounds); // hashing of password

    const result = await database_conn.query(
        "INSERT INTO users(user_id , email, password_hash) VALUES($1, $2 , $3)",
        [ userid, email, hashedpassword]
        );
    
    if(result.rowCount>0){
        res.status(200).send("data stored successfully");
    }

}

module.exports = RegGoogleAuth;