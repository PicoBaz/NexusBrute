const dns = require('dns').promises;
const axios = require('axios');
const chalk = require('chalk');
const { URL } = require('url');

class SubdomainEnumerator {
    constructor(config) {
        this.config = config;
        this.results = [];
        this.foundSubdomains = new Set();
    }

    async resolveDNS(subdomain) {
        try {
            const addresses = await dns.resolve4(subdomain);
            return {
                subdomain,
                resolved: true,
                ips: addresses,
                type: 'A',
            };
        } catch (error) {
            try {
                const addresses = await dns.resolve6(subdomain);
                return {
                    subdomain,
                    resolved: true,
                    ips: addresses,
                    type: 'AAAA',
                };
            } catch (error) {
                return {
                    subdomain,
                    resolved: false,
                    error: error.code,
                };
            }
        }
    }

    async checkHTTP(subdomain) {
        const protocols = ['https://', 'http://'];

        for (const protocol of protocols) {
            try {
                const response = await axios.get(protocol + subdomain, {
                    timeout: 5000,
                    maxRedirects: 0,
                    validateStatus: () => true,
                });

                return {
                    accessible: true,
                    protocol,
                    status: response.status,
                    title: this.extractTitle(response.data),
                    server: response.headers.server || 'Unknown',
                };
            } catch (error) {
                continue;
            }
        }

        return { accessible: false };
    }

    extractTitle(html) {
        if (typeof html !== 'string') return null;
        const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return match ? match[1].trim() : null;
    }

    async checkCNAME(subdomain) {
        try {
            const records = await dns.resolveCname(subdomain);
            return {
                hasCNAME: true,
                records,
            };
        } catch (error) {
            return { hasCNAME: false };
        }
    }

    async checkMX(subdomain) {
        try {
            const records = await dns.resolveMx(subdomain);
            return {
                hasMX: true,
                records: records.map(r => ({ priority: r.priority, exchange: r.exchange })),
            };
        } catch (error) {
            return { hasMX: false };
        }
    }

    async checkTXT(subdomain) {
        try {
            const records = await dns.resolveTxt(subdomain);
            return {
                hasTXT: true,
                records: records.map(r => r.join('')),
            };
        } catch (error) {
            return { hasTXT: false };
        }
    }

    detectTakeover(cnameRecords) {
        const takeoverPatterns = [
            { service: 'GitHub Pages', pattern: /github\.io/i },
            { service: 'Heroku', pattern: /herokuapp\.com/i },
            { service: 'AWS S3', pattern: /s3.*amazonaws\.com/i },
            { service: 'Azure', pattern: /azurewebsites\.net/i },
            { service: 'Shopify', pattern: /myshopify\.com/i },
            { service: 'Tumblr', pattern: /tumblr\.com/i },
            { service: 'WordPress', pattern: /wordpress\.com/i },
            { service: 'Ghost', pattern: /ghost\.io/i },
            { service: 'Bitbucket', pattern: /bitbucket\.io/i },
            { service: 'Fastly', pattern: /fastly\.net/i },
        ];

        const vulnerabilities = [];

        if (cnameRecords && cnameRecords.hasCNAME) {
            for (const record of cnameRecords.records) {
                for (const pattern of takeoverPatterns) {
                    if (pattern.pattern.test(record)) {
                        vulnerabilities.push({
                            type: 'SUBDOMAIN_TAKEOVER',
                            severity: 'HIGH',
                            service: pattern.service,
                            cname: record,
                            description: `Potential subdomain takeover vulnerability via ${pattern.service}`,
                        });
                    }
                }
            }
        }

        return vulnerabilities;
    }

    async bruteforceSubdomains(domain, wordlist) {
        console.log(chalk.yellow('\n🔍 Bruteforcing Subdomains...'));
        const discovered = [];

        for (let i = 0; i < wordlist.length; i++) {
            const prefix = wordlist[i];
            const subdomain = `${prefix}.${domain}`;

            process.stdout.write(`\r${chalk.cyan(`Testing: ${i + 1}/${wordlist.length} - ${subdomain.padEnd(50)}`)}`);

            const dnsResult = await this.resolveDNS(subdomain);

            if (dnsResult.resolved) {
                this.foundSubdomains.add(subdomain);

                const httpCheck = await this.checkHTTP(subdomain);
                const cnameCheck = await this.checkCNAME(subdomain);
                const takeoverVulns = this.detectTakeover(cnameCheck);

                const result = {
                    subdomain,
                    ips: dnsResult.ips,
                    type: dnsResult.type,
                    http: httpCheck,
                    cname: cnameCheck,
                    vulnerabilities: takeoverVulns,
                };

                discovered.push(result);

                console.log(chalk.green(`\n✓ Found: ${subdomain} [${dnsResult.ips.join(', ')}]`));

                if (httpCheck.accessible) {
                    console.log(chalk.gray(`  HTTP: ${httpCheck.status} - ${httpCheck.title || 'No title'}`));
                }

                if (takeoverVulns.length > 0) {
                    console.log(chalk.red(`  ⚠️  Potential takeover: ${takeoverVulns[0].service}`));
                }
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay || 100));
        }

        console.log(chalk.green(`\n\n✓ Bruteforce complete: ${discovered.length} subdomains found`));
        return discovered;
    }

    async permutationScan(domain, baseSubdomains) {
        console.log(chalk.yellow('\n🔍 Performing Permutation Scan...'));
        const discovered = [];
        const permutations = ['-dev', '-staging', '-prod', '-test', '-uat', '-qa',
            'dev-', 'staging-', 'prod-', 'test-', 'uat-', 'qa-',
            '01', '02', '1', '2'];

        for (const base of baseSubdomains) {
            const baseName = base.split('.')[0];

            for (let i = 0; i < permutations.length; i++) {
                const permuted = `${baseName}${permutations[i]}.${domain}`;

                if (this.foundSubdomains.has(permuted)) continue;

                process.stdout.write(`\r${chalk.cyan(`Testing permutation: ${permuted.padEnd(50)}`)}`);

                const dnsResult = await this.resolveDNS(permuted);

                if (dnsResult.resolved) {
                    this.foundSubdomains.add(permuted);

                    const httpCheck = await this.checkHTTP(permuted);
                    const cnameCheck = await this.checkCNAME(permuted);

                    const result = {
                        subdomain: permuted,
                        ips: dnsResult.ips,
                        type: dnsResult.type,
                        http: httpCheck,
                        cname: cnameCheck,
                    };

                    discovered.push(result);
                    console.log(chalk.green(`\n✓ Found: ${permuted} [${dnsResult.ips.join(', ')}]`));
                }

                await new Promise(resolve => setTimeout(resolve, this.config.delay || 100));
            }
        }

        console.log(chalk.green(`\n\n✓ Permutation scan complete: ${discovered.length} additional subdomains found`));
        return discovered;
    }

    async checkWildcard(domain) {
        console.log(chalk.yellow('\n🔍 Checking for Wildcard DNS...'));

        const randomSubdomain = `random-${Math.random().toString(36).substring(7)}.${domain}`;
        const result = await this.resolveDNS(randomSubdomain);

        if (result.resolved) {
            console.log(chalk.yellow(`⚠️  Wildcard DNS detected: ${randomSubdomain} resolves to ${result.ips.join(', ')}`));
            return {
                hasWildcard: true,
                ips: result.ips,
                warning: 'Wildcard DNS may produce false positives',
            };
        }

        console.log(chalk.green('✓ No wildcard DNS detected'));
        return { hasWildcard: false };
    }

    async dnsZoneTransfer(domain) {
        console.log(chalk.yellow('\n🔍 Testing DNS Zone Transfer...'));

        try {
            const nsRecords = await dns.resolveNs(domain);
            console.log(chalk.gray(`Found ${nsRecords.length} nameservers: ${nsRecords.join(', ')}`));

            const vulnerabilities = [];

            for (const ns of nsRecords) {
                try {
                    const { spawn } = require('child_process');

                    const axfr = spawn('dig', ['@' + ns, domain, 'AXFR']);
                    let output = '';

                    axfr.stdout.on('data', (data) => {
                        output += data.toString();
                    });

                    await new Promise((resolve) => {
                        axfr.on('close', (code) => {
                            if (output.includes('Transfer failed') || output.includes('refused')) {
                                console.log(chalk.green(`✓ ${ns}: Zone transfer refused`));
                            } else if (output.length > 100) {
                                console.log(chalk.red(`✗ ${ns}: Zone transfer allowed!`));
                                vulnerabilities.push({
                                    type: 'ZONE_TRANSFER',
                                    severity: 'CRITICAL',
                                    nameserver: ns,
                                    description: 'DNS Zone Transfer is allowed',
                                });
                            }
                            resolve();
                        });
                    });

                } catch (error) {
                    console.log(chalk.gray(`✓ ${ns}: Zone transfer not possible`));
                }
            }

            return vulnerabilities;

        } catch (error) {
            console.log(chalk.gray('Could not retrieve nameservers'));
            return [];
        }
    }

    async certificateTransparency(domain) {
        console.log(chalk.yellow('\n🔍 Querying Certificate Transparency Logs...'));

        try {
            const response = await axios.get(`https://crt.sh/?q=%.${domain}&output=json`, {
                timeout: 15000,
            });

            if (!response.data || response.data.length === 0) {
                console.log(chalk.gray('No certificates found'));
                return [];
            }

            const subdomains = new Set();

            response.data.forEach(cert => {
                const names = cert.name_value.split('\n');
                names.forEach(name => {
                    name = name.trim().toLowerCase();
                    if (name.endsWith(domain) && !name.includes('*')) {
                        subdomains.add(name);
                    }
                });
            });

            const discovered = [];

            for (const subdomain of subdomains) {
                if (this.foundSubdomains.has(subdomain)) continue;

                process.stdout.write(`\r${chalk.cyan(`Verifying: ${subdomain.padEnd(50)}`)}`);

                const dnsResult = await this.resolveDNS(subdomain);

                if (dnsResult.resolved) {
                    this.foundSubdomains.add(subdomain);

                    const httpCheck = await this.checkHTTP(subdomain);

                    discovered.push({
                        subdomain,
                        ips: dnsResult.ips,
                        type: dnsResult.type,
                        http: httpCheck,
                        source: 'Certificate Transparency',
                    });

                    console.log(chalk.green(`\n✓ Found: ${subdomain} [${dnsResult.ips.join(', ')}]`));
                }

                await new Promise(resolve => setTimeout(resolve, this.config.delay || 100));
            }

            console.log(chalk.green(`\n✓ Certificate Transparency: ${discovered.length} subdomains found`));
            return discovered;

        } catch (error) {
            console.log(chalk.gray('Certificate Transparency query failed'));
            return [];
        }
    }

    async run() {
        console.log(chalk.bold.cyan('\n🌐 Subdomain Enumerator Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Target Domain: ${this.config.domain}`));
        console.log(chalk.white(`Delay: ${this.config.delay || 100}ms`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        const allResults = {
            timestamp: new Date().toISOString(),
            domain: this.config.domain,
            results: {},
        };

        if (this.config.checkWildcard !== false) {
            allResults.wildcardCheck = await this.checkWildcard(this.config.domain);
        }

        if (this.config.methods.includes('bruteforce') || this.config.methods.includes('all')) {
            const fs = require('fs');
            let wordlist = [];

            if (this.config.wordlistFile && fs.existsSync(this.config.wordlistFile)) {
                wordlist = fs.readFileSync(this.config.wordlistFile, 'utf-8')
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
            } else {
                wordlist = ['www', 'mail', 'ftp', 'admin', 'test', 'dev', 'staging', 'api', 'blog', 'shop'];
                console.log(chalk.yellow('Using default wordlist (10 common subdomains)'));
            }

            allResults.results.bruteforce = await this.bruteforceSubdomains(this.config.domain, wordlist);
        }

        if (this.config.methods.includes('crt') || this.config.methods.includes('all')) {
            allResults.results.certificateTransparency = await this.certificateTransparency(this.config.domain);
        }

        if (this.config.methods.includes('permutation') || this.config.methods.includes('all')) {
            const baseSubdomains = Array.from(this.foundSubdomains);
            if (baseSubdomains.length > 0) {
                allResults.results.permutation = await this.permutationScan(this.config.domain, baseSubdomains);
            }
        }

        if (this.config.methods.includes('zonetransfer') || this.config.methods.includes('all')) {
            allResults.results.zoneTransfer = await this.dnsZoneTransfer(this.config.domain);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(chalk.bold.cyan('\n\n📊 Enumeration Summary\n'));
        console.log(chalk.gray('='.repeat(60)));

        const totalSubdomains = this.foundSubdomains.size;
        console.log(chalk.green(`\n✓ Total Subdomains Found: ${totalSubdomains}`));

        if (totalSubdomains > 0) {
            console.log(chalk.cyan('\nDiscovered Subdomains:'));
            Array.from(this.foundSubdomains).sort().forEach(sub => {
                console.log(chalk.white(`  • ${sub}`));
            });
        }

        let totalVulnerabilities = 0;
        if (allResults.results.bruteforce) {
            allResults.results.bruteforce.forEach(r => {
                totalVulnerabilities += r.vulnerabilities?.length || 0;
            });
        }
        if (allResults.results.zoneTransfer) {
            totalVulnerabilities += allResults.results.zoneTransfer.length;
        }

        if (totalVulnerabilities > 0) {
            console.log(chalk.red(`\n⚠️  Total Vulnerabilities Found: ${totalVulnerabilities}`));
        }

        console.log(chalk.gray(`\nTime elapsed: ${elapsed}s`));
        console.log(chalk.gray('='.repeat(60)));

        allResults.summary = {
            totalSubdomains,
            totalVulnerabilities,
            timeElapsed: elapsed,
        };

        this.results.push(allResults);

        console.log(chalk.bold.green('\n✅ Subdomain Enumeration Complete!\n'));

        return allResults;
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Timestamp,Subdomain,IPs,Type,HTTP Status,Title,CNAME,Vulnerabilities'];

        this.results.forEach(result => {
            Object.values(result.results).forEach(methodResults => {
                if (Array.isArray(methodResults)) {
                    methodResults.forEach(item => {
                        const ips = item.ips?.join(';') || '';
                        const httpStatus = item.http?.status || '';
                        const title = item.http?.title || '';
                        const cname = item.cname?.records?.join(';') || '';
                        const vulns = item.vulnerabilities?.map(v => v.type).join(';') || '';

                        csvRows.push(
                            `${result.timestamp},"${item.subdomain}","${ips}",${item.type},${httpStatus},"${title}","${cname}","${vulns}"`
                        );
                    });
                }
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = SubdomainEnumerator;