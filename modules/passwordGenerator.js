const chalk = require('chalk');
const sessionLogger = require('./sessionLogger');

async function generate(config, sessionLog) {
    const { length, count, useSpecialChars } = config.passwordGenerator;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + (useSpecialChars ? '!@#$%^&*' : '');
    const results = [];

    sessionLog.push(await sessionLogger.log(config, {
        operation: 'password_gen_start',
        details: `Generating ${count} passwords with length ${length}`
    }));

    for (let i = 0; i < count; i++) {
        let password = '';
        for (let j = 0; j < length; j++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        results.push({
            operation: 'password_gen',
            target: 'generated_password',
            result: password,
            timestamp: new Date().toISOString(),
            error: ''
        });
        sessionLog.push(await sessionLogger.log(config, {
            operation: 'password_gen_result',
            details: `Generated: ${password}`
        }));
    }
    console.log(chalk.green(`[SUCCESS] Generated ${count} passwords`));
    return results;
}

module.exports = generate;