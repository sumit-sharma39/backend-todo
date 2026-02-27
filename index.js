require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//linking of all the files.
const New_task = require("./Controller/NewtaskController");
const TaskCompleted = require("./Controller/TaskCompletedController");
const DeleteTask = require("./Controller/DeleteTaskController");
const Upload = require("./Controller/ImagedetailController");
const Tasks_Display = require("./Controller/TasksController");
const UploadImage = require("./Controller/ImageUploaderController");
const EditTask  =require("./Controller/EditTaskController");
const Task_Display = require("./Controller/TaskdisplayController")
const Login = require("./Controller/LoginController");
const Register = require("./Controller/ResgisterController");
const GoogleAuth = require ("./Controller/GoogleAuth");
const GoogleLogin = require ("./Controller/GoogleLogin");
const ForgotPassword = require("./Controller/forgotpassword");
const ResetPassword = require("./Controller/resetpassword");
const requestLogger = require("./middleware/requestLogger");

const auth = require("./middleware/Auth");

const app = express();



//middleswares.
app.use(cors({
        origin: ['https://frontend-todo-theta.vercel.app', "http://localhost:5173" , "https://frontend-todo-git-main-oyasumis-projects-e42852cf.vercel.app"], // Your Vercel frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true, // Required if your Google Login uses cookies or sessions
        allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use(cookieParser());



app.use(requestLogger);

app.post("/Login"  , Login)
app.post("/Register" , Register);
app.post("/Gregister" , GoogleAuth);
app.post("/GoogleLogin" , GoogleLogin);
app.post("/forgot-password", ForgotPassword);
app.post("/reset-password/:token", ResetPassword);
app.post("/Add" ,auth, New_task);
app.delete ("/Delete/:id" ,auth, DeleteTask );
app.post("/UploadImage/:id",auth, Upload.single("image_url"), UploadImage);
app.put("/Completed/:id",auth , TaskCompleted);
app.patch("/UpdateTask/:id",auth , EditTask);
app.get("/Data",auth , Tasks_Display);
app.get("/Task/:id" ,auth, Task_Display);


app.get("/health", (req, res) =>{
    res.status(200).json({message:"okie"});
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
