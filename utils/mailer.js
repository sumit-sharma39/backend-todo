const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls:{
        family: 4
    }
    
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP CONNECTION ERROR:", error);
    } else {
        console.log("SMTP SERVER IS READY TO SEND EMAILS");
    }
});


module.exports = transporter;