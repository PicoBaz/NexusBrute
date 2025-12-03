# 🌌 NexusBrute

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Security](https://img.shields.io/badge/Security-Ethical%20Testing-blue.svg)]()

**NexusBrute** is a comprehensive Node.js toolkit designed for ethical security testing and penetration testing. Built with modularity and precision in mind, it provides security professionals with powerful tools to identify vulnerabilities and strengthen system defenses.

## ⚠️ Legal Disclaimer

**THIS TOOL IS FOR AUTHORIZED SECURITY TESTING ONLY**

Use NexusBrute only on systems you own or have explicit written permission to test. Unauthorized access to computer systems is illegal and punishable by law. The developers assume no liability for misuse of this software.

---

## 🚀 Features

### 🎯 **Multi-Target Campaign Manager** ⭐ NEW!
Advanced orchestration system for coordinating security tests across multiple targets:
- **Sequential & Parallel Modes**: Choose execution strategy based on needs
- **Multi-Module Support**: Run multiple security modules per target
- **Target Management**: Load targets from JSON files or inline configuration
- **Smart Queueing**: Intelligent operation scheduling and prioritization
- **Real-time Monitoring**: Live progress tracking with status updates
- **Vulnerability Aggregation**: Automatic correlation across all targets
- **Campaign Statistics**: Comprehensive success/failure metrics
- **Automated Reporting**: Generate detailed JSON reports with recommendations
- **Batch Processing**: Configurable concurrency for parallel execution
- **Flexible Delays**: Control timing between targets and modules

### 🌐 **Subdomain Enumerator**
Advanced subdomain discovery and reconnaissance toolkit:
- DNS Bruteforce with custom wordlists
- Certificate Transparency log mining
- Permutation scanning
- Wildcard detection
- DNS Zone Transfer testing
- Subdomain takeover detection

### 🔌 **WebSocket Security Tester**
Advanced WebSocket vulnerability scanner:
- Connection security testing
- Origin validation
- Message injection (15+ payloads)
- CSRF protection validation
- Rate limiting analysis
- Authentication bypass testing

### 🔬 **Header Injection Tester**
Comprehensive HTTP header vulnerability scanner:
- CRLF Injection testing
- Host Header Injection
- X-Forwarded-For manipulation
- Header value injection

### 🔐 **JWT Analyzer**
Advanced JWT security analyzer:
- Token decoding & analysis
- None Algorithm Attack
- Secret bruteforce
- Key Confusion Attack
- Claims manipulation

### Additional Modules

- 🔓 Smart Brute Force
- 🔑 Password Generator
- ⏱️ Rate Limit Checker
- 📝 Wordlist Optimizer
- 🔍 API Fuzzer
- 💉 SQL Injection Tester
- 💥 DDoS Tester

---

## 📦 Installation

```bash
git clone https://github.com/PicoBaz/NexusBrute.git
cd NexusBrute
npm install axios chalk ws
mkdir results wordlists keys
```

---

## ⚙️ Configuration

### Multi-Target Campaign Manager Configuration

```json
{
  "campaignManager": {
    "campaignName": "Security Assessment 2025",
    "mode": "sequential",
    "targetsFile": "campaign-targets.json",
    "modules": [
      {
        "name": "headerInjection",
        "config": {
          "testTypes": ["all"],
          "delay": 500
        }
      },
      {
        "name": "subdomainEnumerator",
        "config": {
          "methods": ["bruteforce", "crt"],
          "delay": 100
        }
      }
    ],
    "delayBetweenTargets": 2000,
    "delayBetweenModules": 1000,
    "maxConcurrent": 3,
    "generateReport": true,
    "reportPath": "results/campaign-report.json"
  }
}
```

**Parameters:**
- `campaignName`: Name for your security campaign (required)
- `mode`: Execution mode - "sequential" or "parallel" (default: "sequential")
- `targetsFile`: Path to JSON file containing targets
- `targets`: Inline array of target objects (alternative to targetsFile)
- `modules`: Array of modules to run on each target
- `delayBetweenTargets`: Delay in ms between targets (sequential mode)
- `delayBetweenModules`: Delay in ms between modules per target
- `maxConcurrent`: Max concurrent operations (parallel mode, default: 3)
- `generateReport`: Enable report generation (default: false)
- `reportPath`: Path for generated report

**Targets File Format** (`campaign-targets.json`):
```json
[
  {
    "name": "Production API",
    "target": "api.example.com",
    "config": {
      "targetUrl": "https://api.example.com"
    }
  },
  {
    "name": "Main Domain",
    "target": "example.com",
    "config": {
      "domain": "example.com"
    }
  }
]
```

---

## 🎯 Usage

### Interactive Mode

```bash
node index.js
```

Menu:
```
╔════════════════════════════════════════╗
║       🌌 NexusBrute Toolkit 🌌       ║
╚════════════════════════════════════════╝

📌 Available Modules:

1. Smart Brute Force
2. Password Generator
3. Rate Limit Checker
4. Wordlist Optimizer
5. API Fuzzer
6. SQL Injection Tester
7. DDoS Tester
8. JWT Analyzer
9. Header Injection Tester
10. WebSocket Security Tester
11. Subdomain Enumerator
12. Multi-Target Campaign Manager 🎯
13. Exit
```

### Campaign Manager Example

1. **Create targets file** `campaign-targets.json`:
```json
[
  {
    "name": "Production",
    "target": "prod.example.com",
    "config": { "targetUrl": "https://prod.example.com" }
  },
  {
    "name": "Staging",
    "target": "staging.example.com",
    "config": { "targetUrl": "https://staging.example.com" }
  }
]
```

2. **Configure campaign** in `config.json`

3. **Run NexusBrute** and select option 12

---

## 📊 Output Examples

### Campaign Manager Output

**Console Output:**
```
🎯 Multi-Target Campaign Manager Started
================================================================
Campaign: Security Assessment 2025
Mode: sequential
================================================================

📊 Campaign Overview:
  Targets: 5
  Modules: 3
  Total Operations: 15

🔄 Running Sequential Campaign...

[1/5] Processing: Production API
------------------------------------------------------------
  [1/3] Running headerInjection... ✓
    Found 2 vulnerabilities
  [2/3] Running subdomainEnumerator... ✓
  [3/3] Running websocketTester... ✓
    Found 1 vulnerabilities

[2/5] Processing: Staging Environment
------------------------------------------------------------
  [1/3] Running headerInjection... ✓
  [2/3] Running subdomainEnumerator... ✓
    Found 3 vulnerabilities
  [3/3] Running websocketTester... ✗
    Error: Connection timeout

📊 Campaign Summary
================================================================

Campaign: Security Assessment 2025
Duration: 245.67s
Mode: sequential

📈 Statistics:
  Total Targets: 5
  Total Modules: 3
  Total Operations: 15
  Successful: 14
  Failed: 1

⚠️  Total Vulnerabilities Found: 12

Vulnerabilities by Target:
  • Staging Environment: 5
  • Production API: 4
  • Development Server: 3

================================================================

📄 Report saved to: results/campaign-report.json

✅ Campaign Complete!
```

**Generated Report** (`campaign-report.json`):
```json
{
  "title": "Security Campaign Report: Security Assessment 2025",
  "generated": "2025-11-25T10:30:00.000Z",
  "campaign": {
    "name": "Security Assessment 2025",
    "startTime": "2025-11-25T10:26:00.000Z",
    "endTime": "2025-11-25T10:30:05.000Z",
    "duration": "245.67",
    "mode": "sequential"
  },
  "summary": {
    "totalTargets": 5,
    "totalModules": 3,
    "totalOperations": 15,
    "successfulOperations": 14,
    "failedOperations": 1
  },
  "targets": [
    {
      "name": "Production API",
      "vulnerabilities": 4,
      "status": "completed",
      "modules": [...]
    }
  ],
  "recommendations": [
    "Critical: Address all identified vulnerabilities immediately",
    "Review security configurations across all tested targets",
    "Review 1 failed operations for potential issues",
    "High-risk targets identified - prioritize remediation"
  ]
}
```

---

## 📚 Module Details

### Multi-Target Campaign Manager Features

#### 1. Execution Modes

**Sequential Mode:**
- Tests targets one at a time
- Predictable execution order
- Lower resource usage
- Configurable delays between operations
- Best for rate-limited environments

**Parallel Mode:**
- Tests multiple targets simultaneously
- Faster completion time
- Configurable concurrency limit
- Batch processing
- Best for large-scale assessments

#### 2. Target Management

- Load targets from JSON files
- Inline target configuration
- Per-target custom settings
- Target naming and identification
- Flexible configuration inheritance

#### 3. Module Orchestration

- Run any combination of security modules
- Per-module configuration
- Automatic result aggregation
- Module success/failure tracking
- Time tracking per operation

#### 4. Campaign Analytics

- Real-time operation tracking
- Success/failure statistics
- Vulnerability aggregation by target
- Total operations count
- Time elapsed measurements

#### 5. Reporting System

- Automated JSON report generation
- Campaign summary and statistics
- Target-level vulnerability breakdown
- Security recommendations
- Timestamp and duration tracking

#### 6. Queue Management

- Intelligent operation scheduling
- Configurable delays
- Batch processing support
- Concurrent execution control
- Failed operation tracking

---

## 🔧 Advanced Usage

### Parallel Campaign with High Concurrency

```json
{
  "campaignManager": {
    "campaignName": "Fast Scan",
    "mode": "parallel",
    "maxConcurrent": 10,
    "targetsFile": "targets.json",
    "modules": [
      { "name": "headerInjection" }
    ]
  }
}
```

### Sequential Campaign with Delays

```json
{
  "campaignManager": {
    "campaignName": "Stealth Scan",
    "mode": "sequential",
    "delayBetweenTargets": 5000,
    "delayBetweenModules": 2000,
    "targetsFile": "targets.json",
    "modules": [
      { "name": "subdomainEnumerator" },
      { "name": "headerInjection" }
    ]
  }
}
```

### Inline Targets Configuration

```json
{
  "campaignManager": {
    "campaignName": "Quick Test",
    "mode": "sequential",
    "targets": [
      {
        "name": "API",
        "config": { "targetUrl": "https://api.example.com" }
      }
    ],
    "modules": [...]
  }
}
```

---

## 🐛 Troubleshooting

### Campaign Manager Issues

**Problem**: "No targets configured"
- **Solution**: Ensure targetsFile exists or targets array is populated

**Problem**: "Module not found"
- **Solution**: Check module name spelling, only supported modules work

**Problem**: "High failure rate"
- **Solution**: Increase delays, check target accessibility

**Problem**: "Slow parallel execution"
- **Solution**: Increase maxConcurrent value for faster processing

---

## 📖 Best Practices

1. **Start with Sequential Mode**: Test with sequential before parallel
2. **Use Appropriate Delays**: Respect rate limits and server load
3. **Monitor Progress**: Watch real-time output for issues
4. **Review Reports**: Analyze generated reports thoroughly
5. **Prioritize Targets**: Focus on critical assets first
6. **Test Configuration**: Validate on small target set first
7. **Keep Records**: Export and archive campaign results
8. **Incremental Testing**: Run campaigns in stages for large infrastructures

---

## 🤝 Contributing

Contributions welcome! Fork, create feature branch, submit PR.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Built with Node.js, Chalk, Axios, ws
- Inspired by the security research community

---

## 📞 Contact & Support

- **GitHub**: [@PicoBaz](https://github.com/PicoBaz)
- **Email**: picobaz3@gmail.com
- **Telegram**: [@picobaz](https://t.me/picobaz)
- **Issues**: [GitHub Issues](https://github.com/PicoBaz/NexusBrute/issues)

---

## 🌟 Star History

If you find NexusBrute useful, please consider giving it a star! ⭐


---

**Remember: With great power comes great responsibility. Use NexusBrute ethically and legally.** 🌌

Made with ❤️ by the security community