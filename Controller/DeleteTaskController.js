const Database_conn = require("../Database/Database")

const DeleteTask = async (req, res) => {
  const id = req.params.id;
  const user_id = req.user.user_id;

  try {
    const query = `
      DELETE FROM task
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;

    const result = await Database_conn.query(query, [id, user_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({ message: "Task deleted successfully" });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = DeleteTask;