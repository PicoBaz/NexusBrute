const WebSocket = require('ws');
const chalk = require('chalk');
const crypto = require('crypto');

class WebSocketTester {
    constructor(config) {
        this.config = config;
        this.results = [];
        this.ws = null;
        this.messageLog = [];
    }

    async connect(url, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url, options);

                const timeout = setTimeout(() => {
                    if (this.ws.readyState !== WebSocket.OPEN) {
                        this.ws.terminate();
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);

                this.ws.on('open', () => {
                    clearTimeout(timeout);
                    resolve(true);
                });

                this.ws.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });

                this.ws.on('message', (data) => {
                    this.messageLog.push({
                        timestamp: new Date().toISOString(),
                        direction: 'received',
                        data: data.toString(),
                    });
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    async sendMessage(message) {
        return new Promise((resolve) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(message, (error) => {
                    if (!error) {
                        this.messageLog.push({
                            timestamp: new Date().toISOString(),
                            direction: 'sent',
                            data: message,
                        });
                    }
                    resolve(!error);
                });
            } else {
                resolve(false);
            }
        });
    }

    closeConnection() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    async waitForMessage(timeout = 5000) {
        return new Promise((resolve) => {
            const startLength = this.messageLog.length;
            const startTime = Date.now();

            const checkInterval = setInterval(() => {
                if (this.messageLog.length > startLength) {
                    clearInterval(checkInterval);
                    resolve(this.messageLog[this.messageLog.length - 1]);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    resolve(null);
                }
            }, 100);
        });
    }

    async testConnectionSecurity(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Connection Security...'));
        const results = [];

        const protocols = ['ws://', 'wss://'];
        const urlWithoutProtocol = targetUrl.replace(/^wss?:\/\//, '');

        for (const protocol of protocols) {
            const testUrl = protocol + urlWithoutProtocol;
            process.stdout.write(`\r${chalk.cyan(`Testing ${protocol}...`)}`);

            try {
                await this.connect(testUrl);
                const isSecure = protocol === 'wss://';

                results.push({
                    protocol,
                    connected: true,
                    secure: isSecure,
                    vulnerability: !isSecure ? {
                        type: 'INSECURE_CONNECTION',
                        severity: 'HIGH',
                        description: 'WebSocket connection not using secure protocol (wss://)',
                    } : null,
                });

                this.closeConnection();
                console.log(chalk.green(`\n✓ ${protocol} connection successful`));
            } catch (error) {
                console.log(chalk.gray(`\n✗ ${protocol} connection failed`));
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
        }

        return results;
    }

    async testOriginValidation(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Origin Validation...'));
        const results = [];

        const origins = [
            null,
            'http://evil.com',
            'https://evil.com',
            'http://localhost',
            'null',
            'file://',
            '../../../etc/passwd',
            '<script>alert(1)</script>',
        ];

        for (let i = 0; i < origins.length; i++) {
            const origin = origins[i];
            process.stdout.write(`\r${chalk.cyan(`Testing origin ${i + 1}/${origins.length}...`)}`);

            try {
                const headers = origin !== null ? { origin } : {};
                await this.connect(targetUrl, { headers });

                results.push({
                    origin: origin || 'none',
                    accepted: true,
                    vulnerability: {
                        type: 'ORIGIN_VALIDATION_BYPASS',
                        severity: 'HIGH',
                        description: `Server accepted connection from untrusted origin: ${origin || 'none'}`,
                    },
                });

                console.log(chalk.red(`\n✗ VULNERABILITY: Origin '${origin || 'none'}' accepted`));
                this.closeConnection();
            } catch (error) {
                console.log(chalk.green(`\n✓ Origin '${origin || 'none'}' rejected`));
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
        }

        if (results.length === 0) {
            console.log(chalk.green('\n✓ All malicious origins properly rejected'));
        }

        return results;
    }

    async testMessageInjection(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Message Injection...'));
        const results = [];

        const payloads = [
            '<script>alert("XSS")</script>',
            '"><script>alert("XSS")</script>',
            '<img src=x onerror=alert(1)>',
            "' OR '1'='1",
            '" OR "1"="1',
            '1; DROP TABLE users--',
            '../../../etc/passwd',
            '${7*7}',
            '{{7*7}}',
            '<%=7*7%>',
            '{{constructor.constructor("alert(1)")()}}',
            JSON.stringify({ __proto__: { admin: true } }),
            JSON.stringify({ constructor: { prototype: { admin: true } } }),
            '{"$ne": null}',
            '\x00\x00\x00\x00',
        ];

        try {
            await this.connect(targetUrl);
            console.log(chalk.green('\n✓ Connected to WebSocket'));

            for (let i = 0; i < payloads.length; i++) {
                const payload = payloads[i];
                process.stdout.write(`\r${chalk.cyan(`Testing payload ${i + 1}/${payloads.length}...`)}`);

                const sent = await this.sendMessage(payload);

                if (sent) {
                    const response = await this.waitForMessage(2000);

                    if (response) {
                        const responseStr = response.data.toString();
                        const isReflected = responseStr.includes(payload) ||
                            responseStr.includes(payload.replace(/[<>'"]/g, ''));

                        if (isReflected) {
                            results.push({
                                payload,
                                reflected: true,
                                response: responseStr,
                                vulnerability: {
                                    type: 'MESSAGE_INJECTION',
                                    severity: 'HIGH',
                                    description: 'Payload reflected in WebSocket response without sanitization',
                                },
                            });

                            console.log(chalk.red(`\n✗ VULNERABILITY: Payload reflected`));
                            console.log(chalk.gray(`Payload: ${payload.substring(0, 50)}...`));
                        }
                    }
                }

                await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
            }

            this.closeConnection();

            if (results.length === 0) {
                console.log(chalk.green('\n\n✓ No message injection vulnerabilities detected'));
            }

        } catch (error) {
            console.log(chalk.red(`\n✗ Error during testing: ${error.message}`));
        }

        return results;
    }

    async testCSRF(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing CSRF Protection...'));
        const results = [];

        const testScenarios = [
            { name: 'No Authentication', headers: {} },
            { name: 'No CSRF Token', headers: { cookie: 'session=test123' } },
            { name: 'Invalid Token', headers: { 'x-csrf-token': 'invalid' } },
        ];

        for (let i = 0; i < testScenarios.length; i++) {
            const scenario = testScenarios[i];
            process.stdout.write(`\r${chalk.cyan(`Testing ${scenario.name}...`)}`);

            try {
                await this.connect(targetUrl, { headers: scenario.headers });

                const testMessage = JSON.stringify({
                    action: 'sensitive_operation',
                    data: 'test',
                });

                await this.sendMessage(testMessage);
                const response = await this.waitForMessage(2000);

                if (response && !response.data.includes('unauthorized') && !response.data.includes('forbidden')) {
                    results.push({
                        scenario: scenario.name,
                        vulnerable: true,
                        vulnerability: {
                            type: 'CSRF_VULNERABILITY',
                            severity: 'HIGH',
                            description: `WebSocket accepts sensitive operations without proper CSRF protection: ${scenario.name}`,
                        },
                    });

                    console.log(chalk.red(`\n✗ VULNERABILITY: ${scenario.name}`));
                } else {
                    console.log(chalk.green(`\n✓ ${scenario.name} properly blocked`));
                }

                this.closeConnection();
            } catch (error) {
                console.log(chalk.green(`\n✓ ${scenario.name} connection rejected`));
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
        }

        return results;
    }

    async testRateLimiting(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Rate Limiting...'));
        const results = {
            messagesAllowed: 0,
            rateLimitDetected: false,
            vulnerability: null,
        };

        try {
            await this.connect(targetUrl);
            console.log(chalk.green('\n✓ Connected to WebSocket'));

            const testMessage = 'rate_limit_test';
            const maxMessages = this.config.rateLimitTest?.maxMessages || 100;
            const interval = this.config.rateLimitTest?.interval || 10;

            for (let i = 0; i < maxMessages; i++) {
                process.stdout.write(`\r${chalk.cyan(`Sending message ${i + 1}/${maxMessages}...`)}`);

                const sent = await this.sendMessage(testMessage);

                if (!sent) {
                    results.rateLimitDetected = true;
                    results.messagesAllowed = i;
                    console.log(chalk.green(`\n\n✓ Rate limiting detected after ${i} messages`));
                    break;
                }

                results.messagesAllowed = i + 1;

                if (interval > 0) {
                    await new Promise(resolve => setTimeout(resolve, interval));
                }
            }

            if (!results.rateLimitDetected) {
                results.vulnerability = {
                    type: 'NO_RATE_LIMITING',
                    severity: 'MEDIUM',
                    description: `Server accepted ${results.messagesAllowed} messages without rate limiting`,
                };
                console.log(chalk.red(`\n\n✗ VULNERABILITY: No rate limiting detected (${results.messagesAllowed}+ messages allowed)`));
            }

            this.closeConnection();

        } catch (error) {
            console.log(chalk.red(`\n✗ Error during testing: ${error.message}`));
        }

        return results;
    }

    async testAuthenticationBypass(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Authentication Bypass...'));
        const results = [];

        const bypassAttempts = [
            { name: 'No Token', headers: {} },
            { name: 'Invalid Token', headers: { authorization: 'Bearer invalid_token' } },
            { name: 'Expired Token', headers: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid' } },
            { name: 'Malformed Token', headers: { authorization: 'Bearer malformed' } },
            { name: 'None Algorithm', headers: { authorization: 'Bearer eyJhbGciOiJub25lIn0.e30.' } },
        ];

        for (let i = 0; i < bypassAttempts.length; i++) {
            const attempt = bypassAttempts[i];
            process.stdout.write(`\r${chalk.cyan(`Testing ${attempt.name}...`)}`);

            try {
                await this.connect(targetUrl, { headers: attempt.headers });

                const testMessage = JSON.stringify({ action: 'get_data' });
                await this.sendMessage(testMessage);
                const response = await this.waitForMessage(2000);

                if (response) {
                    results.push({
                        attempt: attempt.name,
                        bypassed: true,
                        vulnerability: {
                            type: 'AUTHENTICATION_BYPASS',
                            severity: 'CRITICAL',
                            description: `WebSocket accepts unauthenticated connections: ${attempt.name}`,
                        },
                    });

                    console.log(chalk.red(`\n✗ VULNERABILITY: ${attempt.name} bypassed authentication`));
                }

                this.closeConnection();
            } catch (error) {
                console.log(chalk.green(`\n✓ ${attempt.name} properly rejected`));
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
        }

        if (results.length === 0) {
            console.log(chalk.green('\n✓ All authentication bypass attempts blocked'));
        }

        return results;
    }

    async testDenialOfService(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Denial of Service...'));
        const results = {
            largeMessageAccepted: false,
            rapidMessagesAccepted: 0,
            connectionFlooding: false,
            vulnerabilities: [],
        };

        try {
            await this.connect(targetUrl);
            console.log(chalk.green('\n✓ Connected to WebSocket'));

            const largeMessage = 'A'.repeat(1024 * 1024 * 10);
            process.stdout.write(chalk.cyan('\nTesting large message (10MB)...'));

            const sent = await this.sendMessage(largeMessage);
            if (sent) {
                results.largeMessageAccepted = true;
                results.vulnerabilities.push({
                    type: 'LARGE_MESSAGE_DOS',
                    severity: 'MEDIUM',
                    description: 'Server accepts very large messages without size limits',
                });
                console.log(chalk.red('\n✗ VULNERABILITY: Large message accepted'));
            } else {
                console.log(chalk.green('\n✓ Large message rejected'));
            }

            this.closeConnection();

            const connections = [];
            process.stdout.write(chalk.cyan('\nTesting connection flooding...'));

            for (let i = 0; i < 10; i++) {
                try {
                    const ws = new WebSocket(targetUrl);
                    connections.push(ws);
                    await new Promise(resolve => setTimeout(resolve, 10));
                } catch (error) {
                    break;
                }
            }

            if (connections.length >= 10) {
                results.connectionFlooding = true;
                results.vulnerabilities.push({
                    type: 'CONNECTION_FLOODING',
                    severity: 'MEDIUM',
                    description: 'Server allows multiple rapid connections from same client',
                });
                console.log(chalk.red(`\n✗ VULNERABILITY: ${connections.length} rapid connections allowed`));
            } else {
                console.log(chalk.green(`\n✓ Connection flooding prevented (${connections.length}/10)`));
            }

            connections.forEach(ws => ws.close());

        } catch (error) {
            console.log(chalk.red(`\n✗ Error during testing: ${error.message}`));
        }

        if (results.vulnerabilities.length === 0) {
            console.log(chalk.green('\n✓ No DoS vulnerabilities detected'));
        }

        return results;
    }

    async run() {
        console.log(chalk.bold.cyan('\n🔌 WebSocket Security Tester Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target: ${this.config.targetUrl}`));
        console.log(chalk.white(`Delay: ${this.config.delay || 500}ms`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        const allResults = {
            timestamp: new Date().toISOString(),
            targetUrl: this.config.targetUrl,
            tests: {},
        };

        if (this.config.testTypes.includes('connection') || this.config.testTypes.includes('all')) {
            allResults.tests.connectionSecurity = await this.testConnectionSecurity(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('origin') || this.config.testTypes.includes('all')) {
            allResults.tests.originValidation = await this.testOriginValidation(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('injection') || this.config.testTypes.includes('all')) {
            allResults.tests.messageInjection = await this.testMessageInjection(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('csrf') || this.config.testTypes.includes('all')) {
            allResults.tests.csrfProtection = await this.testCSRF(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('ratelimit') || this.config.testTypes.includes('all')) {
            allResults.tests.rateLimiting = await this.testRateLimiting(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('auth') || this.config.testTypes.includes('all')) {
            allResults.tests.authenticationBypass = await this.testAuthenticationBypass(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('dos') || this.config.testTypes.includes('all')) {
            allResults.tests.denialOfService = await this.testDenialOfService(this.config.targetUrl);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(chalk.bold.cyan('\n\n📊 Test Summary\n'));
        console.log(chalk.gray('='.repeat(60)));

        let totalVulnerabilities = 0;
        Object.entries(allResults.tests).forEach(([testName, results]) => {
            if (Array.isArray(results)) {
                const vulnCount = results.filter(r => r.vulnerability).length;
                totalVulnerabilities += vulnCount;
                if (vulnCount > 0) {
                    console.log(chalk.yellow(`\n${testName}: ${vulnCount} vulnerabilities`));
                }
            } else if (results.vulnerability || results.vulnerabilities) {
                const vulnCount = results.vulnerabilities ? results.vulnerabilities.length : 1;
                totalVulnerabilities += vulnCount;
                console.log(chalk.yellow(`\n${testName}: ${vulnCount} vulnerabilities`));
            }
        });

        if (totalVulnerabilities > 0) {
            console.log(chalk.red(`\n⚠️  Total Vulnerabilities Found: ${totalVulnerabilities}`));
        } else {
            console.log(chalk.green('\n✓ No vulnerabilities detected'));
            console.log(chalk.gray('WebSocket implementation appears secure'));
        }

        console.log(chalk.gray(`\nTime elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        allResults.summary = {
            totalVulnerabilities,
            timeElapsed: elapsed,
        };

        this.results.push(allResults);

        console.log(chalk.bold.green('\n✅ WebSocket Security Testing Complete!\n'));

        return allResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Test Type,Vulnerability Type,Severity,Description,Details'];

        this.results.forEach(result => {
            Object.entries(result.tests).forEach(([testName, testResults]) => {
                if (Array.isArray(testResults)) {
                    testResults.forEach(item => {
                        if (item.vulnerability) {
                            const details = item.payload || item.origin || item.scenario || item.attempt || '';
                            csvRows.push(
                                `${result.timestamp},${testName},${item.vulnerability.type},${item.vulnerability.severity},"${item.vulnerability.description}","${details}"`
                            );
                        }
                    });
                } else if (testResults.vulnerability) {
                    csvRows.push(
                        `${result.timestamp},${testName},${testResults.vulnerability.type},${testResults.vulnerability.severity},"${testResults.vulnerability.description}",""`
                    );
                } else if (testResults.vulnerabilities) {
                    testResults.vulnerabilities.forEach(vuln => {
                        csvRows.push(
                            `${result.timestamp},${testName},${vuln.type},${vuln.severity},"${vuln.description}",""`
                        );
                    });
                }
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = WebSocketTester;