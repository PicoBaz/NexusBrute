const axios = require('axios');
const chalk = require('chalk');
const proxySupport = require('./proxy_support');
const sessionLogger = require('./session_logger');

async function fuzz(config, sessionLog) {
    const { targetUrl, methods, payloads, maxAttempts, delayMs, useProxy } = config.apiFuzzer;
    const results = [];
    let attempts = 0;

    sessionLog.push(await sessionLogger.log(config, {
        operation: 'api_fuzzer_start',
        details: `Fuzzing ${targetUrl} with ${methods.length} methods and ${payloads.length} payloads`
    }));

    const axiosInstance = useProxy ? proxySupport.createProxyAxios(config.proxy) : axios;

    for (const method of methods) {
        for (const payload of payloads) {
            if (attempts >= maxAttempts) break;
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'api_fuzzer_attempt',
                details: `Testing ${method} ${targetUrl}?test=${payload}`
            }));
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
                sessionLog.push(await sessionLogger.log(config, {
                    operation: 'api_fuzzer_result',
                    details: `Status: ${response.status}`
                }));
            } catch (err) {
                results.push({
                    operation: 'api_fuzzer',
                    target: `${method} ${targetUrl}?test=${payload}`,
                    result: 'Failed',
                    timestamp: new Date().toISOString(),
                    error: err.message
                });
                console.error(chalk.red(`[ERROR] ${method} ${targetUrl}?test=${payload} -> ${err.message}`));
                sessionLog.push(await sessionLogger.log(config, {
                    operation: 'api_fuzzer_error',
                    details: `Error: ${err.message}`
                }));
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            attempts++;
        }
    }

    console.log(chalk.green(`[SUCCESS] API Fuzzer completed: ${results.length} attempts`));
    return results;
}

module.exports = { fuzz };