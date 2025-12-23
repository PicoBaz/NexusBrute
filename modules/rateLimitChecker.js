const axios = require('axios');
const chalk = require('chalk');
const { ProxyRotator } = require('./proxy_rotator');
const sessionLogger = require('./sessionLogger');

async function check(config, sessionLog) {
    const { targetUrl, maxRequests, intervalMs, useProxy } = config.rateLimitChecker;
    const results = [];
    let blocked = false;

    const proxyRotator = useProxy ? new ProxyRotator(config.proxies) : null;
    let axiosInstance = axios;

    sessionLog.push(await sessionLogger.log(config, {
        operation: 'rate_limit_start',
        details: `Probing ${targetUrl} with ${maxRequests} requests`
    }));

    for (let i = 0; i < maxRequests; i++) {
        if (useProxy) {
            axiosInstance = await proxyRotator.createAxiosWithRotation(config, sessionLog);
        }
        try {
            const response = await axiosInstance.get(targetUrl, { timeout: 5000 });
            results.push({
                operation: 'rate_limit',
                target: targetUrl,
                result: `Request ${i + 1}: ${response.status}`,
                timestamp: new Date().toISOString(),
                error: ''
            });
            console.log(chalk.cyan(`[ATTEMPT ${i + 1}] Status: ${response.status}`));
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'rate_limit_result',
                details: `Request ${i + 1}: Status ${response.status}`
            }));
        } catch (err) {
            blocked = true;
            results.push({
                operation: 'rate_limit',
                target: targetUrl,
                result: `Request ${i + 1}: Failed`,
                timestamp: new Date().toISOString(),
                error: err.message
            });
            console.error(chalk.red(`[ERROR] Request ${i + 1}: ${err.message}`));
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'rate_limit_error',
                details: `Request ${i + 1}: Error ${err.message}`
            }));
            if (useProxy && err.code === 'ECONNREFUSED') {
                proxyRotator.markProxyFailed(axiosInstance.defaults.proxy);
            }
            break;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    console.log(chalk.yellow(blocked ? '[INFO] Rate limit detected!' : '[INFO] No rate limit detected.'));
    return results;
}

module.exports = check;