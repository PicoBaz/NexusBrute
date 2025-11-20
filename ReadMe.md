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

### 🔬 **Header Injection Tester** ⭐ NEW!
Comprehensive HTTP header vulnerability scanner with advanced injection detection:
- **CRLF Injection Testing**: Detects header splitting and injection vulnerabilities
- **Host Header Injection**: Tests for Host header manipulation and poisoning
- **X-Forwarded-For Manipulation**: Identifies IP spoofing and header reflection
- **Header Value Injection**: Tests multiple headers for XSS, SQLi, and path traversal
- **Automatic Vulnerability Detection**: Intelligent pattern matching for security issues
- **Multiple Attack Vectors**: 50+ payload combinations across 4 attack types
- **Severity Ratings**: CRITICAL/HIGH/MEDIUM/LOW risk classification
- **Detailed Reporting**: Comprehensive vulnerability reports with POC
- **Export Support**: JSON and CSV output formats

### 🔐 **JWT Analyzer**
Advanced JWT (JSON Web Token) security analyzer with multiple attack vectors:
- **Token Decoding & Analysis**: Parse and decode JWT headers and payloads
- **Security Vulnerability Detection**: Identifies common JWT security issues
- **None Algorithm Attack**: Tests for `alg: none` vulnerability
- **Secret Bruteforce**: HMAC secret key bruteforcing with custom wordlists
- **Key Confusion Attack**: Tests RS256 to HS256 algorithm confusion
- **Claims Manipulation**: Tests signature verification by manipulating claims
- **Detailed Reporting**: Comprehensive security analysis with severity levels
- **Export Support**: JSON and CSV output formats

### 🔓 **Smart Brute Force**
Intelligent login testing with advanced features:
- Rate-limited brute force protection
- Proxy rotation support
- Customizable delays and retry limits
- Multiple username/password combinations
- Success/failure tracking

### 🔑 **Password Generator**
Generate strong, secure passwords:
- Customizable length and complexity
- Special character inclusion
- Bulk password generation
- Cryptographically secure randomization

### ⏱️ **Rate Limit Checker**
API rate limit analysis:
- Automated rate limit detection
- Request timing analysis
- Threshold identification
- Proxy support for distributed testing

### 📝 **Wordlist Optimizer**
Streamline password lists:
- Duplicate removal
- Length-based filtering
- Alphabetical or length-based sorting
- Memory-efficient processing

### 🔍 **API Fuzzer**
Comprehensive API security testing:
- Multiple HTTP method support (GET, POST, PUT, DELETE)
- Custom payload injection
- Response analysis
- Vulnerability pattern detection

### 💉 **SQL Injection Tester**
Automated SQL injection detection:
- Extensive payload database
- Multiple injection techniques
- Field-based testing
- Error-based detection
- Customizable test parameters

### 💥 **DDoS Tester**
Load testing and stress analysis:
- Concurrent request simulation
- Configurable request rates
- Multiple HTTP methods
- Performance monitoring

### 🌐 **Proxy Rotator**
Enhance anonymity and bypass restrictions:
- Dynamic proxy switching
- Protocol support (HTTP/HTTPS/SOCKS)
- Automatic proxy validation
- Load distribution

---

## 📦 Installation

### Prerequisites
- Node.js v14 or higher
- npm or yarn

### Setup

```bash
git clone https://github.com/PicoBaz/NexusBrute.git
cd NexusBrute

npm install axios chalk

mkdir results
mkdir wordlists
mkdir keys
```

---

## ⚙️ Configuration

Edit `config.json` to customize module settings:

### Header Injection Configuration

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

**Parameters:**
- `targetUrl`: Target URL to test (required)
- `testTypes`: Array of test types to run (required)
    - `"all"`: Run all tests
    - `"crlf"`: CRLF injection only
    - `"host"`: Host header injection only
    - `"xff"`: X-Forwarded-For manipulation only
    - `"value"`: Header value injection only
- `delay`: Delay between requests in milliseconds (default: 500)
- `useProxy`: Enable proxy rotation (default: false)

### JWT Analyzer Configuration

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

### Smart Brute Configuration

```json
{
  "smartBrute": {
    "targetUrl": "https://example.com/login",
    "usernames": ["admin", "user"],
    "passwords": ["password123", "admin123"],
    "delay": 1000,
    "maxAttempts": 5,
    "useProxy": false
  }
}
```

### Password Generator Configuration

```json
{
  "passwordGenerator": {
    "length": 16,
    "count": 10,
    "includeSpecialChars": true
  }
}
```

### Rate Limit Checker Configuration

```json
{
  "rateLimitChecker": {
    "targetUrl": "https://api.example.com/endpoint",
    "maxRequests": 100,
    "interval": 60000,
    "useProxy": false
  }
}
```

### Proxy Configuration

```json
{
  "proxies": [
    {
      "host": "proxy1.example.com",
      "port": 8080,
      "protocol": "http"
    }
  ]
}
```

### SQL Injection Configuration

```json
{
  "sqlInjection": {
    "targetUrl": "https://example.com/login",
    "payloadFile": "payloads/sql_payloads.json",
    "fields": ["username", "password"],
    "maxAttempts": 20,
    "delay": 1000,
    "useProxy": false
  }
}
```

---

## 🎯 Usage

### Interactive Mode

Start the interactive CLI:

```bash
node index.js
```

You'll see the main menu:

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
9. Header Injection Tester 🔬
10. Exit
```

### Header Injection Tester Example

1. **Configure your target** in `config.json`:
```json
{
  "headerInjection": {
    "targetUrl": "https://example.com/api",
    "testTypes": ["all"],
    "delay": 500,
    "useProxy": false
  }
}
```

2. **Run the tester**:
```bash
node index.js
```

3. **Select option 9**

### Output Options

After each module completes, you can export results in:
- **JSON**: Structured data for programmatic access
- **CSV**: Spreadsheet-compatible format
- **Both**: Both formats simultaneously
- **Console Only**: Display results without saving

---

## 📊 Output Examples

### Header Injection Tester Output

**Console Output:**
```
🔬 Header Injection Tester Started
================================================================
Target: https://example.com/api
Delay: 500ms
================================================================

🔍 Testing CRLF Injection...
Testing payload 10/10...

✗ VULNERABILITY FOUND!
Payload: %0d%0aX-Injected: true
  - CRLF_INJECTION: CRLF characters in payload reflected in response headers

✓ No CRLF injection vulnerabilities detected

🔍 Testing Host Header Injection...
Testing payload 9/9...

✗ VULNERABILITY FOUND!
Host: evil.com
  Status: 200

🔍 Testing X-Forwarded-For Manipulation...
Testing payload 11/11...

✗ VULNERABILITY FOUND!
X-Forwarded-For: 127.0.0.1
  Reflected in response body

🔍 Testing Header Value Injection...
Testing 42/42...

✓ No Header Value injection vulnerabilities detected

📊 Test Summary
================================================================

⚠️  Total Vulnerabilities Found: 3

crlfInjection: 1 issues
hostHeaderInjection: 1 issues
xffManipulation: 1 issues

Time elapsed: 23.45s
================================================================

✅ Header Injection Testing Complete!
```

**JSON Export:**
```json
{
  "timestamp": "2025-11-20T10:30:00.000Z",
  "targetUrl": "https://example.com/api",
  "tests": {
    "crlfInjection": [
      {
        "payload": "%0d%0aX-Injected: true",
        "status": 200,
        "vulnerabilities": [
          {
            "type": "CRLF_INJECTION",
            "severity": "HIGH",
            "description": "CRLF characters in payload reflected in response headers"
          }
        ]
      }
    ],
    "hostHeaderInjection": [
      {
        "payload": "evil.com",
        "status": 200,
        "vulnerability": {
          "type": "HOST_HEADER_INJECTION",
          "severity": "HIGH",
          "description": "Malicious host header 'evil.com' was reflected or accepted"
        }
      }
    ],
    "xffManipulation": [
      {
        "payload": "127.0.0.1",
        "status": 200,
        "vulnerability": {
          "type": "XFF_REFLECTION",
          "severity": "MEDIUM",
          "description": "X-Forwarded-For value '127.0.0.1' reflected in response"
        }
      }
    ]
  },
  "summary": {
    "totalVulnerabilities": 3,
    "timeElapsed": "23.45"
  }
}
```

---

## 🛡️ Security Features

- **Rate Limiting**: Prevents service disruption
- **Proxy Support**: Distributes requests across multiple IPs
- **Configurable Delays**: Mimics human behavior
- **Session Logging**: Comprehensive audit trails
- **Error Handling**: Graceful failure management
- **Timeout Protection**: Prevents hanging requests

---

## 📚 Module Details

### Header Injection Tester Features

#### 1. CRLF Injection Testing
- Tests for carriage return and line feed injection
- Multiple encoding variants (%0d%0a, \r\n, etc.)
- Detects header splitting vulnerabilities
- Tests response header reflection
- Identifies potential for HTTP response splitting

#### 2. Host Header Injection
- Tests Host header manipulation
- Detects cache poisoning vulnerabilities
- Identifies password reset poisoning risks
- Tests for SSRF via Host header
- Multiple payload variations including subdomain takeover attempts

#### 3. X-Forwarded-For Manipulation
- Tests IP spoofing capabilities
- Detects header reflection in responses
- Tests multiple forwarding headers:
    - X-Forwarded-For
    - X-Real-IP
    - X-Originating-IP
    - X-Remote-IP
    - X-Client-IP
- Identifies potential for access control bypass

#### 4. Header Value Injection
- Tests multiple common headers:
    - Referer
    - User-Agent
    - Cookie
    - Origin
    - Accept-Language
    - Accept-Encoding
- Payload types:
    - XSS (Cross-Site Scripting)
    - SQL Injection
    - Path Traversal
    - Template Injection
    - Command Injection

---

## 🔧 Advanced Usage

### Custom Test Types

Run specific test types only:

```json
{
  "headerInjection": {
    "targetUrl": "https://example.com",
    "testTypes": ["crlf", "host"],
    "delay": 500
  }
}
```

### Testing Multiple Targets

Create a script to test multiple targets:

```javascript
const HeaderInjection = require('./modules/headerInjection');

const targets = [
  'https://example1.com',
  'https://example2.com',
  'https://example3.com'
];

targets.forEach(async (target) => {
  const tester = new HeaderInjection({ 
    targetUrl: target,
    testTypes: ['all'],
    delay: 500
  });
  await tester.run();
});
```

---

## 🐛 Troubleshooting

### Header Injection Tester Issues

**Problem**: "Connection timeout"
- **Solution**: Increase delay or check if target is accessible

**Problem**: "All tests return no vulnerabilities"
- **Solution**: This is good! It means the target is secure against header injection attacks

**Problem**: "Too many false positives"
- **Solution**: Review the severity levels and focus on CRITICAL and HIGH findings

**Problem**: "Rate limiting detected"
- **Solution**: Increase delay between requests or enable proxy rotation

---

## 📖 Best Practices

1. **Always Get Authorization**: Obtain written permission before testing
2. **Use Isolated Environments**: Test in controlled, non-production environments
3. **Rate Limiting**: Use appropriate delays to avoid service disruption
4. **Logging**: Keep detailed logs of all testing activities
5. **Responsible Disclosure**: Report vulnerabilities responsibly
6. **Stay Updated**: Keep NexusBrute and dependencies up to date
7. **Backup Data**: Ensure targets have backups before destructive tests

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/NewModule`)
3. Follow the existing code structure and modularity
4. Add tests for new features
5. Update documentation
6. Commit changes (`git commit -m 'Add NewModule'`)
7. Push to branch (`git push origin feature/NewModule`)
8. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Built with [Node.js](https://nodejs.org/)
- Styled with [Chalk](https://github.com/chalk/chalk)
- HTTP requests via [Axios](https://axios-http.com/)
- Inspired by the security research community

---

## 📞 Contact & Support

- **GitHub**: [@PicoBaz](https://github.com/PicoBaz)
- **Email**: picobaz3@gmail.com
- **Telegram**: [@picobaz](https://t.me/picobaz)
- **Issues**: [GitHub Issues](https://github.com/PicoBaz/NexusBrute/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PicoBaz/NexusBrute/discussions)

---

## 🌟 Star History

If you find NexusBrute useful, please consider giving it a star! ⭐


---

**Remember: With great power comes great responsibility. Use NexusBrute ethically and legally.** 🌌

---

Made with ❤️ by the security community