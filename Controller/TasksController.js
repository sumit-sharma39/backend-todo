const Database_conn = require("../Database/Database");

const Tasks_Display = async (req, res) => {
    try {
    const user_id = req.params.userId;
    const result = await Database_conn.query(`
      SELECT id, title, description, bullets, deadline, completed, image_url
      FROM task
      WHERE user_id = $1
      ORDER BY id DESC;
    `,[user_id] );
    // console.log(result);

      res.status(200).json({data: result.rows})


  } catch (error) {
    console.error("Display_Task error:", error);
    return res.status(500).json({message: "check backend "});
  }
};
module.exports = Tasks_Display;