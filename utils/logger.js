const { createLogger, format, transports } = require("winston");
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Only create logs folder locally
if (!isProduction) {
    const logDir = path.join(__dirname, "../logs");
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
}

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        // Always log to console
        new transports.Console(),

        // Local file logging (development only)
        ...(!isProduction ? [
            new transports.File({
                filename: path.join(__dirname, "../logs/apps.log")
            }),
            new transports.File({
                filename: path.join(__dirname, "../logs/error.log"),
                level: "error"
            })
        ] : []),

        // Betterstack (production only)
        ...(isProduction && process.env.BETTERSTACK_TOKEN ? [
            new (require("winston-transport-betterstack"))({
                sourceToken: process.env.BETTERSTACK_TOKEN
            })
        ] : [])
    ]
});

module.exports = logger;