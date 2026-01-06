# 🌌 NexusBrute

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-2.6.0-blue.svg)](https://github.com/PicoBaz/NexusBrute)
[![Security](https://img.shields.io/badge/Security-Ethical%20Testing-red.svg)]()

**NexusBrute** is a comprehensive Node.js toolkit designed for ethical security testing and penetration testing. Built with modularity and precision in mind, it provides security professionals with 14 powerful modules to identify vulnerabilities and strengthen system defenses.

## ⚠️ Legal Disclaimer

**THIS TOOL IS FOR AUTHORIZED SECURITY TESTING ONLY**

Use NexusBrute only on systems you own or have explicit written permission to test. Unauthorized access to computer systems is illegal and punishable by law. The developers assume no liability for misuse of this software.

---

## 🚀 Features Overview

NexusBrute includes **14 specialized security testing modules**:

1. **Smart Brute Force** - Intelligent credential testing
2. **Password Generator** - Cryptographically secure password generation
3. **Rate Limit Checker** - API rate limit detection
4. **Wordlist Optimizer** - Password list optimization
5. **API Fuzzer** - Comprehensive API security testing
6. **SQL Injection Tester** - Automated SQLi detection
7. **DDoS Tester** - Load testing and stress analysis
8. **JWT Analyzer** - JWT security testing
9. **Header Injection Tester** - HTTP header vulnerability scanner
10. **WebSocket Security Tester** - Real-time WebSocket testing
11. **Subdomain Enumerator** - Advanced subdomain discovery
12. **Multi-Target Campaign Manager** - Orchestrate multi-target tests
13. **SSL/TLS Analyzer** - Certificate and protocol security
14. **Authentication Bypass Tester** - Authentication vulnerability scanner

---

## 📦 Installation

```bash
git clone https://github.com/PicoBaz/NexusBrute.git
cd NexusBrute
npm install axios chalk ws
mkdir results wordlists keys
node index.js
```

### Prerequisites
- Node.js v14 or higher
- npm or yarn

---

## 🔥 Module Details

### 1. 🔓 Smart Brute Force

Intelligent login testing with rate-limiting and proxy support.

**Features:**
- Multiple username/password combinations
- Configurable delays between attempts
- Proxy rotation support
- Success/failure tracking
- Real-time progress monitoring
- Automatic retry logic

**Configuration:**
```json
{
  "smartBrute": {
    "targetUrl": "https://example.com/login",
    "usernames": ["admin", "user", "root"],
    "passwords": ["password123", "admin123"],
    "delay": 1000,
    "maxAttempts": 100,
    "useProxy": false
  }
}
```

**Use Cases:**
- Testing password policies
- Validating account lockout mechanisms
- Brute force resistance testing

---

### 2. 🔑 Password Generator

Generate cryptographically secure passwords with customizable complexity.

**Features:**
- Cryptographic randomness (crypto.randomInt)
- Customizable length and character sets
- Special character inclusion
- Bulk password generation
- Password strength analysis (8-point scale)
- Strength ratings: Very Strong/Strong/Medium/Weak
- Statistical distribution analysis

**Configuration:**
```json
{
  "passwordGenerator": {
    "length": 16,
    "count": 10,
    "includeSpecialChars": true
  }
}
```

**Strength Analysis:**
- Lowercase letters check
- Uppercase letters check
- Number inclusion
- Special characters
- Length validation
- Overall strength score

---

### 3. ⏱️ Rate Limit Checker

Detect and analyze API rate limiting mechanisms.

**Features:**
- Automatic rate limit detection
- Response time tracking
- Rate limit header extraction (10+ header types)
- Request success/failure statistics
- HTTP 429 detection
- Status code distribution analysis

**Configuration:**
```json
{
  "rateLimitChecker": {
    "targetUrl": "https://api.example.com/endpoint",
    "maxRequests": 100,
    "interval": 1000,
    "useProxy": false
  }
}
```

**Detection Methods:**
- HTTP 429 status codes
- X-RateLimit-* headers
- Error message analysis
- Response pattern recognition

---

### 4. 📝 Wordlist Optimizer

Optimize and clean password/wordlists for efficient testing.

**Features:**
- Duplicate removal
- Length-based filtering
- Smart sorting (by length or alphabetically)
- Statistical analysis (min/max/avg length)
- Length distribution breakdown
- Before/After comparison
- Reduction percentage calculation

**Configuration:**
```json
{
  "wordlistOptimizer": {
    "inputFile": "wordlist.txt",
    "outputFile": "optimized_wordlist.txt",
    "minLength": 6,
    "removeDuplicates": true,
    "sortByLength": true
  }
}
```

**Optimization Process:**
1. Read and parse wordlist
2. Filter by minimum length
3. Remove duplicates
4. Sort (by length or alphabetically)
5. Save optimized list

---

### 5. 🔍 API Fuzzer

Comprehensive API security testing with automatic vulnerability detection.

**Features:**
- Multiple HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Custom payload injection
- Automatic vulnerability detection
- Server error identification (500)
- Payload reflection detection
- Error disclosure analysis
- Response pattern matching

**Configuration:**
```json
{
  "apiFuzzer": {
    "targetUrl": "https://api.example.com/endpoint",
    "methods": ["GET", "POST", "PUT"],
    "payloads": ["test", "admin", "1' OR '1'='1"],
    "maxAttempts": 50,
    "delay": 500,
    "useProxy": false
  }
}
```

**Vulnerability Detection:**
- Server errors (500)
- Payload reflection in responses
- Error message disclosure
- Suspicious response patterns

---

### 6. 💉 SQL Injection Tester

Automated SQL injection vulnerability detection with advanced pattern matching.

**Features:**
- 10+ default SQL injection payloads
- Custom payload file support
- 18+ SQL error pattern detection
- Multi-field testing
- Vulnerability severity classification
- Error-based detection
- Blind SQLi indicators

**Configuration:**
```json
{
  "sqlInjection": {
    "targetUrl": "https://example.com/login",
    "payloadFile": "payloads/sql_payloads.json",
    "fields": ["username", "password", "id"],
    "maxAttempts": 20,
    "delay": 1000,
    "useProxy": false
  }
}
```

**Detection Patterns:**
- SQL syntax errors
- MySQL/PostgreSQL/Oracle errors
- Database-specific error messages
- Suspicious response patterns
- Server error triggers

**Default Payloads:**
- Boolean-based: `' OR '1'='1`
- Union-based: `1' UNION SELECT NULL--`
- Error-based: `' AND 1=0 UNION ALL SELECT`
- Time-based: `' WAITFOR DELAY '00:00:05'--`

---

### 7. 💥 DDoS Tester

Load testing and stress analysis for web applications.

**Features:**
- Concurrent request simulation
- Configurable request rates (requests/second)
- Batch processing
- Response time tracking
- Success/failure statistics
- Status code distribution
- Actual RPS calculation

**Configuration:**
```json
{
  "ddosTester": {
    "targetUrl": "https://example.com",
    "requestCount": 1000,
    "concurrentRequests": 10,
    "requestsPerSecond": 50,
    "method": "GET",
    "payload": {},
    "useProxy": false
  }
}
```

**Metrics:**
- Total requests sent
- Successful/failed requests
- Average response time
- Actual requests per second
- Status code breakdown

---

### 8. 🔐 JWT Analyzer

Advanced JWT security testing with multiple attack vectors.

**Features:**
- Complete JWT token parsing and decoding
- Security vulnerability detection
- None Algorithm Attack
- HMAC secret bruteforce (HS256/384/512)
- Key Confusion Attack (RS256→HS256)
- Claims manipulation testing
- Expiration validation
- Sensitive data detection in payloads

**Configuration:**
```json
{
  "jwtAnalyzer": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "targetUrl": "https://api.example.com/protected",
    "wordlistFile": "wordlists/jwt_secrets.txt",
    "publicKeyFile": "keys/public.pem",
    "testClaims": {
      "role": "admin",
      "isAdmin": true
    },
    "useProxy": false
  }
}
```

**Attack Vectors:**
- None Algorithm: Bypass signature verification
- Secret Bruteforce: Test 500+ attempts/second
- Key Confusion: RS256 to HS256 conversion
- Claims Manipulation: Role elevation attempts

**Vulnerability Detection:**
- Weak HMAC secrets
- Missing expiration (exp claim)
- Long-lived tokens (>1 year)
- Sensitive data in payload
- Algorithm vulnerabilities

---

### 9. 🔬 Header Injection Tester

Comprehensive HTTP header vulnerability scanner.

**Features:**
- CRLF Injection testing (10+ payloads)
- Host Header Injection (9 attack scenarios)
- X-Forwarded-For manipulation (11 payloads × 5 headers)
- Header Value Injection (6 headers × 7 payloads)
- Automatic vulnerability detection
- 116+ total test combinations

**Configuration:**
```json
{
  "headerInjection": {
    "targetUrl": "https://example.com",
    "testTypes": ["all"],
    "delay": 500,
    "useProxy": false
  }
}
```

**Test Types:**
- `"all"` - Run all tests
- `"crlf"` - CRLF injection only
- `"host"` - Host header only
- `"xff"` - X-Forwarded-For only
- `"value"` - Header value injection only

**Vulnerability Detection:**
- CRLF Injection (HIGH)
- Host Header Poisoning (HIGH)
- IP Spoofing (MEDIUM)
- XSS via headers (HIGH)
- SQLi via headers (HIGH)

---

### 10. 🔌 WebSocket Security Tester

Advanced WebSocket vulnerability scanner with real-time testing.

**Features:**
- Connection security testing (ws:// vs wss://)
- Origin validation bypass (8 malicious origins)
- Message injection (15+ payloads)
- CSRF protection validation
- Rate limiting analysis
- Authentication bypass testing (5 techniques)
- DoS testing (large messages, connection flooding)
- Real-time message logging

**Configuration:**
```json
{
  "websocketTester": {
    "targetUrl": "wss://example.com/ws",
    "testTypes": ["all"],
    "delay": 500,
    "rateLimitTest": {
      "maxMessages": 100,
      "interval": 10
    }
  }
}
```

**Test Types:**
- Connection security
- Origin validation
- Message injection
- CSRF protection
- Rate limiting
- Authentication bypass
- Denial of Service

**Payloads:**
- XSS: `<script>alert(1)</script>`
- SQLi: `' OR '1'='1`
- Path Traversal: `../../../etc/passwd`
- Template Injection: `{{7*7}}`
- NoSQL Injection: `{"$gt":""}`
- Prototype Pollution: `__proto__`

---

### 11. 🌐 Subdomain Enumerator

Advanced subdomain discovery and reconnaissance toolkit.

**Features:**
- DNS Bruteforce (200+ default subdomains)
- Certificate Transparency log mining (crt.sh)
- Permutation scanning (dev-, staging-, prod-, etc.)
- Wildcard DNS detection
- DNS Zone Transfer testing
- HTTP/HTTPS accessibility probing
- Subdomain takeover detection (10+ services)
- Complete DNS record analysis (A, AAAA, CNAME, MX, TXT)

**Configuration:**
```json
{
  "subdomainEnumerator": {
    "domain": "example.com",
    "methods": ["all"],
    "wordlistFile": "wordlists/subdomains.txt",
    "delay": 100,
    "checkWildcard": true
  }
}
```

**Enumeration Methods:**
- `"all"` - Run all methods
- `"bruteforce"` - DNS bruteforce only
- `"crt"` - Certificate Transparency only
- `"permutation"` - Permutation scanning only
- `"zonetransfer"` - Zone transfer testing only

**Takeover Detection:**
- GitHub Pages (github.io)
- Heroku (herokuapp.com)
- AWS S3 (s3.amazonaws.com)
- Azure (azurewebsites.net)
- Shopify, Tumblr, WordPress, Ghost, Bitbucket, Fastly

---

### 12. 🎯 Multi-Target Campaign Manager

Advanced orchestration system for coordinating security tests across multiple targets.

**Features:**
- Sequential & Parallel execution modes
- Multi-module support per target
- Target management from JSON files
- Smart queue scheduling
- Real-time campaign monitoring
- Vulnerability aggregation across targets
- Comprehensive campaign statistics
- Automated report generation with recommendations
- Batch processing (configurable concurrency)

**Configuration:**
```json
{
  "campaignManager": {
    "campaignName": "Security Assessment 2025",
    "mode": "sequential",
    "targetsFile": "campaign-targets.json",
    "modules": [
      {
        "name": "headerInjection",
        "config": { "testTypes": ["all"] }
      },
      {
        "name": "subdomainEnumerator",
        "config": { "methods": ["crt"] }
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

**Execution Modes:**
- **Sequential**: Tests targets one-by-one (predictable, rate-friendly)
- **Parallel**: Tests multiple targets simultaneously (faster, scalable)

**Supported Modules:**
- smartBrute, jwtAnalyzer, headerInjection
- websocketTester, subdomainEnumerator
- sqlInjection, apiFuzzer

**Report Generation:**
- Campaign summary and statistics
- Target-level vulnerability breakdown
- Success/failure metrics
- Security recommendations
- Time tracking

---

### 13. 🔒 SSL/TLS Analyzer

Comprehensive SSL/TLS security testing and certificate analysis.

**Features:**
- Protocol version testing (SSLv3, TLS 1.0/1.1/1.2/1.3)
- Cipher suite analysis and weak cipher detection
- Certificate validation and expiration checking
- Self-signed certificate detection
- Key size validation (minimum 2048-bit)
- Signature algorithm analysis
- Certificate chain verification
- Subject Alternative Names enumeration
- HTTP to HTTPS redirect testing
- HSTS validation (Strict-Transport-Security)

**Configuration:**
```json
{
  "sslAnalyzer": {
    "target": "example.com"
  }
}
```

**Protocol Detection:**
- SSLv3 (CRITICAL if supported)
- TLS 1.0 (HIGH if supported)
- TLS 1.1 (HIGH if supported)
- TLS 1.2 (Secure)
- TLS 1.3 (Secure)

**Weak Ciphers:**
- RC4, DES, 3DES
- MD5, NULL
- EXPORT, Anonymous

**HSTS Validation:**
- Header presence check
- max-age validation (1 year minimum)
- includeSubDomains directive
- preload directive

---

### 14. 🔐 Authentication Bypass Tester ⭐ NEW!

Comprehensive authentication vulnerability scanner with multiple attack vectors.

**Features:**
- Default credentials testing (20+ combinations)
- Session fixation vulnerability detection
- Cookie manipulation testing (8 bypass techniques)
- JWT token manipulation (3 attack vectors)
- Password reset vulnerability testing
- Selective test execution
- Severity-based classification
- Real-time progress tracking

**Configuration:**
```json
{
  "authBypass": {
    "targetUrl": "https://example.com/login",
    "passwordResetUrl": "https://example.com/reset-password",
    "jwtToken": "",
    "tests": ["all"],
    "delay": 500,
    "useProxy": false
  }
}
```

**Test Categories:**

**1. Default Credentials (20 combinations):**
- admin:admin, admin:password, admin:12345
- root:root, root:toor
- administrator:administrator
- guest:guest, user:user, test:test
- And 11 more...

**2. Session Fixation:**
- Pre-set session ID acceptance
- Session regeneration validation
- Session hijacking potential

**3. Cookie Manipulation (8 techniques):**
- admin=true, isAdmin=1
- role=admin, user_type=admin
- authenticated=true, logged_in=1
- auth=1, is_authenticated=true

**4. JWT Token Manipulation:**
- None Algorithm Attack
- Role manipulation (admin elevation)
- User ID tampering

**5. Password Reset:**
- Token reusability testing
- Predictable token detection
- Empty token bypass

---

## 🎯 Quick Start

### Running the Tool

```bash
node index.js
```

### Main Menu

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
12. Multi-Target Campaign Manager
13. SSL/TLS Analyzer
14. Authentication Bypass Tester
15. Exit
```

### Output Options

After each module completes:
1. **JSON** - Structured data for programmatic access
2. **CSV** - Spreadsheet-compatible format
3. **Both** - Both formats simultaneously
4. **Console Only** - Display without saving

---

## 📊 Example Workflows

### Basic Security Audit

```bash
# 1. SSL/TLS Check
Select: 13 (SSL/TLS Analyzer)

# 2. Subdomain Discovery
Select: 11 (Subdomain Enumerator)

# 3. Header Security
Select: 9 (Header Injection Tester)

# 4. Authentication Testing
Select: 14 (Authentication Bypass Tester)
```

### API Security Assessment

```bash
# 1. Rate Limiting
Select: 3 (Rate Limit Checker)

# 2. API Fuzzing
Select: 5 (API Fuzzer)

# 3. SQL Injection
Select: 6 (SQL Injection Tester)

# 4. JWT Analysis
Select: 8 (JWT Analyzer)
```

### Multi-Target Campaign

```bash
# 1. Create campaign-targets.json
# 2. Configure campaign in config.json
# 3. Select: 12 (Multi-Target Campaign Manager)
# 4. Review generated report
```

---

## 🔧 Advanced Configuration

### Global Proxy Settings

```json
{
  "proxies": [
    {
      "host": "proxy1.example.com",
      "port": 8080,
      "protocol": "http"
    },
    {
      "host": "proxy2.example.com",
      "port": 3128,
      "protocol": "https"
    }
  ]
}
```

### Campaign Targets File

`campaign-targets.json`:
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

## 🐛 Troubleshooting

### Common Issues

**Problem**: Module not loading
- **Solution**: Ensure all files are in correct directories

**Problem**: Connection timeout
- **Solution**: Check target accessibility, adjust timeout

**Problem**: Rate limiting detected
- **Solution**: Increase delays between requests

**Problem**: Proxy connection failed
- **Solution**: Verify proxy configuration and connectivity

---

## 📖 Best Practices

1. **Authorization**: Always obtain written permission
2. **Test Environments**: Use staging/dev systems first
3. **Rate Limiting**: Use appropriate delays
4. **Documentation**: Keep detailed test logs
5. **Responsible Disclosure**: Report vulnerabilities ethically
6. **Regular Updates**: Keep NexusBrute updated
7. **Backup Data**: Ensure targets have backups
8. **Legal Compliance**: Follow local laws and regulations

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Follow existing code structure
4. Add tests for new features
5. Update documentation
6. Submit a Pull Request

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

**Remember: With great power comes great responsibility. Use NexusBrute ethically and legally.** 🌌

Made with ❤️ by the security community