const Database_conn = require("../Database/Database");
const logger = require("../utils/logger");
const New_task =  async (req, res) => {
        const {title , description, Points, date ,completed} = req.body;
        console.log("req.body=" , req.body)
        const user_id = req.user.user_id;
        
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

        logger.info({
            message: "task created",
            user_id,
            title
            });
        res.status(200).json(result.rows[0]);

}
catch (err)
    {
        logger.error({
            message: "task creation failed",
            user_id,
            title
            });
        console.log(err)
        res.status(500).json({error:"backend issue".err})
    }


};

module.exports= New_task;