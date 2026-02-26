const Database_conn = require("../Database/Database");
const logger = require("../utils/logger");

const TaskCompleted = async (req, res) => {
    const id = Number(req.params.id);
    try{
    const query = `update task set completed = true where id = $1`;
    const value = [id]
    // console.log({query , value})
    await Database_conn.query(query , value);

    logger.info({
            message: "task completed",
            user_id,
            title
            });

    res.status(200).json("status updated");


    }catch(err){
        logger.error({
            message: "task completion failed",
            user_id,
            title
            });
        console.log("error=" , err);
        res.status(500).json({error: "Internal server error"});
    }

};

module.exports = TaskCompleted;