const { createLogger, format, transports } = require("winston");
const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");
console.log("Log directory:", logDir);
// ensure logs folder exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
console.log("Logger initialized, logs will be stored in:", logDir);

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        // console logs (important for production)
        // new transports.Console(),

        // // all logs
        // new transports.File({
        //     filename: path.join(logDir, "apps.log")
        // }),

        // // error logs
        // new transports.File({
        //     filename: path.join(logDir, "error.log"),
        //     level: "error"
        // })
    ]
});

module.exports = logger;