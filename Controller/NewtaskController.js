const Database_conn = require("../Database/Database");

const New_task =  async (req, res) => {
        const {title , description, Points, date ,completed , user_id} = req.body;
        console.log("req.body=" , req.body)

        
        try{
        const query = `
        INSERT into task (title, description, bullets, deadline, completed , user_id)
        values ($1, $2, $3, $4, $5 , $6)
        returning *;
        `;

        const values = [
        title,
        description || "",
        Points,
        date || null,
        completed ?? False,
        user_id
        ];

        const result = await Database_conn.query(query  , values);
        res.status(200).json(result.rows[0]);

}
catch (err)
    {
        console.log(err)
        res.status(500).json({error:"backend issue".err})
    }


};

module.exports= New_task;