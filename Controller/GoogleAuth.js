const database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");

// Google OAuth2 Client setup
const client = new OAuth2Client("786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com");

const GoogleAuth=  async (req, res) => {
    const { token } = req.body;
    console.log("register from google is called");
  // check and verify the token
    const checked = await client.verifyIdToken({
        idToken: token,
        check: "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com",
    });

    const payload = checked.getPayload();
    const user_id = payload.sub; 
    const email = payload.email;
    const password = "google_user";
    const saltRounds = 10;
    const hashedpassword = await bcrypt.hash(password, saltRounds); // hashing of password
    console.log("user_id is " , user_id);
    // insert into database 
    const result = await database_conn.query(
        "INSERT INTO accounts(user_id, email, password) VALUES($1, $2 , $3)",
        [ user_id,email, hashedpassword]
        );
    
    if(result.rowCount>0){
        res.status(200).send("data stored successfully");
    }

}

module.exports = GoogleAuth;