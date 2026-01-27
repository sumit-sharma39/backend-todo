const database_conn = require("../Database/Database");

const uploadImages = async (req, res) => {
  try {
    const id = Number(req.params.id);
    // console.log(id);
    if(!id){
        return res.status(400).json({error: "Id imvalid"});
    }
    if (!req.file) {
        return res.status(400).json({ error: "No images uploaded" });
    }
    

    const imageUrl = req.file.path;
    console.log("imageurl: " , imageUrl);
    console.log("file: " , req.file);
    const result = await database_conn.query(
    `update task
    set image_url = $1
    where id = $2
    returning *`,
    [imageUrl, id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: "task not found" });
    }
    console.log("image url thats returned is" ,imageUrl);
    res.status(200).json({image: [imageUrl]});

    } catch (err) {
    console.error("uploadimage error: ", err);
    res.status(500).json({ error:  "image upload failed" });
    }
};

module.exports = uploadImages;
