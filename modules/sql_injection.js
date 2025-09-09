const axios = require('axios');
const chalk = require('chalk');
const { ProxyRotator } = require('./proxy_rotator');
const sessionLogger = require('./session_logger');

async function test(config, sessionLog) {
    const { targetUrl, payloads, fields, maxAttempts, delayMs, useProxy } = config.sqlInjection;
    const results = [];
    let attempts = 0;

    const proxyRotator = useProxy ? new ProxyRotator(config.proxies) : null;
    let axiosInstance = axios;

    sessionLog.push(await sessionLogger.log(config, {
        operation: 'sql_injection_start',
        details: `Testing ${targetUrl} with ${payloads.length} payloads`
    }));

    for (const payload of payloads) {
        if (attempts >= maxAttempts) break;
        if (useProxy) {
            axiosInstance = await proxyRotator.createAxiosWithRotation(config, sessionLog);
        }
        sessionLog.push(await sessionLogger.log(config, {
            operation: 'sql_injection_attempt',
            details: `Testing payload: ${payload}`
        }));
        try {
            const response = await axiosInstance.post(targetUrl, { [fields[0]]: payload }, { timeout: 5000 });
            const isVulnerable = response.data.includes('error') || response.data.includes('sql') || response.status !== 200;
            results.push({
                operation: 'sql_injection',
                target: `${targetUrl}?${fields[0]}=${payload}`,
                result: isVulnerable ? 'Potential Vulnerability' : 'No Vulnerability',
                timestamp: new Date().toISOString(),
                error: ''
            });
            console.log(chalk.cyan(`[SQLi] ${fields[0]}=${payload} -> ${isVulnerable ? 'Potential Vulnerability' : 'No Vulnerability'} (Status: ${response.status})`));
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'sql_injection_result',
                details: `Status: ${response.status}, Vulnerable: ${isVulnerable}`
            }));
        } catch (err) {
            results.push({
                operation: 'sql_injection',
                target: `${targetUrl}?${fields[0]}=${payload}`,
                result: 'Failed',
                timestamp: new Date().toISOString(),
                error: err.message
            });
            console.error(chalk.red(`[ERROR] ${fields[0]}=${payload} -> ${err.message}`));
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'sql_injection_error',
                details: `Error: ${err.message}`
            }));
            if (useProxy && err.code === 'ECONNREFUSED') {
                proxyRotator.markProxyFailed(axiosInstance.defaults.proxy);
            }
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
        attempts++;
    }

    console.log(chalk.green(`[SUCCESS] SQL Injection test completed: ${results.length} attempts`));
    return results;
}

module.exports = { test };