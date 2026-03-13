const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    
});

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP Error:", err);
  } else {
    console.log("SMTP server ready");
  }
});

module.exports = transporter;