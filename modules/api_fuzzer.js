const axios = require('axios');
const chalk = require('chalk');
const proxySupport = require('./proxy_support');

async function fuzz(config) {
    const { targetUrl, methods, payloads, maxAttempts, delayMs, useProxy } = config.apiFuzzer;
    const results = [];
    let attempts = 0;

    const axiosInstance = useProxy ? proxySupport.createProxyAxios(config.proxy) : axios;

    for (const method of methods) {
        for (const payload of payloads) {
            if (attempts >= maxAttempts) break;
            try {
                const response = await axiosInstance({
                    method,
                    url: targetUrl,
                    data: method === 'POST' ? { test: payload } : null,
                    params: method === 'GET' ? { test: payload } : null,
                    timeout: 5000
                });
                results.push({
                    operation: 'api_fuzzer',
                    target: `${method} ${targetUrl}?test=${payload}`,
                    result: `Status: ${response.status}`,
                    timestamp: new Date().toISOString(),
                    error: ''
                });
                console.log(chalk.cyan(`[FUZZ] ${method} ${targetUrl}?test=${payload} -> ${response.status}`));
            } catch (err) {
                results.push({
                    operation: 'api_fuzzer',
                    target: `${method} ${targetUrl}?test=${payload}`,
                    result: 'Failed',
                    timestamp: new Date().toISOString(),
                    error: err.message
                });
                console.error(chalk.red(`[ERROR] ${method} ${targetUrl}?test=${payload} -> ${err.message}`));
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            attempts++;
        }
    }

    const saveResults = require('../index').saveResults;
    await saveResults(results);
    console.log(chalk.green(`[SUCCESS] API Fuzzer completed: ${results.length} attempts`));
}

module.exports = { fuzz };