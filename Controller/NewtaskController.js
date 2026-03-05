const Database_conn = require("../Database/Database");
const logger = require("../utils/logger");

const New_task = async (req, res) => {
    const { title, description, Points, date, completed } = req.body;
    const user_id = req.user.user_id;

    if (!title || title.trim() === "") {
        logger.warn({
        action: "CREATE_TASK_FAILED",
        message: "Task creation attempted without title",
        user_id
        });

        return res.status(400).json({ error: "Task title is required" });
    }

    try {
        const query = `
        INSERT INTO task (title, description, bullets, deadline, completed, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `;

        const values = [
        title.trim(),
        description || "",
        Points || [],
        date || null,
        completed ?? false,
        user_id
        ];

        const result = await Database_conn.query(query, values);
        const createdTask = result.rows[0];

        logger.info({
        action: "CREATE_TASK_SUCCESS",
        message: "Task created successfully",
        user_id,
        task_id: createdTask.id,
        title: createdTask.title,
        completed: createdTask.completed
        });

        return res.status(201).json({
        message: "Task created successfully",
        data: createdTask
        });

    } catch (err) {
        logger.error({
        action: "CREATE_TASK_ERROR",
        message: "Failed to create task",
        user_id,
        title,
        error: err.message
        });

        console.error(err);

        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = New_task;