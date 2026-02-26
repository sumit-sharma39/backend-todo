const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  logger.info({
    message: "Incoming Request",
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  next();
};

module.exports = requestLogger;