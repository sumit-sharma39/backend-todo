const Database_conn = require("../Database/Database")

const DeleteTask = async (req, res) =>{
    const {ids} = req.body;

    try{
        if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array is required" });
    }

    const query = `
      delete from task
      where id = ANY($1::int[])
      returning *;
    `;

    const result = await Database_conn.query(query, [ids]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No tasks found to delete" });
    }

    return res.status(200).json({ message: "Tasks deleted successfully" });
}catch(err){
    console.log("ERROR: " , err);
    res.status(500).json({error: "500 error check backend"});
}
};

module.exports = DeleteTask;