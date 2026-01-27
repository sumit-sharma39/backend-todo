require("dotenv").config();
const express = require("express");
const cors = require("cors");

const New_task = require("./Controller/NewtaskController");
const TaskCompleted = require("./Controller/TaskCompletedController");
const DeleteTask = require("./Controller/DeleteTaskController");
const Upload = require("./Controller/ImagedetailController");
const Tasks_Display = require("./Controller/TasksController");
const UploadImage = require("./Controller/ImageUploaderController");
const EditTask  =require("./Controller/EditTaskController");
const Task_Display = require("./Controller/TaskdisplayController")



const app= express();
app.use(cors());
app.use(express.json());

app.post("/Add" , New_task);
app.delete ("/Delete" , DeleteTask );
app.post("/UploadImage/:id", Upload.single("image_url"), UploadImage);
app.put("/Completed/:id" , TaskCompleted);
app.patch("/UpdateTask/:id" , EditTask);
app.get("/Data" , Tasks_Display);
app.get("/Task/:id" , Task_Display);


app.get("/health", (req, res) =>{
    res.status(200).json({message:"okie"});
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
