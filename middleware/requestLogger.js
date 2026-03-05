const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        logger.info({
            message: "HTTP Request",
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
            duration: `${Date.now() - start}ms`
        });
    });

    next();
};

module.exports = requestLogger;