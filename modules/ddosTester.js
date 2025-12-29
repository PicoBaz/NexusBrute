const axios = require('axios');
const chalk = require('chalk');

class DDOSTester {
    constructor(config, proxies = []) {
        this.config = config;
        this.proxies = proxies;
        this.results = [];
        this.currentProxyIndex = 0;
        this.successfulRequests = 0;
        this.failedRequests = 0;
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

    async sendRequest(index) {
        const config = {
            method: this.config.method || 'GET',
            url: this.config.targetUrl,
            timeout: 5000,
            validateStatus: () => true,
        };

        if (this.config.payload && (this.config.method === 'POST' || this.config.method === 'PUT')) {
            config.data = this.config.payload;
        }

        const proxy = this.getProxy();
        if (proxy) {
            config.proxy = proxy;
        }

        const startTime = Date.now();

        try {
            const response = await axios(config);
            const responseTime = Date.now() - startTime;

            this.successfulRequests++;

            return {
                success: true,
                index,
                status: response.status,
                responseTime,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;

            this.failedRequests++;

            return {
                success: false,
                index,
                error: error.message,
                responseTime,
                timestamp: new Date().toISOString(),
            };
        }
    }

    async run() {
        console.log(chalk.bold.cyan('\n💥 DDoS Tester Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target: ${this.config.targetUrl}`));
        console.log(chalk.white(`Method: ${this.config.method || 'GET'}`));
        console.log(chalk.white(`Total Requests: ${this.config.requestCount}`));
        console.log(chalk.white(`Concurrent Requests: ${this.config.concurrentRequests}`));
        console.log(chalk.white(`Requests Per Second: ${this.config.requestsPerSecond}`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        const allResults = [];
        const intervalMs = Math.floor(1000 / this.config.requestsPerSecond);

        console.log(chalk.yellow('\n🚀 Starting load test...\n'));

        for (let i = 0; i < this.config.requestCount; i += this.config.concurrentRequests) {
            const batch = [];
            const batchSize = Math.min(this.config.concurrentRequests, this.config.requestCount - i);

            for (let j = 0; j < batchSize; j++) {
                batch.push(this.sendRequest(i + j));
            }

            const batchResults = await Promise.all(batch);
            allResults.push(...batchResults);

            const completed = i + batchSize;
            const progress = ((completed / this.config.requestCount) * 100).toFixed(1);

            process.stdout.write(
                `\r${chalk.cyan(`Progress: ${completed}/${this.config.requestCount} (${progress}%) | Success: ${this.successfulRequests} | Failed: ${this.failedRequests}`.padEnd(80))}`
            );

            batchResults.forEach(result => {
                if (!result.success) {
                    console.log(chalk.red(`\n✗ Request ${result.index + 1} failed: ${result.error}`));
                }
            });

            if (i + batchSize < this.config.requestCount) {
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const avgResponseTime = allResults.reduce((sum, r) => sum + r.responseTime, 0) / allResults.length;

        console.log(chalk.bold.cyan('\n\n📊 DDoS Test Summary\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Total Requests: ${this.config.requestCount}`));
        console.log(chalk.green(`Successful: ${this.successfulRequests}`));
        console.log(chalk.red(`Failed: ${this.failedRequests}`));
        console.log(chalk.white(`Success Rate: ${((this.successfulRequests / this.config.requestCount) * 100).toFixed(2)}%`));
        console.log(chalk.white(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`));
        console.log(chalk.white(`Actual Requests/Second: ${(this.config.requestCount / parseFloat(elapsed)).toFixed(2)}`));
        console.log(chalk.gray(`Total Time: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        const statusCodes = {};
        allResults.filter(r => r.success).forEach(r => {
            statusCodes[r.status] = (statusCodes[r.status] || 0) + 1;
        });

        if (Object.keys(statusCodes).length > 0) {
            console.log(chalk.yellow('\nStatus Code Distribution:'));
            Object.entries(statusCodes).forEach(([code, count]) => {
                console.log(chalk.white(`  • ${code}: ${count} (${((count / this.successfulRequests) * 100).toFixed(1)}%)`));
            });
        }

        const finalResults = {
            timestamp: new Date().toISOString(),
            targetUrl: this.config.targetUrl,
            method: this.config.method || 'GET',
            totalRequests: this.config.requestCount,
            successful: this.successfulRequests,
            failed: this.failedRequests,
            successRate: ((this.successfulRequests / this.config.requestCount) * 100).toFixed(2),
            averageResponseTime: avgResponseTime.toFixed(2),
            actualRPS: (this.config.requestCount / parseFloat(elapsed)).toFixed(2),
            timeElapsed: elapsed,
            statusCodes,
            requests: allResults,
        };

        this.results.push(finalResults);

        console.log(chalk.bold.green('\n✅ DDoS Test Complete!\n'));

        return finalResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Index,Success,Status,Response Time (ms),Error'];

        this.results.forEach(result => {
            result.requests.forEach(request => {
                csvRows.push(
                    `${request.timestamp},${request.index},${request.success},${request.status || ''},${request.responseTime},"${request.error || ''}"`
                );
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = DDOSTester;