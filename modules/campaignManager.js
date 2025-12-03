const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class CampaignManager {
    constructor(config) {
        this.config = config;
        this.results = [];
        this.campaignStartTime = Date.now();
        this.availableModules = {
            smartBrute: require('./smartBrute'),
            jwtAnalyzer: require('./jwtAnalyzer'),
            headerInjection: require('./headerInjection'),
            websocketTester: require('./websocketTester'),
            subdomainEnumerator: require('./subdomainEnumerator'),
            sqlInjection: require('./sqlInjection'),
            apiFuzzer: require('./apiFuzzer'),
        };
    }

    async loadTargets() {
        if (this.config.targetsFile && fs.existsSync(this.config.targetsFile)) {
            const content = fs.readFileSync(this.config.targetsFile, 'utf-8');
            return JSON.parse(content);
        }
        return this.config.targets || [];
    }

    async runModuleOnTarget(moduleName, moduleConfig, targetInfo) {
        try {
            const Module = this.availableModules[moduleName];
            if (!Module) {
                return {
                    success: false,
                    error: `Module ${moduleName} not found`,
                };
            }

            const config = { ...moduleConfig, ...targetInfo.config };
            const module = new Module(config);

            const startTime = Date.now();
            const result = await module.run();
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

            return {
                success: true,
                module: moduleName,
                target: targetInfo.name || targetInfo.target,
                result,
                timeElapsed: elapsed,
            };
        } catch (error) {
            return {
                success: false,
                module: moduleName,
                target: targetInfo.name || targetInfo.target,
                error: error.message,
            };
        }
    }

    async executeCampaign() {
        console.log(chalk.bold.cyan('\n🎯 Multi-Target Campaign Manager Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Campaign: ${this.config.campaignName || 'Unnamed Campaign'}`));
        console.log(chalk.white(`Mode: ${this.config.mode || 'sequential'}`));
        console.log(chalk.gray('='.repeat(60)));

        const targets = await this.loadTargets();
        const modules = this.config.modules || [];

        if (targets.length === 0) {
            console.log(chalk.red('\n❌ No targets configured'));
            return { success: false, error: 'No targets' };
        }

        if (modules.length === 0) {
            console.log(chalk.red('\n❌ No modules configured'));
            return { success: false, error: 'No modules' };
        }

        console.log(chalk.yellow(`\n📊 Campaign Overview:`));
        console.log(chalk.white(`  Targets: ${targets.length}`));
        console.log(chalk.white(`  Modules: ${modules.length}`));
        console.log(chalk.white(`  Total Operations: ${targets.length * modules.length}\n`));

        const campaignResults = {
            campaignName: this.config.campaignName,
            startTime: new Date().toISOString(),
            mode: this.config.mode,
            targets: [],
            summary: {
                totalTargets: targets.length,
                totalModules: modules.length,
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 0,
            },
        };

        if (this.config.mode === 'parallel') {
            await this.runParallelCampaign(targets, modules, campaignResults);
        } else {
            await this.runSequentialCampaign(targets, modules, campaignResults);
        }

        const totalElapsed = ((Date.now() - this.campaignStartTime) / 1000).toFixed(2);
        campaignResults.endTime = new Date().toISOString();
        campaignResults.totalElapsed = totalElapsed;

        this.displaySummary(campaignResults);
        this.results.push(campaignResults);

        return campaignResults;
    }

    async runSequentialCampaign(targets, modules, campaignResults) {
        console.log(chalk.yellow('\n🔄 Running Sequential Campaign...\n'));

        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            const targetName = target.name || target.target || `Target ${i + 1}`;

            console.log(chalk.bold.cyan(`\n[${ i + 1}/${targets.length}] Processing: ${targetName}`));
            console.log(chalk.gray('-'.repeat(60)));

            const targetResults = {
                target: targetName,
                modules: [],
                vulnerabilities: 0,
                status: 'pending',
            };

            for (let j = 0; j < modules.length; j++) {
                const moduleConfig = modules[j];
                const moduleName = moduleConfig.name;

                process.stdout.write(chalk.cyan(`  [${j + 1}/${modules.length}] Running ${moduleName}... `));

                const result = await this.runModuleOnTarget(
                    moduleName,
                    moduleConfig.config || {},
                    target
                );

                campaignResults.summary.totalOperations++;

                if (result.success) {
                    campaignResults.summary.successfulOperations++;
                    console.log(chalk.green('✓'));

                    const vulnCount = this.extractVulnerabilityCount(result.result);
                    targetResults.vulnerabilities += vulnCount;

                    if (vulnCount > 0) {
                        console.log(chalk.yellow(`    Found ${vulnCount} vulnerabilities`));
                    }
                } else {
                    campaignResults.summary.failedOperations++;
                    console.log(chalk.red('✗'));
                    console.log(chalk.red(`    Error: ${result.error}`));
                }

                targetResults.modules.push(result);

                if (this.config.delayBetweenModules) {
                    await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenModules));
                }
            }

            targetResults.status = 'completed';
            campaignResults.targets.push(targetResults);

            if (this.config.delayBetweenTargets && i < targets.length - 1) {
                console.log(chalk.gray(`\nWaiting ${this.config.delayBetweenTargets}ms before next target...`));
                await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenTargets));
            }
        }
    }

    async runParallelCampaign(targets, modules, campaignResults) {
        console.log(chalk.yellow('\n⚡ Running Parallel Campaign...\n'));

        const maxConcurrent = this.config.maxConcurrent || 3;
        const queue = [];

        for (const target of targets) {
            for (const moduleConfig of modules) {
                queue.push({ target, moduleConfig });
            }
        }

        const chunks = [];
        for (let i = 0; i < queue.length; i += maxConcurrent) {
            chunks.push(queue.slice(i, i + maxConcurrent));
        }

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(chalk.cyan(`\nBatch ${i + 1}/${chunks.length} (${chunk.length} operations)`));

            const promises = chunk.map(async ({ target, moduleConfig }) => {
                const targetName = target.name || target.target;
                const moduleName = moduleConfig.name;

                process.stdout.write(chalk.gray(`  ${targetName} - ${moduleName}... `));

                const result = await this.runModuleOnTarget(
                    moduleName,
                    moduleConfig.config || {},
                    target
                );

                campaignResults.summary.totalOperations++;

                if (result.success) {
                    campaignResults.summary.successfulOperations++;
                    console.log(chalk.green('✓'));
                } else {
                    campaignResults.summary.failedOperations++;
                    console.log(chalk.red('✗'));
                }

                return { target: targetName, result };
            });

            const batchResults = await Promise.all(promises);

            batchResults.forEach(({ target, result }) => {
                let targetEntry = campaignResults.targets.find(t => t.target === target);
                if (!targetEntry) {
                    targetEntry = {
                        target,
                        modules: [],
                        vulnerabilities: 0,
                        status: 'pending',
                    };
                    campaignResults.targets.push(targetEntry);
                }

                targetEntry.modules.push(result);
                targetEntry.vulnerabilities += this.extractVulnerabilityCount(result.result);
                targetEntry.status = 'completed';
            });

            if (this.config.delayBetweenBatches && i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenBatches));
            }
        }
    }

    extractVulnerabilityCount(result) {
        if (!result) return 0;

        let count = 0;

        if (result.summary && result.summary.totalVulnerabilities !== undefined) {
            count += result.summary.totalVulnerabilities;
        }

        if (result.tests) {
            Object.values(result.tests).forEach(test => {
                if (Array.isArray(test)) {
                    test.forEach(item => {
                        if (item.vulnerability || item.vulnerabilities) {
                            count += item.vulnerabilities ? item.vulnerabilities.length : 1;
                        }
                    });
                } else if (test.vulnerability || test.vulnerabilities) {
                    count += test.vulnerabilities ? test.vulnerabilities.length : 1;
                }
            });
        }

        if (result.results) {
            Object.values(result.results).forEach(methodResults => {
                if (Array.isArray(methodResults)) {
                    methodResults.forEach(item => {
                        if (item.vulnerabilities) {
                            count += item.vulnerabilities.length;
                        }
                    });
                }
            });
        }

        return count;
    }

    displaySummary(campaignResults) {
        console.log(chalk.bold.cyan('\n\n📊 Campaign Summary\n'));
        console.log(chalk.gray('='.repeat(60)));

        console.log(chalk.white(`\nCampaign: ${campaignResults.campaignName}`));
        console.log(chalk.white(`Duration: ${campaignResults.totalElapsed}s`));
        console.log(chalk.white(`Mode: ${campaignResults.mode}`));

        console.log(chalk.yellow('\n📈 Statistics:'));
        console.log(chalk.white(`  Total Targets: ${campaignResults.summary.totalTargets}`));
        console.log(chalk.white(`  Total Modules: ${campaignResults.summary.totalModules}`));
        console.log(chalk.white(`  Total Operations: ${campaignResults.summary.totalOperations}`));
        console.log(chalk.green(`  Successful: ${campaignResults.summary.successfulOperations}`));
        console.log(chalk.red(`  Failed: ${campaignResults.summary.failedOperations}`));

        const totalVulnerabilities = campaignResults.targets.reduce(
            (sum, t) => sum + t.vulnerabilities,
            0
        );

        if (totalVulnerabilities > 0) {
            console.log(chalk.red(`\n⚠️  Total Vulnerabilities Found: ${totalVulnerabilities}`));

            console.log(chalk.yellow('\nVulnerabilities by Target:'));
            campaignResults.targets
                .filter(t => t.vulnerabilities > 0)
                .sort((a, b) => b.vulnerabilities - a.vulnerabilities)
                .forEach(target => {
                    console.log(chalk.white(`  • ${target.target}: ${target.vulnerabilities}`));
                });
        } else {
            console.log(chalk.green('\n✓ No vulnerabilities detected across all targets'));
        }

        console.log(chalk.gray('\n' + '='.repeat(60)));
    }

    generateReport() {
        if (this.results.length === 0) {
            return null;
        }

        const campaign = this.results[0];
        const report = {
            title: `Security Campaign Report: ${campaign.campaignName}`,
            generated: new Date().toISOString(),
            campaign: {
                name: campaign.campaignName,
                startTime: campaign.startTime,
                endTime: campaign.endTime,
                duration: campaign.totalElapsed,
                mode: campaign.mode,
            },
            summary: campaign.summary,
            targets: campaign.targets.map(target => ({
                name: target.target,
                vulnerabilities: target.vulnerabilities,
                status: target.status,
                modules: target.modules.map(m => ({
                    name: m.module,
                    success: m.success,
                    timeElapsed: m.timeElapsed,
                })),
            })),
            recommendations: this.generateRecommendations(campaign),
        };

        return report;
    }

    generateRecommendations(campaign) {
        const recommendations = [];
        const totalVulns = campaign.targets.reduce((sum, t) => sum + t.vulnerabilities, 0);

        if (totalVulns > 0) {
            recommendations.push('Critical: Address all identified vulnerabilities immediately');
            recommendations.push('Review security configurations across all tested targets');
            recommendations.push('Implement regular security testing schedule');
        }

        const failedOps = campaign.summary.failedOperations;
        if (failedOps > 0) {
            recommendations.push(`Review ${failedOps} failed operations for potential issues`);
        }

        if (campaign.targets.some(t => t.vulnerabilities > 5)) {
            recommendations.push('High-risk targets identified - prioritize remediation');
        }

        return recommendations;
    }

    async run() {
        const results = await this.executeCampaign();

        if (this.config.generateReport) {
            const report = this.generateReport();
            if (report && this.config.reportPath) {
                fs.writeFileSync(
                    this.config.reportPath,
                    JSON.stringify(report, null, 2)
                );
                console.log(chalk.green(`\n📄 Report saved to: ${this.config.reportPath}`));
            }
        }

        console.log(chalk.bold.green('\n✅ Campaign Complete!\n'));

        return results;
    }

    exportJSON(filename) {
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const csvRows = ['Campaign,Target,Module,Success,Vulnerabilities,Time'];

        this.results.forEach(campaign => {
            campaign.targets.forEach(target => {
                target.modules.forEach(module => {
                    csvRows.push(
                        `"${campaign.campaignName}","${target.target}","${module.module}",${module.success},${target.vulnerabilities},${module.timeElapsed}`
                    );
                });
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = CampaignManager;