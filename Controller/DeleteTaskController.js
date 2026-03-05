const Database_conn = require("../Database/Database");
const logger = require("../utils/logger");

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

      logger.warn({
        action: "DELETE_TASK_FAILED",
        message: "Task not found or unauthorized delete attempt",
        task_id: id,
        user_id: user_id
      });

      return res.status(404).json({ error: "Task not found" });
    }

    const deletedTask = result.rows[0];

    logger.warn({
      action: "DELETE_TASK",
      message: "Task deleted successfully",
      task_id: deletedTask.id,
      title: deletedTask.title,
      user_id: user_id
    });

    return res.status(200).json({ message: "Task deleted successfully" });

  } catch (err) {

    logger.error({
      action: "DELETE_TASK_ERROR",
      message: "Error deleting task",
      task_id: id,
      user_id: user_id,
      error: err.message
    });

    console.log("ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = DeleteTask;