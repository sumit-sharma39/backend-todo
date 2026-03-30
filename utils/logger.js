const { createLogger, format, transports } = require("winston");
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
    const logDir = path.join(__dirname, "../logs");
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
}

const loggerTransports = [
    new transports.Console(),

    ...(!isProduction ? [
        new transports.File({ filename: path.join(__dirname, "../logs/apps.log") }),
        new transports.File({ filename: path.join(__dirname, "../logs/error.log"), level: "error" })
    ] : []),

    ...(isProduction && process.env.BETTERSTACK_TOKEN ? [
        new LogtailTransport(new Logtail(process.env.BETTERSTACK_TOKEN))
    ] : [])
];

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: loggerTransports
});

module.exports = logger;