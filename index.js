const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');

const SmartBrute = require('./modules/smartBrute');
const PasswordGenerator = require('./modules/passwordGenerator');
const RateLimitChecker = require('./modules/rateLimitChecker');
const WordlistOptimizer = require('./modules/wordlistOptimizer');
const APIFuzzer = require('./modules/apiFuzzer');
const SQLInjection = require('./modules/sqlInjection');
const DDOSTester = require('./modules/ddosTester');
const SessionLogger = require('./modules/sessionLogger');
const JWTAnalyzer = require('./modules/jwtAnalyzer');
const HeaderInjection = require('./modules/headerInjection');
const WebSocketTester = require('./modules/websocketTester');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let config;
try {
  config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
} catch (error) {
  console.log(chalk.red('❌ Error loading config.json'));
  process.exit(1);
}

function showMenu() {
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║       🌌 NexusBrute Toolkit 🌌       ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════╝\n'));

  console.log(chalk.yellow('📌 Available Modules:\n'));
  console.log(chalk.white('1. Smart Brute Force'));
  console.log(chalk.white('2. Password Generator'));
  console.log(chalk.white('3. Rate Limit Checker'));
  console.log(chalk.white('4. Wordlist Optimizer'));
  console.log(chalk.white('5. API Fuzzer'));
  console.log(chalk.white('6. SQL Injection Tester'));
  console.log(chalk.white('7. DDoS Tester'));
  console.log(chalk.white('8. JWT Analyzer'));
  console.log(chalk.white('9. Header Injection Tester'));
  console.log(chalk.white('10. WebSocket Security Tester 🔌'));
  console.log(chalk.white('11. Exit\n'));
}

function askForOutputFormat(callback) {
  console.log(chalk.yellow('\n📊 Select Output Format:\n'));
  console.log(chalk.white('1. JSON'));
  console.log(chalk.white('2. CSV'));
  console.log(chalk.white('3. Both'));
  console.log(chalk.white('4. None (Console only)\n'));

  rl.question(chalk.cyan('Enter your choice: '), (choice) => {
    callback(choice);
  });
}

function saveResults(module, results, format) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

  if (format === '1' || format === '3') {
    const jsonFile = `results/${module}_${timestamp}.json`;
    results.exportJSON(jsonFile);
  }

  if (format === '2' || format === '3') {
    const csvFile = `results/${module}_${timestamp}.csv`;
    results.exportCSV(csvFile);
  }

  if (format === '4') {
    console.log(chalk.green('\n✅ Results displayed in console only.'));
  }
}

async function runModule(choice) {
  let module, results;

  switch (choice) {
    case '1':
      console.log(chalk.green('\n🚀 Starting Smart Brute Force...\n'));
      module = new SmartBrute(config.smartBrute, config.proxies);
      results = await module.run();
      askForOutputFormat((format) => {
        saveResults('smartbrute', module, format);
        showMenu();
        promptUser();
      });
      break;

    case '2':
      console.log(chalk.green('\n🔐 Generating Passwords...\n'));
      module = new PasswordGenerator(config.passwordGenerator);
      results = module.generate();
      console.log(chalk.cyan('\n📋 Generated Passwords:'));
      results.forEach((pwd, i) => console.log(chalk.white(`${i + 1}. ${pwd}`)));
      showMenu();
      promptUser();
      break;

    case '3':
      console.log(chalk.green('\n⏱️  Checking Rate Limits...\n'));
      module = new RateLimitChecker(config.rateLimitChecker, config.proxies);
      results = await module.check();
      askForOutputFormat((format) => {
        saveResults('ratelimit', module, format);
        showMenu();
        promptUser();
      });
      break;

    case '4':
      console.log(chalk.green('\n📝 Optimizing Wordlist...\n'));
      module = new WordlistOptimizer(config.wordlistOptimizer);
      results = module.optimize();
      console.log(chalk.green(`\n✅ Wordlist optimized and saved to ${config.wordlistOptimizer.outputFile}`));
      showMenu();
      promptUser();
      break;

    case '5':
      console.log(chalk.green('\n🔍 Starting API Fuzzer...\n'));
      module = new APIFuzzer(config.apiFuzzer, config.proxies);
      results = await module.fuzz();
      askForOutputFormat((format) => {
        saveResults('apifuzzer', module, format);
        showMenu();
        promptUser();
      });
      break;

    case '6':
      console.log(chalk.green('\n💉 Testing SQL Injection...\n'));
      module = new SQLInjection(config.sqlInjection, config.proxies);
      results = await module.test();
      askForOutputFormat((format) => {
        saveResults('sqlinjection', module, format);
        showMenu();
        promptUser();
      });
      break;

    case '7':
      console.log(chalk.green('\n💥 Starting DDoS Test...\n'));
      module = new DDOSTester(config.ddosTester, config.proxies);
      results = await module.test();
      askForOutputFormat((format) => {
        saveResults('ddos', module, format);
        showMenu();
        promptUser();
      });
      break;

    case '8':
      console.log(chalk.green('\n🔐 Starting JWT Analyzer...\n'));
      module = new JWTAnalyzer(config.jwtAnalyzer);
      results = await module.run();
      askForOutputFormat((format) => {
        saveResults('jwtanalyzer', module, format);
        showMenu();
        promptUser();
      });
      break;

    case '9':
      console.log(chalk.green('\n🔬 Starting Header Injection Tester...\n'));
      module = new HeaderInjection(config.headerInjection, config.proxies);
      results = await module.run();
      askForOutputFormat((format) => {
        saveResults('headerinjection', module, format);
        showMenu();
        promptUser();
      });
      break;

    case '10':
      console.log(chalk.green('\n🔌 Starting WebSocket Security Tester...\n'));
      module = new WebSocketTester(config.websocketTester);
      results = await module.run();
      askForOutputFormat((format) => {
        saveResults('websocket', module, format);
        showMenu();
        promptUser();
      });
      break;

    case '11':
      console.log(chalk.bold.cyan('\n👋 Thanks for using NexusBrute! Stay Ethical! 🌌\n'));
      rl.close();
      process.exit(0);
      break;

    default:
      console.log(chalk.red('\n❌ Invalid choice. Please try again.'));
      showMenu();
      promptUser();
  }
}

function promptUser() {
  rl.question(chalk.cyan('Enter your choice: '), (choice) => {
    runModule(choice);
  });
}

if (!fs.existsSync('results')) {
  fs.mkdirSync('results');
}

showMenu();
promptUser();