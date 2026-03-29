const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
    });

    // Verify connection (non-blocking)
    transporter.verify((error) => {
    if (error) {
        console.log("SMTP CONNECTION ERROR:", error);
    } else {
        console.log("SMTP SERVER IS READY TO SEND EMAILS");
    }
});

module.exports = transporter;