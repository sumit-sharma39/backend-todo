const multer = require ("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../Controller/cloudinary");
const storage = new CloudinaryStorage ({
    cloudinary ,
    params:{
        folder :"new_todo_image",
        allowed_formats: ["jpeg" , "jpg" , "png" , "webp"],
        transformation :[{width:1200 , quality: "auto"}],
    }
});
const upload =multer ({
    storage , 
    limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;