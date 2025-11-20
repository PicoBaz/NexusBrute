const axios = require('axios');
const chalk = require('chalk');

class HeaderInjection {
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

    async makeRequest(url, headers, method = 'GET', data = null) {
        const config = {
            method,
            url,
            headers,
            validateStatus: () => true,
            timeout: 10000,
            maxRedirects: 0,
        };

        if (data && method !== 'GET') {
            config.data = data;
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
                headers: response.headers,
                data: response.data,
                redirectLocation: response.headers.location || null,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    detectVulnerability(response, payload) {
        const vulnerabilities = [];

        if (response.headers) {
            const headerString = JSON.stringify(response.headers).toLowerCase();

            if (payload.includes('\r\n') || payload.includes('\n')) {
                if (headerString.includes('injected') ||
                    headerString.includes('x-custom') ||
                    headerString.includes('set-cookie')) {
                    vulnerabilities.push({
                        type: 'CRLF_INJECTION',
                        severity: 'HIGH',
                        description: 'CRLF characters in payload reflected in response headers',
                    });
                }
            }

            if (payload.includes('example.com') || payload.includes('evil.com')) {
                if (response.headers.location &&
                    (response.headers.location.includes('example.com') ||
                        response.headers.location.includes('evil.com'))) {
                    vulnerabilities.push({
                        type: 'OPEN_REDIRECT',
                        severity: 'MEDIUM',
                        description: 'Redirect to external domain detected',
                    });
                }
            }
        }

        if (response.data) {
            const bodyString = typeof response.data === 'string' ?
                response.data : JSON.stringify(response.data);

            if (payload.includes('<script>') && bodyString.includes('<script>')) {
                vulnerabilities.push({
                    type: 'XSS_VIA_HEADER',
                    severity: 'CRITICAL',
                    description: 'Script tag from header reflected in response body',
                });
            }
        }

        if (response.status >= 500) {
            vulnerabilities.push({
                type: 'SERVER_ERROR',
                severity: 'LOW',
                description: 'Server error triggered by malicious header',
            });
        }

        return vulnerabilities;
    }

    async testCRLFInjection(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing CRLF Injection...'));

        const payloads = [
            '\r\nX-Injected: true',
            '\nX-Injected: true',
            '%0d%0aX-Injected: true',
            '%0aX-Injected: true',
            '\r\nSet-Cookie: injected=true',
            '%0d%0aSet-Cookie: injected=true',
            '\r\n\r\n<script>alert("XSS")</script>',
            '%0d%0a%0d%0a<script>alert("XSS")</script>',
            '\rX-Injected: true',
            '%0dX-Injected: true',
        ];

        const results = [];

        for (let i = 0; i < payloads.length; i++) {
            const payload = payloads[i];
            process.stdout.write(`\r${chalk.cyan(`Testing payload ${i + 1}/${payloads.length}...`)}`);

            const testHeaders = {
                'User-Agent': `Mozilla/5.0${payload}`,
                'X-Forwarded-For': `127.0.0.1${payload}`,
                'Referer': `https://example.com${payload}`,
            };

            const response = await this.makeRequest(targetUrl, testHeaders);

            if (response.success) {
                const vulnerabilities = this.detectVulnerability(response, payload);

                if (vulnerabilities.length > 0) {
                    results.push({
                        payload,
                        status: response.status,
                        vulnerabilities,
                        headers: response.headers,
                    });

                    console.log(chalk.red(`\n\n✗ VULNERABILITY FOUND!`));
                    console.log(chalk.gray(`Payload: ${payload}`));
                    vulnerabilities.forEach(vuln => {
                        console.log(chalk.yellow(`  - ${vuln.type}: ${vuln.description}`));
                    });
                }
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
        }

        if (results.length === 0) {
            console.log(chalk.green(`\n\n✓ No CRLF injection vulnerabilities detected`));
        }

        return results;
    }

    async testHostHeaderInjection(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Host Header Injection...'));

        const url = new URL(targetUrl);
        const originalHost = url.host;

        const payloads = [
            'evil.com',
            'evil.com:80',
            `${originalHost}.evil.com`,
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            `${originalHost}@evil.com`,
            `evil.com#${originalHost}`,
            `${originalHost}\r\nX-Injected: true`,
        ];

        const results = [];

        for (let i = 0; i < payloads.length; i++) {
            const payload = payloads[i];
            process.stdout.write(`\r${chalk.cyan(`Testing payload ${i + 1}/${payloads.length}...`)}`);

            const testHeaders = {
                'Host': payload,
                'User-Agent': 'Mozilla/5.0',
            };

            const response = await this.makeRequest(targetUrl, testHeaders);

            if (response.success) {
                const isVulnerable =
                    (response.data && typeof response.data === 'string' && response.data.includes(payload)) ||
                    (response.headers.location && response.headers.location.includes(payload)) ||
                    (response.status === 200 && payload !== originalHost);

                if (isVulnerable) {
                    results.push({
                        payload,
                        status: response.status,
                        vulnerability: {
                            type: 'HOST_HEADER_INJECTION',
                            severity: 'HIGH',
                            description: `Malicious host header '${payload}' was reflected or accepted`,
                        },
                        redirectLocation: response.redirectLocation,
                    });

                    console.log(chalk.red(`\n\n✗ VULNERABILITY FOUND!`));
                    console.log(chalk.gray(`Host: ${payload}`));
                    console.log(chalk.yellow(`  Status: ${response.status}`));
                }
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
        }

        if (results.length === 0) {
            console.log(chalk.green(`\n\n✓ No Host Header injection vulnerabilities detected`));
        }

        return results;
    }

    async testXForwardedForManipulation(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing X-Forwarded-For Manipulation...'));

        const payloads = [
            '127.0.0.1',
            'localhost',
            '0.0.0.0',
            '10.0.0.1',
            '192.168.1.1',
            '172.16.0.1',
            '8.8.8.8, 127.0.0.1',
            '127.0.0.1, 127.0.0.1',
            '<script>alert("XSS")</script>',
            "' OR '1'='1",
            '../../../etc/passwd',
        ];

        const results = [];

        for (let i = 0; i < payloads.length; i++) {
            const payload = payloads[i];
            process.stdout.write(`\r${chalk.cyan(`Testing payload ${i + 1}/${payloads.length}...`)}`);

            const testHeaders = {
                'X-Forwarded-For': payload,
                'X-Real-IP': payload,
                'X-Originating-IP': payload,
                'X-Remote-IP': payload,
                'X-Client-IP': payload,
                'User-Agent': 'Mozilla/5.0',
            };

            const response = await this.makeRequest(targetUrl, testHeaders);

            if (response.success && response.data) {
                const bodyString = typeof response.data === 'string' ?
                    response.data : JSON.stringify(response.data);

                if (bodyString.includes(payload)) {
                    results.push({
                        payload,
                        status: response.status,
                        vulnerability: {
                            type: 'XFF_REFLECTION',
                            severity: 'MEDIUM',
                            description: `X-Forwarded-For value '${payload}' reflected in response`,
                        },
                    });

                    console.log(chalk.red(`\n\n✗ VULNERABILITY FOUND!`));
                    console.log(chalk.gray(`X-Forwarded-For: ${payload}`));
                    console.log(chalk.yellow(`  Reflected in response body`));
                }
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
        }

        if (results.length === 0) {
            console.log(chalk.green(`\n\n✓ No X-Forwarded-For manipulation vulnerabilities detected`));
        }

        return results;
    }

    async testHeaderValueInjection(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Header Value Injection...'));

        const headers = [
            'Referer',
            'User-Agent',
            'Cookie',
            'Origin',
            'Accept-Language',
            'Accept-Encoding',
        ];

        const payloads = [
            '<script>alert(1)</script>',
            '"><script>alert(1)</script>',
            "' OR '1'='1",
            '../../../etc/passwd',
            '${7*7}',
            '{{7*7}}',
            '<img src=x onerror=alert(1)>',
        ];

        const results = [];
        let testCount = 0;
        const totalTests = headers.length * payloads.length;

        for (const header of headers) {
            for (const payload of payloads) {
                testCount++;
                process.stdout.write(`\r${chalk.cyan(`Testing ${testCount}/${totalTests}...`)}`);

                const testHeaders = {
                    [header]: payload,
                    'User-Agent': 'Mozilla/5.0',
                };

                const response = await this.makeRequest(targetUrl, testHeaders);

                if (response.success && response.data) {
                    const bodyString = typeof response.data === 'string' ?
                        response.data : JSON.stringify(response.data);

                    if (bodyString.includes(payload)) {
                        results.push({
                            header,
                            payload,
                            status: response.status,
                            vulnerability: {
                                type: 'HEADER_VALUE_INJECTION',
                                severity: 'MEDIUM',
                                description: `${header} header value reflected in response`,
                            },
                        });

                        console.log(chalk.red(`\n\n✗ VULNERABILITY FOUND!`));
                        console.log(chalk.gray(`Header: ${header}`));
                        console.log(chalk.gray(`Payload: ${payload}`));
                    }
                }

                await new Promise(resolve => setTimeout(resolve, this.config.delay || 500));
            }
        }

        if (results.length === 0) {
            console.log(chalk.green(`\n\n✓ No Header Value injection vulnerabilities detected`));
        }

        return results;
    }

    async run() {
        console.log(chalk.bold.cyan('\n🔬 Header Injection Tester Started\n'));
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

        if (this.config.testTypes.includes('crlf') || this.config.testTypes.includes('all')) {
            allResults.tests.crlfInjection = await this.testCRLFInjection(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('host') || this.config.testTypes.includes('all')) {
            allResults.tests.hostHeaderInjection = await this.testHostHeaderInjection(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('xff') || this.config.testTypes.includes('all')) {
            allResults.tests.xffManipulation = await this.testXForwardedForManipulation(this.config.targetUrl);
        }

        if (this.config.testTypes.includes('value') || this.config.testTypes.includes('all')) {
            allResults.tests.headerValueInjection = await this.testHeaderValueInjection(this.config.targetUrl);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(chalk.bold.cyan('\n\n📊 Test Summary\n'));
        console.log(chalk.gray('='.repeat(60)));

        const totalVulnerabilities = Object.values(allResults.tests).reduce(
            (sum, results) => sum + (Array.isArray(results) ? results.length : 0), 0
        );

        if (totalVulnerabilities > 0) {
            console.log(chalk.red(`\n⚠️  Total Vulnerabilities Found: ${totalVulnerabilities}`));

            Object.entries(allResults.tests).forEach(([testName, results]) => {
                if (Array.isArray(results) && results.length > 0) {
                    console.log(chalk.yellow(`\n${testName}: ${results.length} issues`));
                }
            });
        } else {
            console.log(chalk.green('\n✓ No vulnerabilities detected'));
            console.log(chalk.gray('Target appears to be secure against header injection attacks'));
        }

        console.log(chalk.gray(`\nTime elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        allResults.summary = {
            totalVulnerabilities,
            timeElapsed: elapsed,
        };

        this.results.push(allResults);

        console.log(chalk.bold.green('\n✅ Header Injection Testing Complete!\n'));

        return allResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Test Type,Vulnerability Type,Severity,Payload,Status,Description'];

        this.results.forEach(result => {
            Object.entries(result.tests).forEach(([testName, testResults]) => {
                if (Array.isArray(testResults)) {
                    testResults.forEach(item => {
                        const vuln = item.vulnerability || (item.vulnerabilities && item.vulnerabilities[0]);
                        if (vuln) {
                            csvRows.push(
                                `${result.timestamp},${testName},${vuln.type},${vuln.severity},"${item.payload}",${item.status},"${vuln.description}"`
                            );
                        }
                    });
                }
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = HeaderInjection;