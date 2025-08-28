const chalk = require('chalk');

function generate(config) {
    const { length, count, useSpecialChars } = config.passwordGenerator;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + (useSpecialChars ? '!@#$%^&*' : '');
    const results = [];

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
    }
    console.log(chalk.green(`[SUCCESS] Generated ${count} passwords`));
    return results;
}

module.exports = { generate };