const Database_conn = require("../Database/Database");

const Tasks_Display = async (req, res) => {
    try {
    const result = await Database_conn.query(`
      select id, title, description, bullets, deadline, completed,image_url
      from task
      order by id DESC
    `);
    // console.log(result);

      res.status(200).json({data: result.rows})


  } catch (error) {
    console.error("Display_Task error:", error);
    return res.status(500).json({message: "check backend "});
  }
};
module.exports = Tasks_Display;