const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs.txt');

function logger(req, res, next) {
  const logEntry = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | body: ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync(logFile, logEntry);
  next();
}

module.exports = logger;
