const fs = require('fs').promises;
const chalk = require('chalk');

async function log(config, entry) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        operation: entry.operation,
        details: entry.details
    };
    console.log(chalk.blue(`[LOG] ${logEntry.timestamp} - ${logEntry.operation}: ${logEntry.details}`));
    return logEntry;
}

async function save(config, sessionLog) {
    const { logFile } = config.sessionLogger;
    try {
        await fs.appendFile(logFile, JSON.stringify(sessionLog, null, 2) + '\n');
        console.log(chalk.green(`[SUCCESS] Session log saved to ${logFile}`));
    } catch (err) {
        console.error(chalk.red(`[ERROR] Failed to save session log: ${err.message}`));
    }
}

module.exports = { log, save };