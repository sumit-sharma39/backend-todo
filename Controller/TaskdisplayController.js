const Database_conn = require("../Database/Database");

const Task_Display = async (req, res) => {
    const id = Number(req.params.id);
    try{
        if (!id) {
        return res.status(400).json({ error: "Invalid Task id" });
    }
    const result = await Database_conn.query(
        `select id, title, description, bullets, deadline, completed, image_url from task
        where id in ($1)`,[id]
    );

    // console.log(result.rows)
    res.status(200).json({data: result.rows});
}catch (err) {
    console.error("error=  ", err);
    res.status(500).json({ error: "backend error check backend"});
  }
    

    
};
module.exports =Task_Display;