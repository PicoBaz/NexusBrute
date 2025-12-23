const fs = require('fs').promises;
const chalk = require('chalk');
const sessionLogger = require('./sessionLogger');

async function optimize(config, sessionLog) {
    const { inputFile, outputFile, minLength, removeDuplicates, sortByLength } = config.wordlistOptimizer;
    const results = [];

    sessionLog.push(await sessionLogger.log(config, {
        operation: 'wordlist_optimizer_start',
        details: `Optimizing wordlist: ${inputFile}`
    }));

    try {
        // Read input wordlist
        const data = await fs.readFile(inputFile, 'utf8');
        let words = data.split('\n').map(word => word.trim()).filter(word => word.length >= minLength);

        // Remove duplicates
        if (removeDuplicates) {
            words = [...new Set(words)];
            results.push({
                operation: 'wordlist_optimizer',
                target: inputFile,
                result: `Removed duplicates: ${words.length} unique words`,
                timestamp: new Date().toISOString(),
                error: ''
            });
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'wordlist_optimizer_result',
                details: `Removed duplicates: ${words.length} unique words`
            }));
        }

        // Sort by length
        if (sortByLength) {
            words.sort((a, b) => a.length - b.length || a.localeCompare(b));
            results.push({
                operation: 'wordlist_optimizer',
                target: inputFile,
                result: 'Sorted by length',
                timestamp: new Date().toISOString(),
                error: ''
            });
            sessionLog.push(await sessionLogger.log(config, {
                operation: 'wordlist_optimizer_result',
                details: 'Sorted by length'
            }));
        }

        // Save optimized wordlist
        await fs.writeFile(outputFile, words.join('\n'));
        results.push({
            operation: 'wordlist_optimizer',
            target: outputFile,
            result: `Optimized wordlist saved: ${words.length} words`,
            timestamp: new Date().toISOString(),
            error: ''
        });
        sessionLog.push(await sessionLogger.log(config, {
            operation: 'wordlist_optimizer_result',
            details: `Saved optimized wordlist: ${outputFile}`
        }));

        console.log(chalk.green(`[SUCCESS] Wordlist optimized: ${words.length} words saved to ${outputFile}`));
    } catch (err) {
        results.push({
            operation: 'wordlist_optimizer',
            target: inputFile,
            result: 'Failed',
            timestamp: new Date().toISOString(),
            error: err.message
        });
        console.error(chalk.red(`[ERROR] Wordlist optimization failed: ${err.message}`));
        sessionLog.push(await sessionLogger.log(config, {
            operation: 'wordlist_optimizer_error',
            details: `Error: ${err.message}`
        }));
    }

    return results;
}

module.exports = optimize;