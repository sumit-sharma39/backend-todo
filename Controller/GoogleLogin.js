const Database_conn = require("../Database/Database");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client("786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com");

const LogGoogleAuth=  async (req, res) => {
    try{
    const { token } = req.body;
    const checked = await client.verifyIdToken({
        idToken: token,
        check: "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com",
    });

    const payload = checked.getPayload();
    const email= payload.email;

    const result = await Database_conn.query(   
        `SELECT * FROM accts WHERE email=$1 `, [email]);

    if (result.rows.length === 0) {
        return res.status(404).json({ msg: "User not registered" });
    }
    return res.status(200).json({
        msg:"the login is successful",
        user: result.rows[0],
        });

}catch(err){
        console.log("errors: ", err);
        return res.status(500).json({msg:"backend error check backend"});
}

        
    }
module.exports= LogGoogleAuth;