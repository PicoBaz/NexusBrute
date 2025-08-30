const fs = require('fs').promises;
const chalk = require('chalk');
const prompts = require('prompts');

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

// Type effect for CLI
function typeEffect(text) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      process.stdout.write(text[i]);
      i++;
      if (i === text.length) {
        clearInterval(interval);
        console.log();
        resolve();
      }
    }, 30);
  });
}

// Save results based on user choice
async function saveResults(results, outputType) {
  try {
    if (outputType === 'json' || outputType === 'both') {
      await fs.writeFile(RESULTS_JSON, JSON.stringify(results, null, 2));
      console.log(chalk.green(`[SUCCESS] Saved JSON to ${RESULTS_JSON}`));
    }
    if (outputType === 'csv' || outputType === 'both') {
      const csv = ['Operation,Target,Result,Timestamp,Error']
          .concat(results.map(r => `"${r.operation}","${r.target}","${r.result}","${r.timestamp}","${r.error || ''}"`))
          .join('\n');
      await fs.writeFile(RESULTS_CSV, csv);
      console.log(chalk.green(`[SUCCESS] Saved CSV to ${RESULTS_CSV}`));
    }
  } catch (err) {
    console.error(chalk.red('[ERROR] Failed to save results:', err.message));
  }
}

// Load modules
const proxyRotator = require('./modules/proxy_rotator');
const smartBrute = require('./modules/smart_brute');
const passwordGenerator = require('./modules/password_generator');
const rateLimitChecker = require('./modules/rate_limit_checker');
const wordlistOptimizer = require('./modules/wordlist_optimizer');
const apiFuzzer = require('./modules/api_fuzzer');
const sessionLogger = require('./modules/session_logger');

// Main menu
async function showMenu(config) {
  console.clear();
  console.log(chalk.green.bold('┌───[ NexusBrute v1.0.0 - Cyber Vault ]───'));
  await typeEffect(chalk.cyan('> System Booted. Proxy Rotator Engaged. Ready for Action.'));
  console.log(chalk.green('└───────────────────────────────┘'));
  console.log(chalk.magenta('Select Module:'));
  console.log(chalk.yellow('  [1] Smart Brute - Test login endpoints'));
  console.log(chalk.yellow('  [2] Password Generator - Create secure passwords'));
  console.log(chalk.yellow('  [3] Rate Limit Checker - Probe API limits'));
  console.log(chalk.yellow('  [4] Wordlist Optimizer - Streamline password lists'));
  console.log(chalk.yellow('  [5] API Fuzzer - Hunt for API vulnerabilities'));
  console.log(chalk.yellow('  [6] Exit - Terminate NexusBrute'));
  console.log(chalk.green('┌───────────────────────────────┐'));

  const response = await prompts({
    type: 'select',
    name: 'module',
    message: chalk.green('> Enter choice [1-6]:'),
    choices: [
      { title: 'Smart Brute', value: 'smart_brute' },
      { title: 'Password Generator', value: 'password_gen' },
      { title: 'Rate Limit Checker', value: 'rate_limit' },
      { title: 'Wordlist Optimizer', value: 'wordlist_optimizer' },
      { title: 'API Fuzzer', value: 'api_fuzzer' },
      { title: 'Exit', value: 'exit' }
    ]
  });

  console.log(chalk.green('└───────────────────────────────┘'));

  let results = [];
  const sessionLog = [];
  await sessionLogger.log(config, { operation: 'start', details: `Module selected: ${response.module}` });

  switch (response.module) {
    case 'smart_brute':
      console.log(chalk.cyan('[INFO] Engaging Smart Brute...'));
      results = await smartBrute.brute(config, sessionLog);
      break;
    case 'password_gen':
      console.log(chalk.cyan('[INFO] Engaging Password Generator...'));
      results = await passwordGenerator.generate(config, sessionLog);
      break;
    case 'rate_limit':
      console.log(chalk.cyan('[INFO] Engaging Rate Limit Checker...'));
      results = await rateLimitChecker.check(config, sessionLog);
      break;
    case 'wordlist_optimizer':
      console.log(chalk.cyan('[INFO] Engaging Wordlist Optimizer...'));
      results = await wordlistOptimizer.optimize(config, sessionLog);
      break;
    case 'api_fuzzer':
      console.log(chalk.cyan('[INFO] Engaging API Fuzzer...'));
      results = await apiFuzzer.fuzz(config, sessionLog);
      break;
    case 'exit':
      console.log(chalk.red('[EXIT] NexusBrute Shutting Down. Stay Secure!'));
      await sessionLogger.log(config, { operation: 'exit', details: 'NexusBrute terminated' });
      process.exit(0);
      break;
    default:
      console.log(chalk.red('[ERROR] Invalid choice. Restarting...'));
      await sessionLogger.log(config, { operation: 'error', details: 'Invalid module choice' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      return showMenu(config);
  }

  // Ask for output type
  const outputResponse = await prompts({
    type: 'select',
    name: 'output',
    message: chalk.green('> Select output format:'),
    choices: [
      { title: 'JSON', value: 'json' },
      { title: 'CSV', value: 'csv' },
      { title: 'Both', value: 'both' }
    ]
  });

  await sessionLogger.log(config, { operation: 'output', details: `Output format selected: ${outputResponse.output}` });
  await saveResults(results, outputResponse.output);
  await sessionLogger.save(config, sessionLog);

  // Ask to continue or exit
  const continueResponse = await prompts({
    type: 'select',
    name: 'continue',
    message: chalk.green('> Continue or Exit?'),
    choices: [
      { title: 'Continue', value: 'continue' },
      { title: 'Exit', value: 'exit' }
    ]
  });

  if (continueResponse.continue === 'continue') {
    await showMenu(config);
  } else {
    console.log(chalk.red('[EXIT] NexusBrute Shutting Down. Stay Secure!'));
    await sessionLogger.log(config, { operation: 'exit', details: 'NexusBrute terminated' });
    await sessionLogger.save(config, sessionLog);
    process.exit(0);
  }
}

// Main function
async function main() {
  const config = await loadConfig();
  await sessionLogger.log(config, { operation: 'init', details: 'NexusBrute initialized with Proxy Rotator' });
  await showMenu(config);
}

main().catch(async err => {
  console.error(chalk.red('[FATAL] NexusBrute crashed:', err.message));
  await sessionLogger.log({ sessionLogger: { logFile: 'session.log' } }, { operation: 'error', details: `Crash: ${err.message}` });
});