const Database_conn = require("../Database/Database");
const logger = require("../utils/logger");

const Task_Display = async (req, res) => {
  try {
    const task_id = Number(req.params.id);
    const user_id = req.user.user_id; // from JWT middleware

    if (!user_id) {
      logger.warn({
        action: "TASK_DISPLAY_FAILED",
        message: "Unauthorized access attempt",
        task_id,
      });
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isNaN(task_id)) {
      logger.warn({
        action: "TASK_DISPLAY_FAILED",
        message: "Invalid task ID",
        user_id,
        task_id: req.params.id,
      });
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const query = `
      SELECT id, title, description, bullets, deadline, completed, image_url
      FROM task
      WHERE id = $1 AND user_id = $2
    `;

    const result = await Database_conn.query(query, [task_id, user_id]);

    if (result.rowCount === 0) {
      logger.warn({
        action: "TASK_DISPLAY_FAILED",
        message: "Task not found or unauthorized attempt",
        user_id,
        task_id,
      });
      return res.status(404).json({ error: "Task not found" });
    }

    const task = result.rows[0];

    logger.info({
      action: "TASK_DISPLAY_SUCCESS",
      message: "Task retrieved successfully",
      user_id,
      task_id,
      title: task.title,
    });

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (err) {
    logger.error({
      action: "TASK_DISPLAY_ERROR",
      message: "Error fetching task",
      error: err.message,
      task_id: req.params.id,
      user_id: req.user?.user_id,
    });

    console.error("Task_Display Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = Task_Display;