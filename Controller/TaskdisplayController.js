const Database_conn = require("../Database/Database");

const Task_Display = async (req, res) => {
  try {
    const task_id = req.params.id;
    const user_id = req.user.user_id; // from JWT middleware

    if (!user_id) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const result = await Database_conn.query(
      `SELECT title, description, bullets, deadline, completed, image_url
       FROM task
       WHERE id = $1 AND user_id = $2`,
      [task_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "task not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "backend" });
  }
};

module.exports = Task_Display;
