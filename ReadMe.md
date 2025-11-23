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

### 🔌 **WebSocket Security Tester** ⭐ NEW!
Advanced WebSocket vulnerability scanner with real-time testing capabilities:
- **Connection Security Testing**: Validates ws:// vs wss:// protocol security
- **Origin Validation**: Tests for origin bypass and CORS misconfigurations
- **Message Injection**: 15+ payloads testing XSS, SQLi, path traversal, template injection
- **CSRF Protection**: Validates WebSocket CSRF protection mechanisms
- **Rate Limiting Analysis**: Tests message flooding and rate limit enforcement
- **Authentication Bypass**: 5 authentication bypass techniques
- **Denial of Service**: Large message and connection flooding tests
- **Real-time Monitoring**: Live message logging and analysis
- **Severity Classification**: CRITICAL/HIGH/MEDIUM/LOW risk ratings
- **Export Support**: JSON and CSV output formats

### 🔬 **Header Injection Tester**
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

npm install axios chalk ws

mkdir results
mkdir wordlists
mkdir keys
```

---

## ⚙️ Configuration

Edit `config.json` to customize module settings:

### WebSocket Security Tester Configuration

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

**Parameters:**
- `targetUrl`: WebSocket URL to test (required) - supports ws:// and wss://
- `testTypes`: Array of test types to run (required)
  - `"all"`: Run all tests (recommended)
  - `"connection"`: Connection security only
  - `"origin"`: Origin validation only
  - `"injection"`: Message injection only
  - `"csrf"`: CSRF protection only
  - `"ratelimit"`: Rate limiting only
  - `"auth"`: Authentication bypass only
  - `"dos"`: Denial of service only
- `delay`: Delay between requests in milliseconds (default: 500)
- `rateLimitTest`: Rate limit testing configuration
  - `maxMessages`: Maximum messages to send (default: 100)
  - `interval`: Interval between messages in ms (default: 10)

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

### Other Modules Configuration

See previous documentation sections for Smart Brute, Password Generator, Rate Limit Checker, Wordlist Optimizer, API Fuzzer, SQL Injection, DDoS Tester, and Proxy configurations.

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
9. Header Injection Tester
10. WebSocket Security Tester 🔌
11. Exit
```

### WebSocket Security Tester Example

1. **Configure your target** in `config.json`:
```json
{
  "websocketTester": {
    "targetUrl": "wss://echo.websocket.org",
    "testTypes": ["all"],
    "delay": 500,
    "rateLimitTest": {
      "maxMessages": 50,
      "interval": 10
    }
  }
}
```

2. **Run the tester**:
```bash
node index.js
```

3. **Select option 10**

### Output Options

After each module completes, you can export results in:
- **JSON**: Structured data for programmatic access
- **CSV**: Spreadsheet-compatible format
- **Both**: Both formats simultaneously
- **Console Only**: Display results without saving

---

## 📊 Output Examples

### WebSocket Security Tester Output

**Console Output:**
```
🔌 WebSocket Security Tester Started
================================================================
Target: wss://example.com/ws
Delay: 500ms
================================================================

🔍 Testing Connection Security...
Testing wss://...
✓ wss:// connection successful
Testing ws://...
✗ ws:// connection failed

🔍 Testing Origin Validation...
Testing origin 1/8...
✗ VULNERABILITY: Origin 'http://evil.com' accepted

🔍 Testing Message Injection...
✓ Connected to WebSocket
Testing payload 15/15...
✗ VULNERABILITY: Payload reflected
Payload: <script>alert("XSS")</script>

🔍 Testing CSRF Protection...
Testing No Authentication...
✗ VULNERABILITY: No Authentication

🔍 Testing Rate Limiting...
✓ Connected to WebSocket
Sending message 100/100...
✗ VULNERABILITY: No rate limiting detected (100+ messages allowed)

🔍 Testing Authentication Bypass...
Testing No Token...
✗ VULNERABILITY: No Token bypassed authentication

🔍 Testing Denial of Service...
✓ Connected to WebSocket
Testing large message (10MB)...
✗ VULNERABILITY: Large message accepted
Testing connection flooding...
✗ VULNERABILITY: 10 rapid connections allowed

📊 Test Summary
================================================================

⚠️  Total Vulnerabilities Found: 8

originValidation: 1 vulnerabilities
messageInjection: 1 vulnerabilities
csrfProtection: 1 vulnerabilities
rateLimiting: 1 vulnerabilities
authenticationBypass: 1 vulnerabilities
denialOfService: 2 vulnerabilities

Time elapsed: 45.67s
================================================================

✅ WebSocket Security Testing Complete!
```

**JSON Export:**
```json
{
  "timestamp": "2025-11-23T10:30:00.000Z",
  "targetUrl": "wss://example.com/ws",
  "tests": {
    "connectionSecurity": [
      {
        "protocol": "wss://",
        "connected": true,
        "secure": true,
        "vulnerability": null
      }
    ],
    "originValidation": [
      {
        "origin": "http://evil.com",
        "accepted": true,
        "vulnerability": {
          "type": "ORIGIN_VALIDATION_BYPASS",
          "severity": "HIGH",
          "description": "Server accepted connection from untrusted origin: http://evil.com"
        }
      }
    ],
    "messageInjection": [
      {
        "payload": "<script>alert(\"XSS\")</script>",
        "reflected": true,
        "vulnerability": {
          "type": "MESSAGE_INJECTION",
          "severity": "HIGH",
          "description": "Payload reflected in WebSocket response without sanitization"
        }
      }
    ]
  },
  "summary": {
    "totalVulnerabilities": 8,
    "timeElapsed": "45.67"
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
- **Connection Management**: Automatic cleanup and resource management

---

## 📚 Module Details

### WebSocket Security Tester Features

#### 1. Connection Security Testing
- Tests both ws:// (insecure) and wss:// (secure) protocols
- Identifies unencrypted WebSocket connections
- Validates SSL/TLS implementation
- Reports protocol downgrade vulnerabilities

#### 2. Origin Validation
- Tests 8 different malicious origins:
  - null origin
  - External domains (http://evil.com, https://evil.com)
  - localhost
  - file:// protocol
  - Path traversal attempts
  - XSS payloads in origin header
- Detects CORS misconfigurations
- Identifies origin bypass vulnerabilities

#### 3. Message Injection
- 15+ comprehensive payloads:
  - **XSS**: Multiple variants including DOM-based
  - **SQL Injection**: Classic and modern techniques
  - **Path Traversal**: Directory traversal attempts
  - **Template Injection**: Multiple template engines
  - **NoSQL Injection**: MongoDB specific payloads
  - **Prototype Pollution**: JavaScript object manipulation
  - **Null Byte Injection**: Binary data injection
- Real-time response analysis
- Payload reflection detection
- Sanitization bypass testing

#### 4. CSRF Protection
- Tests 3 authentication scenarios:
  - No authentication headers
  - Missing CSRF tokens
  - Invalid CSRF tokens
- Validates WebSocket-specific CSRF protections
- Tests sensitive operation execution

#### 5. Rate Limiting
- Configurable message flooding
- Measures messages accepted before rate limit
- Tests burst vs sustained rate limits
- Identifies DoS vulnerabilities

#### 6. Authentication Bypass
- 5 bypass techniques:
  - No token
  - Invalid token
  - Expired token
  - Malformed token
  - None algorithm JWT
- Tests authentication enforcement
- Validates token verification

#### 7. Denial of Service
- Large message testing (up to 10MB)
- Connection flooding (multiple rapid connections)
- Resource exhaustion detection
- Server stability analysis

---

## 🔧 Advanced Usage

### Custom Test Selection

Run specific tests only:

```json
{
  "websocketTester": {
    "targetUrl": "wss://example.com/ws",
    "testTypes": ["injection", "csrf", "auth"],
    "delay": 1000
  }
}
```

### Testing Multiple WebSocket Endpoints

Create a script:

```javascript
const WebSocketTester = require('./modules/websocketTester');

const endpoints = [
  'wss://api.example.com/ws',
  'wss://chat.example.com/socket',
  'wss://notifications.example.com/updates'
];

for (const endpoint of endpoints) {
  const tester = new WebSocketTester({
    targetUrl: endpoint,
    testTypes: ['all'],
    delay: 500
  });
  await tester.run();
}
```

---

## 🐛 Troubleshooting

### WebSocket Security Tester Issues

**Problem**: "Connection timeout"
- **Solution**: Check if WebSocket server is accessible and increase timeout in code if needed

**Problem**: "WebSocket is not defined"
- **Solution**: Install ws package: `npm install ws`

**Problem**: "All tests show no vulnerabilities"
- **Solution**: Great! This means the WebSocket implementation is secure

**Problem**: "Connection refused"
- **Solution**: Verify the WebSocket URL is correct and server is running

**Problem**: "Too many false positives"
- **Solution**: Focus on CRITICAL and HIGH severity findings, review test configuration

---

## 📖 Best Practices

1. **Always Get Authorization**: Obtain written permission before testing
2. **Use Isolated Environments**: Test in controlled, non-production environments
3. **Rate Limiting**: Use appropriate delays to avoid service disruption
4. **Logging**: Keep detailed logs of all testing activities
5. **Responsible Disclosure**: Report vulnerabilities responsibly
6. **Stay Updated**: Keep NexusBrute and dependencies up to date
7. **Backup Data**: Ensure targets have backups before destructive tests
8. **WebSocket Specifics**: Be aware that WebSocket connections are persistent and stateful

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
- WebSocket support via [ws](https://github.com/websockets/ws)
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