const https = require('https');
const tls = require('tls');
const chalk = require('chalk');
const { URL } = require('url');

class SSLAnalyzer {
    constructor(config) {
        this.config = config;
        this.results = [];
    }

    parseTarget(target) {
        try {
            const url = new URL(target.startsWith('http') ? target : `https://${target}`);
            return {
                hostname: url.hostname,
                port: url.port || 443,
            };
        } catch (error) {
            return {
                hostname: target.replace(/:\d+$/, ''),
                port: target.includes(':') ? parseInt(target.split(':')[1]) : 443,
            };
        }
    }

    async getCertificateInfo(hostname, port) {
        return new Promise((resolve, reject) => {
            const socket = tls.connect(port, hostname, {
                servername: hostname,
                rejectUnauthorized: false,
            }, () => {
                const cert = socket.getPeerCertificate(true);
                const protocol = socket.getProtocol();
                const cipher = socket.getCipher();

                socket.end();

                resolve({
                    certificate: cert,
                    protocol,
                    cipher,
                });
            });

            socket.on('error', (error) => {
                reject(error);
            });

            socket.setTimeout(10000, () => {
                socket.destroy();
                reject(new Error('Connection timeout'));
            });
        });
    }

    async testProtocolSupport(hostname, port) {
        console.log(chalk.yellow('\n🔍 Testing SSL/TLS Protocol Support...'));

        const protocols = [
            { name: 'SSLv3', version: 'SSLv3', secure: false },
            { name: 'TLSv1.0', version: 'TLSv1', secure: false },
            { name: 'TLSv1.1', version: 'TLSv1.1', secure: false },
            { name: 'TLSv1.2', version: 'TLSv1.2', secure: true },
            { name: 'TLSv1.3', version: 'TLSv1.3', secure: true },
        ];

        const results = [];

        for (const protocol of protocols) {
            process.stdout.write(`\r${chalk.cyan(`Testing ${protocol.name}...`.padEnd(50))}`);

            try {
                await new Promise((resolve, reject) => {
                    const socket = tls.connect(port, hostname, {
                        servername: hostname,
                        minVersion: protocol.version,
                        maxVersion: protocol.version,
                        rejectUnauthorized: false,
                    }, () => {
                        socket.end();
                        resolve();
                    });

                    socket.on('error', reject);
                    socket.setTimeout(5000, () => {
                        socket.destroy();
                        reject(new Error('Timeout'));
                    });
                });

                results.push({
                    protocol: protocol.name,
                    supported: true,
                    secure: protocol.secure,
                    vulnerability: !protocol.secure ? {
                        type: 'INSECURE_PROTOCOL',
                        severity: protocol.name === 'SSLv3' ? 'CRITICAL' : 'HIGH',
                        description: `${protocol.name} is supported - considered insecure and deprecated`,
                    } : null,
                });

                console.log(chalk.red(`\n✗ ${protocol.name} supported ${!protocol.secure ? '(INSECURE)' : ''}`));
            } catch (error) {
                console.log(chalk.green(`\n✓ ${protocol.name} not supported`));
            }
        }

        return results;
    }

    async testCipherSuites(hostname, port) {
        console.log(chalk.yellow('\n\n🔍 Testing Cipher Suites...'));

        const weakCiphers = [
            'RC4', 'DES', '3DES', 'MD5', 'NULL', 'EXPORT', 'anon',
        ];

        try {
            const socket = tls.connect(port, hostname, {
                servername: hostname,
                rejectUnauthorized: false,
            });

            const cipher = await new Promise((resolve, reject) => {
                socket.on('secureConnect', () => {
                    const c = socket.getCipher();
                    socket.end();
                    resolve(c);
                });

                socket.on('error', reject);
                socket.setTimeout(5000, () => {
                    socket.destroy();
                    reject(new Error('Timeout'));
                });
            });

            console.log(chalk.cyan(`\nNegotiated Cipher: ${cipher.name}`));
            console.log(chalk.gray(`  Version: ${cipher.version}`));
            console.log(chalk.gray(`  Bits: ${cipher.bits || 'Unknown'}`));

            const isWeak = weakCiphers.some(weak =>
                cipher.name.toUpperCase().includes(weak.toUpperCase())
            );

            const result = {
                cipher: cipher.name,
                version: cipher.version,
                bits: cipher.bits,
                isWeak,
                vulnerability: isWeak ? {
                    type: 'WEAK_CIPHER',
                    severity: 'HIGH',
                    description: `Weak cipher suite detected: ${cipher.name}`,
                } : null,
            };

            if (isWeak) {
                console.log(chalk.red(`⚠️  Weak cipher detected!`));
            } else {
                console.log(chalk.green(`✓ Cipher appears secure`));
            }

            return result;
        } catch (error) {
            console.log(chalk.red(`✗ Error testing ciphers: ${error.message}`));
            return { error: error.message };
        }
    }

    analyzeCertificate(cert) {
        console.log(chalk.yellow('\n🔍 Analyzing Certificate...'));

        const vulnerabilities = [];
        const warnings = [];

        console.log(chalk.cyan('\nCertificate Details:'));
        console.log(chalk.white(`  Subject: ${cert.subject?.CN || 'Unknown'}`));
        console.log(chalk.white(`  Issuer: ${cert.issuer?.CN || 'Unknown'}`));
        console.log(chalk.white(`  Valid From: ${cert.valid_from}`));
        console.log(chalk.white(`  Valid To: ${cert.valid_to}`));

        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const now = new Date();

        if (now < validFrom) {
            vulnerabilities.push({
                type: 'CERTIFICATE_NOT_YET_VALID',
                severity: 'HIGH',
                description: 'Certificate is not yet valid',
            });
            console.log(chalk.red('\n✗ Certificate not yet valid'));
        } else if (now > validTo) {
            vulnerabilities.push({
                type: 'CERTIFICATE_EXPIRED',
                severity: 'CRITICAL',
                description: 'Certificate has expired',
            });
            console.log(chalk.red('\n✗ Certificate expired'));
        } else {
            const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));
            console.log(chalk.green(`\n✓ Certificate valid (${daysUntilExpiry} days remaining)`));

            if (daysUntilExpiry < 30) {
                warnings.push({
                    type: 'CERTIFICATE_EXPIRING_SOON',
                    severity: 'MEDIUM',
                    description: `Certificate expires in ${daysUntilExpiry} days`,
                });
                console.log(chalk.yellow(`⚠️  Certificate expiring soon`));
            }
        }

        if (cert.issuer && cert.subject) {
            if (cert.issuer.CN === cert.subject.CN) {
                vulnerabilities.push({
                    type: 'SELF_SIGNED_CERTIFICATE',
                    severity: 'HIGH',
                    description: 'Certificate is self-signed',
                });
                console.log(chalk.red('✗ Self-signed certificate detected'));
            }
        }

        const keySize = cert.bits || 0;
        if (keySize > 0 && keySize < 2048) {
            vulnerabilities.push({
                type: 'WEAK_KEY_SIZE',
                severity: 'HIGH',
                description: `Key size is ${keySize} bits (minimum 2048 recommended)`,
            });
            console.log(chalk.red(`✗ Weak key size: ${keySize} bits`));
        } else if (keySize >= 2048) {
            console.log(chalk.green(`✓ Key size: ${keySize} bits`));
        }

        if (cert.subjectaltname) {
            console.log(chalk.cyan(`\nSubject Alternative Names:`));
            const sans = cert.subjectaltname.split(', ').map(san => san.replace('DNS:', ''));
            sans.slice(0, 5).forEach(san => console.log(chalk.white(`  • ${san}`)));
            if (sans.length > 5) {
                console.log(chalk.gray(`  ... and ${sans.length - 5} more`));
            }
        }

        const signatureAlgorithm = cert.sigalg || '';
        if (signatureAlgorithm.toLowerCase().includes('sha1')) {
            vulnerabilities.push({
                type: 'WEAK_SIGNATURE_ALGORITHM',
                severity: 'MEDIUM',
                description: `Weak signature algorithm: ${signatureAlgorithm}`,
            });
            console.log(chalk.red(`✗ Weak signature algorithm: ${signatureAlgorithm}`));
        } else if (signatureAlgorithm) {
            console.log(chalk.green(`✓ Signature algorithm: ${signatureAlgorithm}`));
        }

        return {
            subject: cert.subject?.CN,
            issuer: cert.issuer?.CN,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            keySize: keySize,
            signatureAlgorithm: signatureAlgorithm,
            subjectAltNames: cert.subjectaltname?.split(', '),
            serialNumber: cert.serialNumber,
            fingerprint: cert.fingerprint,
            vulnerabilities,
            warnings,
        };
    }

    async testCertificateChain(hostname, port) {
        console.log(chalk.yellow('\n🔍 Testing Certificate Chain...'));

        try {
            const socket = tls.connect(port, hostname, {
                servername: hostname,
                rejectUnauthorized: false,
            });

            const chain = await new Promise((resolve, reject) => {
                socket.on('secureConnect', () => {
                    const cert = socket.getPeerCertificate(true);
                    const chainCerts = [];

                    let current = cert;
                    while (current && current.issuerCertificate) {
                        chainCerts.push({
                            subject: current.subject?.CN,
                            issuer: current.issuer?.CN,
                        });

                        if (current === current.issuerCertificate) break;
                        current = current.issuerCertificate;
                    }

                    socket.end();
                    resolve(chainCerts);
                });

                socket.on('error', reject);
                socket.setTimeout(5000, () => {
                    socket.destroy();
                    reject(new Error('Timeout'));
                });
            });

            console.log(chalk.cyan(`\nCertificate Chain (${chain.length} certificates):`));
            chain.forEach((cert, index) => {
                console.log(chalk.white(`  ${index + 1}. ${cert.subject}`));
                console.log(chalk.gray(`     Issued by: ${cert.issuer}`));
            });

            const vulnerabilities = [];

            if (chain.length < 2) {
                vulnerabilities.push({
                    type: 'INCOMPLETE_CERTIFICATE_CHAIN',
                    severity: 'MEDIUM',
                    description: 'Certificate chain appears incomplete',
                });
                console.log(chalk.yellow('\n⚠️  Certificate chain may be incomplete'));
            } else {
                console.log(chalk.green('\n✓ Certificate chain appears valid'));
            }

            return {
                chainLength: chain.length,
                chain,
                vulnerabilities,
            };
        } catch (error) {
            console.log(chalk.red(`✗ Error testing chain: ${error.message}`));
            return { error: error.message };
        }
    }

    async testHTTPSRedirect(hostname) {
        console.log(chalk.yellow('\n🔍 Testing HTTP to HTTPS Redirect...'));

        try {
            const http = require('http');

            const response = await new Promise((resolve, reject) => {
                const req = http.get(`http://${hostname}`, {
                    timeout: 5000,
                }, (res) => {
                    resolve({
                        statusCode: res.statusCode,
                        location: res.headers.location,
                    });
                });

                req.on('error', reject);
                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
            });

            if (response.statusCode >= 300 && response.statusCode < 400) {
                if (response.location && response.location.startsWith('https://')) {
                    console.log(chalk.green('✓ HTTP redirects to HTTPS'));
                    return {
                        redirects: true,
                        statusCode: response.statusCode,
                        location: response.location,
                    };
                }
            }

            console.log(chalk.red('✗ HTTP does not redirect to HTTPS'));
            return {
                redirects: false,
                vulnerability: {
                    type: 'NO_HTTPS_REDIRECT',
                    severity: 'MEDIUM',
                    description: 'HTTP traffic is not redirected to HTTPS',
                },
            };
        } catch (error) {
            console.log(chalk.gray(`✗ Could not test HTTP redirect: ${error.message}`));
            return { error: error.message };
        }
    }

    async testHSTS(hostname, port) {
        console.log(chalk.yellow('\n🔍 Testing HSTS (HTTP Strict Transport Security)...'));

        try {
            const response = await new Promise((resolve, reject) => {
                const req = https.get(`https://${hostname}:${port}`, {
                    rejectUnauthorized: false,
                }, (res) => {
                    resolve({
                        headers: res.headers,
                    });
                });

                req.on('error', reject);
                req.setTimeout(5000, () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
            });

            const hstsHeader = response.headers['strict-transport-security'];

            if (hstsHeader) {
                console.log(chalk.green('✓ HSTS header present'));
                console.log(chalk.gray(`  ${hstsHeader}`));

                const maxAge = hstsHeader.match(/max-age=(\d+)/);
                const includeSubDomains = hstsHeader.includes('includeSubDomains');
                const preload = hstsHeader.includes('preload');

                const warnings = [];

                if (maxAge && parseInt(maxAge[1]) < 31536000) {
                    warnings.push({
                        type: 'HSTS_SHORT_DURATION',
                        severity: 'LOW',
                        description: 'HSTS max-age is less than 1 year (recommended: 31536000)',
                    });
                    console.log(chalk.yellow('⚠️  HSTS max-age is less than 1 year'));
                }

                if (!includeSubDomains) {
                    warnings.push({
                        type: 'HSTS_NO_SUBDOMAINS',
                        severity: 'LOW',
                        description: 'HSTS does not include subdomains',
                    });
                    console.log(chalk.yellow('⚠️  HSTS does not cover subdomains'));
                }

                return {
                    enabled: true,
                    header: hstsHeader,
                    maxAge: maxAge ? parseInt(maxAge[1]) : null,
                    includeSubDomains,
                    preload,
                    warnings,
                };
            } else {
                console.log(chalk.red('✗ HSTS header not present'));
                return {
                    enabled: false,
                    vulnerability: {
                        type: 'NO_HSTS',
                        severity: 'MEDIUM',
                        description: 'HSTS header is not configured',
                    },
                };
            }
        } catch (error) {
            console.log(chalk.red(`✗ Error testing HSTS: ${error.message}`));
            return { error: error.message };
        }
    }

    async run() {
        console.log(chalk.bold.cyan('\n🔒 SSL/TLS Analyzer Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target: ${this.config.target}`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        const { hostname, port } = this.parseTarget(this.config.target);

        const allResults = {
            timestamp: new Date().toISOString(),
            target: this.config.target,
            hostname,
            port,
            tests: {},
        };

        try {
            const { certificate, protocol, cipher } = await this.getCertificateInfo(hostname, port);

            console.log(chalk.green(`\n✓ Successfully connected to ${hostname}:${port}`));
            console.log(chalk.cyan(`  Protocol: ${protocol}`));
            console.log(chalk.cyan(`  Cipher: ${cipher.name}\n`));

            allResults.tests.certificateAnalysis = this.analyzeCertificate(certificate);
            allResults.tests.protocolSupport = await this.testProtocolSupport(hostname, port);
            allResults.tests.cipherSuite = await this.testCipherSuites(hostname, port);
            allResults.tests.certificateChain = await this.testCertificateChain(hostname, port);
            allResults.tests.httpsRedirect = await this.testHTTPSRedirect(hostname);
            allResults.tests.hsts = await this.testHSTS(hostname, port);

        } catch (error) {
            console.log(chalk.red(`\n✗ Failed to connect: ${error.message}`));
            allResults.error = error.message;
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(chalk.bold.cyan('\n\n📊 SSL/TLS Analysis Summary\n'));
        console.log(chalk.gray('='.repeat(60)));

        let totalVulnerabilities = 0;
        let totalWarnings = 0;

        Object.values(allResults.tests).forEach(test => {
            if (test.vulnerabilities) {
                totalVulnerabilities += test.vulnerabilities.length;
            }
            if (test.vulnerability) {
                totalVulnerabilities += 1;
            }
            if (test.warnings) {
                totalWarnings += test.warnings.length;
            }
            if (Array.isArray(test)) {
                test.forEach(item => {
                    if (item.vulnerability) totalVulnerabilities += 1;
                });
            }
        });

        if (totalVulnerabilities > 0) {
            console.log(chalk.red(`\n⚠️  Vulnerabilities Found: ${totalVulnerabilities}`));
        } else {
            console.log(chalk.green('\n✓ No critical vulnerabilities detected'));
        }

        if (totalWarnings > 0) {
            console.log(chalk.yellow(`⚠️  Warnings: ${totalWarnings}`));
        }

        console.log(chalk.gray(`\nTime elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        allResults.summary = {
            totalVulnerabilities,
            totalWarnings,
            timeElapsed: elapsed,
        };

        this.results.push(allResults);

        console.log(chalk.bold.green('\n✅ SSL/TLS Analysis Complete!\n'));

        return allResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Target,Test Type,Issue,Severity,Description'];

        this.results.forEach(result => {
            Object.entries(result.tests).forEach(([testName, testResult]) => {
                if (testResult.vulnerability) {
                    csvRows.push(
                        `${result.timestamp},"${result.target}","${testName}","${testResult.vulnerability.type}","${testResult.vulnerability.severity}","${testResult.vulnerability.description}"`
                    );
                }
                if (testResult.vulnerabilities) {
                    testResult.vulnerabilities.forEach(vuln => {
                        csvRows.push(
                            `${result.timestamp},"${result.target}","${testName}","${vuln.type}","${vuln.severity}","${vuln.description}"`
                        );
                    });
                }
                if (Array.isArray(testResult)) {
                    testResult.forEach(item => {
                        if (item.vulnerability) {
                            csvRows.push(
                                `${result.timestamp},"${result.target}","${testName}","${item.vulnerability.type}","${item.vulnerability.severity}","${item.vulnerability.description}"`
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

module.exports = SSLAnalyzer;