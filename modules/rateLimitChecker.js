const axios = require('axios');
const chalk = require('chalk');

class RateLimitChecker {
    constructor(config, proxies = []) {
        this.config = config;
        this.proxies = proxies;
        this.results = [];
        this.currentProxyIndex = 0;
    }

    getProxy() {
        if (!this.config.useProxy || this.proxies.length === 0) {
            return null;
        }
        const proxy = this.proxies[this.currentProxyIndex];
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
        return {
            host: proxy.host,
            port: proxy.port,
            protocol: proxy.protocol,
        };
    }

    async sendRequest() {
        const config = {
            method: 'GET',
            url: this.config.targetUrl,
            timeout: 5000,
            validateStatus: () => true,
        };

        const proxy = this.getProxy();
        if (proxy) {
            config.proxy = proxy;
        }

        const startTime = Date.now();

        try {
            const response = await axios(config);
            const responseTime = Date.now() - startTime;

            return {
                success: true,
                status: response.status,
                responseTime,
                headers: response.headers,
                rateLimitHeaders: this.extractRateLimitHeaders(response.headers),
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;

            return {
                success: false,
                error: error.message,
                responseTime,
            };
        }
    }

    extractRateLimitHeaders(headers) {
        const rateLimitHeaders = {};
        const possibleHeaders = [
            'x-ratelimit-limit',
            'x-ratelimit-remaining',
            'x-ratelimit-reset',
            'x-rate-limit-limit',
            'x-rate-limit-remaining',
            'x-rate-limit-reset',
            'retry-after',
            'ratelimit-limit',
            'ratelimit-remaining',
            'ratelimit-reset',
        ];

        possibleHeaders.forEach(header => {
            if (headers[header]) {
                rateLimitHeaders[header] = headers[header];
            }
        });

        return Object.keys(rateLimitHeaders).length > 0 ? rateLimitHeaders : null;
    }

    detectRateLimit(result) {
        if (!result.success) {
            if (result.error.includes('429') || result.error.includes('rate limit')) {
                return { detected: true, reason: 'Error message indicates rate limiting' };
            }
            return { detected: true, reason: 'Request failed - possible rate limit' };
        }

        if (result.status === 429) {
            return { detected: true, reason: 'HTTP 429 Too Many Requests' };
        }

        if (result.rateLimitHeaders) {
            const remaining = result.rateLimitHeaders['x-ratelimit-remaining'] ||
                result.rateLimitHeaders['x-rate-limit-remaining'] ||
                result.rateLimitHeaders['ratelimit-remaining'];

            if (remaining !== undefined && parseInt(remaining) === 0) {
                return { detected: true, reason: 'Rate limit header shows 0 remaining' };
            }
        }

        return { detected: false, reason: null };
    }

    async check() {
        console.log(chalk.bold.cyan('\n⏱️  Rate Limit Checker Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target: ${this.config.targetUrl}`));
        console.log(chalk.white(`Max Requests: ${this.config.maxRequests}`));
        console.log(chalk.white(`Interval: ${this.config.interval}ms`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        const allResults = [];
        let rateLimitDetected = false;
        let rateLimitReason = null;
        let rateLimitAt = null;

        console.log(chalk.yellow('\n📡 Sending requests...\n'));

        for (let i = 0; i < this.config.maxRequests; i++) {
            process.stdout.write(`\r${chalk.cyan(`Request ${i + 1}/${this.config.maxRequests}...`.padEnd(60))}`);

            const result = await this.sendRequest();
            const rateLimit = this.detectRateLimit(result);

            const resultEntry = {
                index: i + 1,
                timestamp: new Date().toISOString(),
                success: result.success,
                status: result.status,
                responseTime: result.responseTime,
                rateLimitHeaders: result.rateLimitHeaders,
                error: result.error || null,
            };

            allResults.push(resultEntry);

            if (result.success) {
                const statusColor = result.status === 200 ? chalk.green : chalk.yellow;
                console.log(statusColor(`\n✓ Request ${i + 1}: Status ${result.status} (${result.responseTime}ms)`));

                if (result.rateLimitHeaders) {
                    console.log(chalk.gray(`  Rate Limit Headers:`));
                    Object.entries(result.rateLimitHeaders).forEach(([key, value]) => {
                        console.log(chalk.gray(`    ${key}: ${value}`));
                    });
                }
            } else {
                console.log(chalk.red(`\n✗ Request ${i + 1}: ${result.error}`));
            }

            if (rateLimit.detected && !rateLimitDetected) {
                rateLimitDetected = true;
                rateLimitReason = rateLimit.reason;
                rateLimitAt = i + 1;
                console.log(chalk.red(`\n⚠️  Rate Limit Detected at request ${rateLimitAt}!`));
                console.log(chalk.yellow(`   Reason: ${rateLimitReason}`));
                break;
            }

            if (i < this.config.maxRequests - 1) {
                await new Promise(resolve => setTimeout(resolve, this.config.interval));
            }
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const successful = allResults.filter(r => r.success).length;
        const avgResponseTime = allResults.reduce((sum, r) => sum + r.responseTime, 0) / allResults.length;

        console.log(chalk.bold.cyan('\n\n📊 Rate Limit Analysis\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Total Requests: ${allResults.length}`));
        console.log(chalk.green(`Successful: ${successful}`));
        console.log(chalk.red(`Failed: ${allResults.length - successful}`));
        console.log(chalk.white(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`));

        if (rateLimitDetected) {
            console.log(chalk.red(`\n⚠️  Rate Limit: DETECTED`));
            console.log(chalk.yellow(`   Triggered at: Request ${rateLimitAt}`));
            console.log(chalk.yellow(`   Reason: ${rateLimitReason}`));
        } else {
            console.log(chalk.green(`\n✓ Rate Limit: NOT DETECTED`));
            console.log(chalk.gray(`   Completed ${allResults.length} requests without hitting limits`));
        }

        console.log(chalk.gray(`\nTime elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        const statusCodes = {};
        allResults.filter(r => r.success).forEach(r => {
            statusCodes[r.status] = (statusCodes[r.status] || 0) + 1;
        });

        if (Object.keys(statusCodes).length > 0) {
            console.log(chalk.yellow('\nStatus Code Distribution:'));
            Object.entries(statusCodes).forEach(([code, count]) => {
                console.log(chalk.white(`  • ${code}: ${count}`));
            });
        }

        const finalResults = {
            timestamp: new Date().toISOString(),
            targetUrl: this.config.targetUrl,
            totalRequests: allResults.length,
            successful,
            failed: allResults.length - successful,
            averageResponseTime: avgResponseTime.toFixed(2),
            rateLimitDetected,
            rateLimitReason,
            rateLimitAt,
            timeElapsed: elapsed,
            statusCodes,
            requests: allResults,
        };

        this.results.push(finalResults);

        console.log(chalk.bold.green('\n✅ Rate Limit Check Complete!\n'));

        return finalResults;
    }

    run() {
        return this.check();
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Index,Success,Status,Response Time (ms),Rate Limit Headers,Error'];

        this.results.forEach(result => {
            result.requests.forEach(request => {
                const headers = request.rateLimitHeaders ? JSON.stringify(request.rateLimitHeaders).replace(/"/g, "'") : '';
                csvRows.push(
                    `${request.timestamp},${request.index},${request.success},${request.status || ''},${request.responseTime},"${headers}","${request.error || ''}"`
                );
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = RateLimitChecker;