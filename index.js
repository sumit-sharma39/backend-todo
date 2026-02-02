require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userMiddleware = require("./middleware/user");

const New_task = require("./Controller/NewtaskController");
const TaskCompleted = require("./Controller/TaskCompletedController");
const DeleteTask = require("./Controller/DeleteTaskController");
const Upload = require("./Controller/ImagedetailController");
const Tasks_Display = require("./Controller/TasksController");
const UploadImage = require("./Controller/ImageUploaderController");
const EditTask = require("./Controller/EditTaskController");
const Task_Display = require("./Controller/TaskdisplayController");
const Login = require("./Controller/LoginController");
const Register = require("./Controller/ResgisterController");
const GoogleAuth = require("./Controller/GoogleAuth");
const GoogleLogin = require("./Controller/GoogleLogin");

const app = express();

app.use(cors());
app.use(express.json());
app.use(userMiddleware);

app.post("/login", Login);
app.post("/register", Register);
app.post("/gregister", GoogleAuth);
app.post("/googlelogin", GoogleLogin);

app.post("/tasks", New_task);
app.get("/tasks", Tasks_Display);
app.get("/tasks/:id", Task_Display);
app.patch("/tasks/:id", EditTask);
app.put("/tasks/:id/completed", TaskCompleted);
app.delete("/tasks/:id", DeleteTask);

app.post("/tasks/:id/image", Upload.single("image_url"), UploadImage);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "ok" });
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
