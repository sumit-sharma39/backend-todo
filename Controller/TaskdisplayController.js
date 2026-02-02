const Database_conn = require("../Database/Database");

const Task_Display = async (req, res) => {
  try {
    const user_id = req.user_id;

    if (!user_id) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const result = await Database_conn.query(
      `select id, title, description, bullets, deadline, completed, image_url
       from task
       where user_id = $1
       order by id desc`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "backend" });
  }
};

module.exports = Task_Display;
