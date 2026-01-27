const Database_conn = require("../Database/Database");

const EditTask= async (req, res) =>{
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
        return res.status(400).json({ message: "Task ID required" });
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Nothing to update" });
    }

    try {
        const fields = [];
        const values = [];
        let count = 1;
        for (const key in updates) {
        fields.push(`${key} = $${count}`);
        values.push(updates[key]);
        count++;
        }
        values.push(id);
        const query = ` UPDATE task SET ${fields.join(", ")}
                        WHERE id = $${count} RETURNING *; `;

        const result = await Database_conn.query(query, values);
        if (result.rowCount === 0) {
        return res.status(404).json({ message: "Task not found" });
        }

        res.json({
        message: "Task updated",
        data: result.rows[0],
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Update failed" });
    }
};

module.exports = EditTask;
