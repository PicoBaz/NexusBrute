const axios = require('axios');
const chalk = require('chalk');
const proxySupport = require('./proxy_support');

async function check(config) {
    const { targetUrl, maxRequests, intervalMs, useProxy } = config.rateLimitChecker;
    const results = [];
    let blocked = false;

    const axiosInstance = useProxy ? proxySupport.createProxyAxios(config.proxy) : axios;

    for (let i = 0; i < maxRequests; i++) {
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
            break;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    console.log(chalk.yellow(blocked ? '[INFO] Rate limit detected!' : '[INFO] No rate limit detected.'));
    return results;
}

module.exports = { check };