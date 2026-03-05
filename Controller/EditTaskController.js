const Database_conn = require("../Database/Database");
const logger = require("../utils/logger");

const EditTask = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const user_id = req.user.user_id;

    if (!id) {

        logger.warn({
        action: "UPDATE_TASK_FAILED",
        message: "Task update attempted without task ID",
        user_id
        });

        return res.status(400).json({ message: "Task ID required" });
    }

    if (Object.keys(updates).length === 0) {

        logger.warn({
        action: "UPDATE_TASK_FAILED",
        message: "Empty update payload",
        task_id: id,
        user_id
        });

        return res.status(400).json({ message: "Nothing to update" });
    }

    try {

        // Allowed fields (security best practice)
        const allowedFields = ["title", "description", "status", "due_date"];

        const fields = [];
        const values = [];
        let count = 1;

        for (const key in updates) {

        if (!allowedFields.includes(key)) continue;

        fields.push(`${key} = $${count}`);
        values.push(updates[key]);
        count++;
        }

        if (fields.length === 0) {

        logger.warn({
            action: "UPDATE_TASK_FAILED",
            message: "No valid fields provided for update",
            task_id: id,
            user_id
        });

        return res.status(400).json({ message: "Invalid fields in update" });
        }

        values.push(id);
        values.push(user_id);

        const query = `
        UPDATE task
        SET ${fields.join(", ")}
        WHERE id = $${count} AND user_id = $${count + 1}
        RETURNING *;
        `;

        const result = await Database_conn.query(query, values);

        if (result.rowCount === 0) {

        logger.warn({
            action: "UPDATE_TASK_FAILED",
            message: "Task not found or unauthorized update attempt",
            task_id: id,
            user_id
        });

        return res.status(404).json({ message: "Task not found" });
        }

        const updatedTask = result.rows[0];

        logger.info({
        action: "UPDATE_TASK_SUCCESS",
        message: "Task updated successfully",
        task_id: updatedTask.id,
        title: updatedTask.title,
        user_id,
        updated_fields: Object.keys(updates)
        });

        res.json({
        message: "Task updated",
        data: updatedTask
        });

    } catch (err) {

        logger.error({
        action: "UPDATE_TASK_ERROR",
        message: "Database error while updating task",
        task_id: id,
        user_id,
        error: err.message
        });

        console.error(err);

        res.status(500).json({
        message: "Update failed"
        });
    }
};

module.exports = EditTask;