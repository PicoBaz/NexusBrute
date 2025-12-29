const fs = require('fs');
const chalk = require('chalk');

class WordlistOptimizer {
    constructor(config) {
        this.config = config;
        this.results = [];
    }

    readWordlist() {
        try {
            if (!fs.existsSync(this.config.inputFile)) {
                throw new Error(`Input file not found: ${this.config.inputFile}`);
            }

            const data = fs.readFileSync(this.config.inputFile, 'utf-8');
            const words = data.split('\n')
                .map(word => word.trim())
                .filter(word => word.length > 0);

            return words;
        } catch (error) {
            throw new Error(`Failed to read input file: ${error.message}`);
        }
    }

    filterByLength(words) {
        const minLength = this.config.minLength || 1;
        const originalCount = words.length;
        const filtered = words.filter(word => word.length >= minLength);
        const removed = originalCount - filtered.length;

        return { words: filtered, removed };
    }

    removeDuplicates(words) {
        const originalCount = words.length;
        const unique = [...new Set(words)];
        const removed = originalCount - unique.length;

        return { words: unique, removed };
    }

    sortWords(words) {
        if (this.config.sortByLength) {
            return words.sort((a, b) => {
                if (a.length !== b.length) {
                    return a.length - b.length;
                }
                return a.localeCompare(b);
            });
        }
        return words.sort((a, b) => a.localeCompare(b));
    }

    analyzeWordlist(words) {
        const stats = {
            totalWords: words.length,
            minLength: Math.min(...words.map(w => w.length)),
            maxLength: Math.max(...words.map(w => w.length)),
            avgLength: (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(2),
            lengthDistribution: {},
        };

        words.forEach(word => {
            const len = word.length;
            stats.lengthDistribution[len] = (stats.lengthDistribution[len] || 0) + 1;
        });

        return stats;
    }

    saveWordlist(words) {
        try {
            fs.writeFileSync(this.config.outputFile, words.join('\n'));
            return true;
        } catch (error) {
            throw new Error(`Failed to save output file: ${error.message}`);
        }
    }

    optimize() {
        console.log(chalk.bold.cyan('\n📝 Wordlist Optimizer Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Input File: ${this.config.inputFile}`));
        console.log(chalk.white(`Output File: ${this.config.outputFile}`));
        console.log(chalk.white(`Min Length: ${this.config.minLength || 1}`));
        console.log(chalk.white(`Remove Duplicates: ${this.config.removeDuplicates ? 'Yes' : 'No'}`));
        console.log(chalk.white(`Sort: ${this.config.sortByLength ? 'By Length' : 'Alphabetically'}`));
        console.log(chalk.gray('='.repeat(60)));

        const startTime = Date.now();
        const operations = [];

        try {
            console.log(chalk.yellow('\n🔍 Step 1: Reading wordlist...'));
            let words = this.readWordlist();
            const originalCount = words.length;
            console.log(chalk.green(`✓ Loaded ${originalCount} words`));

            const beforeStats = this.analyzeWordlist(words);

            if (this.config.minLength && this.config.minLength > 1) {
                console.log(chalk.yellow(`\n🔍 Step 2: Filtering by minimum length (${this.config.minLength})...`));
                const result = this.filterByLength(words);
                words = result.words;
                operations.push({
                    operation: 'filter_by_length',
                    removed: result.removed,
                    remaining: words.length,
                });
                console.log(chalk.green(`✓ Removed ${result.removed} words, ${words.length} remaining`));
            }

            if (this.config.removeDuplicates) {
                console.log(chalk.yellow('\n🔍 Step 3: Removing duplicates...'));
                const result = this.removeDuplicates(words);
                words = result.words;
                operations.push({
                    operation: 'remove_duplicates',
                    removed: result.removed,
                    remaining: words.length,
                });
                console.log(chalk.green(`✓ Removed ${result.removed} duplicates, ${words.length} unique words`));
            }

            console.log(chalk.yellow(`\n🔍 Step 4: Sorting wordlist...`));
            words = this.sortWords(words);
            operations.push({
                operation: 'sort',
                method: this.config.sortByLength ? 'by_length' : 'alphabetically',
            });
            console.log(chalk.green(`✓ Sorted ${this.config.sortByLength ? 'by length' : 'alphabetically'}`));

            console.log(chalk.yellow('\n🔍 Step 5: Saving optimized wordlist...'));
            this.saveWordlist(words);
            console.log(chalk.green(`✓ Saved to ${this.config.outputFile}`));

            const afterStats = this.analyzeWordlist(words);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

            console.log(chalk.bold.cyan('\n\n📊 Optimization Summary\n'));
            console.log(chalk.gray('='.repeat(60)));
            console.log(chalk.white(`Original Words: ${originalCount}`));
            console.log(chalk.white(`Optimized Words: ${words.length}`));
            console.log(chalk.white(`Reduction: ${originalCount - words.length} words (${(((originalCount - words.length) / originalCount) * 100).toFixed(1)}%)`));
            console.log(chalk.gray('\n' + '-'.repeat(60)));
            console.log(chalk.cyan('\nBefore Optimization:'));
            console.log(chalk.white(`  Min Length: ${beforeStats.minLength}`));
            console.log(chalk.white(`  Max Length: ${beforeStats.maxLength}`));
            console.log(chalk.white(`  Avg Length: ${beforeStats.avgLength}`));
            console.log(chalk.cyan('\nAfter Optimization:'));
            console.log(chalk.white(`  Min Length: ${afterStats.minLength}`));
            console.log(chalk.white(`  Max Length: ${afterStats.maxLength}`));
            console.log(chalk.white(`  Avg Length: ${afterStats.avgLength}`));
            console.log(chalk.gray('\n' + '-'.repeat(60)));

            const topLengths = Object.entries(afterStats.lengthDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            console.log(chalk.yellow('\nTop 5 Word Lengths:'));
            topLengths.forEach(([length, count]) => {
                const percentage = ((count / words.length) * 100).toFixed(1);
                console.log(chalk.white(`  ${length} chars: ${count} words (${percentage}%)`));
            });

            console.log(chalk.gray(`\nTime elapsed: ${elapsed}s`));
            console.log(chalk.gray('='.repeat(60)));

            const finalResults = {
                timestamp: new Date().toISOString(),
                inputFile: this.config.inputFile,
                outputFile: this.config.outputFile,
                originalCount,
                optimizedCount: words.length,
                reduction: originalCount - words.length,
                reductionPercentage: (((originalCount - words.length) / originalCount) * 100).toFixed(1),
                operations,
                beforeStats,
                afterStats,
                timeElapsed: elapsed,
            };

            this.results.push(finalResults);

            console.log(chalk.bold.green('\n✅ Wordlist Optimization Complete!\n'));

            return finalResults;

        } catch (error) {
            console.log(chalk.red(`\n✗ Error: ${error.message}`));

            const errorResults = {
                timestamp: new Date().toISOString(),
                inputFile: this.config.inputFile,
                outputFile: this.config.outputFile,
                error: error.message,
            };

            this.results.push(errorResults);

            return errorResults;
        }
    }

    run() {
        return this.optimize();
    }

    exportJSON(filename) {
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const csvRows = ['Timestamp,Input File,Output File,Original Count,Optimized Count,Reduction,Reduction %,Operations,Time Elapsed'];

        this.results.forEach(result => {
            if (!result.error) {
                const operations = result.operations.map(op => op.operation).join(';');
                csvRows.push(
                    `${result.timestamp},"${result.inputFile}","${result.outputFile}",${result.originalCount},${result.optimizedCount},${result.reduction},${result.reductionPercentage},"${operations}",${result.timeElapsed}`
                );
            } else {
                csvRows.push(
                    `${result.timestamp},"${result.inputFile}","${result.outputFile}",,,,,,"${result.error}"`
                );
            }
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = WordlistOptimizer;