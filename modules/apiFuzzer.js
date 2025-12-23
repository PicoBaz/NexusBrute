const axios = require('axios');
const chalk = require('chalk');

class APIFuzzer {
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

    async sendRequest(method, payload) {
        const config = {
            method,
            url: this.config.targetUrl,
            timeout: 5000,
            validateStatus: () => true,
        };

        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
            config.data = { test: payload };
        } else if (method === 'GET' || method === 'DELETE') {
            config.params = { test: payload };
        }

        const proxy = this.getProxy();
        if (proxy) {
            config.proxy = proxy;
        }

        try {
            const response = await axios(config);
            return {
                success: true,
                status: response.status,
                data: response.data,
                headers: response.headers,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    analyzeResponse(response, payload) {
        const vulnerabilities = [];

        if (!response.success) return vulnerabilities;

        if (response.status === 500) {
            vulnerabilities.push({
                type: 'SERVER_ERROR',
                severity: 'MEDIUM',
                description: 'Server error triggered by payload',
                payload,
            });
        }

        if (response.data && typeof response.data === 'string') {
            if (response.data.includes(payload)) {
                vulnerabilities.push({
                    type: 'REFLECTION',
                    severity: 'MEDIUM',
                    description: 'Payload reflected in response',
                    payload,
                });
            }

            if (response.data.toLowerCase().includes('error') ||
                response.data.toLowerCase().includes('exception')) {
                vulnerabilities.push({
                    type: 'ERROR_DISCLOSURE',
                    severity: 'LOW',
                    description: 'Error message disclosed in response',
                    payload,
                });
            }
        }

        return vulnerabilities;
    }

    async run() {
        console.log(chalk.bold.cyan('\n🔍 API Fuzzer Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target: ${this.config.targetUrl}`));
        console.log(chalk.white(`Methods: ${this.config.methods.join(', ')}`));
        console.log(chalk.white(`Payloads: ${this.config.payloads.length}`));
        console.log(chalk.white(`Max Attempts: ${this.config.maxAttempts || 'Unlimited'}`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        let attempts = 0;
        const maxAttempts = this.config.maxAttempts || Infinity;
        const allResults = [];
        let totalVulnerabilities = 0;

        for (const method of this.config.methods) {
            for (const payload of this.config.payloads) {
                if (attempts >= maxAttempts) {
                    console.log(chalk.yellow('\n⚠️  Max attempts reached'));
                    break;
                }

                attempts++;
                const testUrl = `${method} ${this.config.targetUrl}`;
                process.stdout.write(`\r${chalk.cyan(`[${attempts}] Testing ${testUrl} with payload...`.padEnd(70))}`);

                const response = await this.sendRequest(method, payload);
                const vulnerabilities = this.analyzeResponse(response, payload);

                const resultEntry = {
                    timestamp: new Date().toISOString(),
                    method,
                    payload,
                    success: response.success,
                    status: response.status,
                    error: response.error || null,
                    vulnerabilities,
                };

                allResults.push(resultEntry);

                if (vulnerabilities.length > 0) {
                    totalVulnerabilities += vulnerabilities.length;
                    console.log(chalk.red(`\n⚠️  ${method} - Vulnerabilities found with payload: ${payload}`));
                    vulnerabilities.forEach(vuln => {
                        console.log(chalk.yellow(`  • ${vuln.type}: ${vuln.description}`));
                    });
                } else if (response.success) {
                    console.log(chalk.green(`\n✓ ${method} - Status: ${response.status}`));
                } else if (response.error) {
                    console.log(chalk.red(`\n✗ ${method} - Error: ${response.error}`));
                }

                if (this.config.delay) {
                    await new Promise(resolve => setTimeout(resolve, this.config.delay));
                }
            }

            if (attempts >= maxAttempts) break;
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const successful = allResults.filter(r => r.success).length;

        console.log(chalk.bold.cyan('\n\n📊 API Fuzzer Summary\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Total Requests: ${attempts}`));
        console.log(chalk.green(`Successful: ${successful}`));
        console.log(chalk.red(`Failed: ${attempts - successful}`));

        if (totalVulnerabilities > 0) {
            console.log(chalk.red(`⚠️  Vulnerabilities Found: ${totalVulnerabilities}`));
        } else {
            console.log(chalk.green('✓ No vulnerabilities detected'));
        }

        console.log(chalk.gray(`Time elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        if (totalVulnerabilities > 0) {
            console.log(chalk.yellow('\nVulnerability Breakdown:'));
            const vulnTypes = {};
            allResults.forEach(r => {
                r.vulnerabilities.forEach(v => {
                    vulnTypes[v.type] = (vulnTypes[v.type] || 0) + 1;
                });
            });
            Object.entries(vulnTypes).forEach(([type, count]) => {
                console.log(chalk.white(`  • ${type}: ${count}`));
            });
        }

        const finalResults = {
            timestamp: new Date().toISOString(),
            targetUrl: this.config.targetUrl,
            totalRequests: attempts,
            successful,
            failed: attempts - successful,
            vulnerabilitiesFound: totalVulnerabilities,
            timeElapsed: elapsed,
            requests: allResults,
        };

        this.results.push(finalResults);

        console.log(chalk.bold.green('\n✅ API Fuzzer Complete!\n'));

        return finalResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Method,Payload,Success,Status,Vulnerabilities,Error'];

        this.results.forEach(result => {
            result.requests.forEach(request => {
                const vulns = request.vulnerabilities.map(v => v.type).join(';');
                csvRows.push(
                    `${request.timestamp},"${request.method}","${request.payload}",${request.success},${request.status || ''},"${vulns}","${request.error || ''}"`
                );
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = APIFuzzer;