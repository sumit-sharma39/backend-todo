const Database_conn = require("../Database/Database");
const logger = require("../utils/logger");

const TaskCompleted = async (req, res) => {
    const id = Number(req.params.id);
    const user_id = req.user.user_id;

    if (isNaN(id)) {
        logger.warn({
        action: "COMPLETE_TASK_FAILED",
        message: "Invalid task ID",
        user_id,
        task_id: req.params.id
        });
        return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
        // Update only if task belongs to user
        const query = `
        UPDATE task
        SET completed = true
        WHERE id = $1 AND user_id = $2
        RETURNING id, title, completed
        `;
        const values = [id, user_id];

        const result = await Database_conn.query(query, values);

        if (result.rowCount === 0) {
        logger.warn({
            action: "COMPLETE_TASK_FAILED",
            message: "Task not found or unauthorized attempt",
            user_id,
            task_id: id
        });
        return res.status(404).json({ error: "Task not found" });
        }

        const task = result.rows[0];

        logger.info({
        action: "COMPLETE_TASK_SUCCESS",
        message: "Task marked as completed",
        user_id,
        task_id: task.id,
        title: task.title
        });

        return res.status(200).json({
        message: "Task completed successfully",
        data: task
        });

    } catch (err) {
        logger.error({
        action: "COMPLETE_TASK_ERROR",
        message: "Error completing task",
        user_id,
        task_id: id,
        error: err.message
        });
        console.error("TaskCompleted Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = TaskCompleted;