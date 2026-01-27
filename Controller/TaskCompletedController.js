const Database_conn = require("../Database/Database");

const TaskCompleted = async (req, res) => {
    const id = Number(req.params.id);
    try{
    const query = `update task set completed = true where id = $1`;
    const value = [id]
    // console.log({query , value})
    await Database_conn.query(query , value);

    res.status(200).json("status updated");

    }catch(err){
        console.log("error=" , err);
        res.status(500).json({error: "Internal server error"});
    }

    
};

module.exports = TaskCompleted;