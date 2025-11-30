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

### 🌐 **Subdomain Enumerator** ⭐ NEW!
Advanced subdomain discovery and reconnaissance toolkit:
- **DNS Bruteforce**: Custom wordlist-based subdomain discovery (200+ defaults)
- **Certificate Transparency**: Query crt.sh for historical subdomain data
- **Permutation Scanning**: Discover variations of found subdomains
- **Wildcard Detection**: Identify and handle wildcard DNS configurations
- **DNS Zone Transfer**: Test for misconfigured zone transfers
- **HTTP/HTTPS Probing**: Check accessibility and gather service information
- **DNS Record Analysis**: CNAME, MX, TXT record enumeration
- **Subdomain Takeover Detection**: Identify vulnerable CNAMEs for 10+ services
- **Real-time Progress**: Live subdomain discovery tracking
- **Export Support**: JSON and CSV output formats

### 🔌 **WebSocket Security Tester**
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

### Additional Modules

- 🔓 **Smart Brute Force**: Intelligent login testing
- 🔑 **Password Generator**: Strong password generation
- ⏱️ **Rate Limit Checker**: API rate limit analysis
- 📝 **Wordlist Optimizer**: Password list optimization
- 🔍 **API Fuzzer**: Comprehensive API security testing
- 💉 **SQL Injection Tester**: Automated SQL injection detection
- 💥 **DDoS Tester**: Load testing and stress analysis

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

### Subdomain Enumerator Configuration

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

**Parameters:**
- `domain`: Target domain to enumerate (required)
- `methods`: Array of enumeration methods (required)
  - `"all"`: Run all methods (recommended)
  - `"bruteforce"`: DNS bruteforce only
  - `"crt"`: Certificate Transparency only
  - `"permutation"`: Permutation scanning only
  - `"zonetransfer"`: Zone transfer testing only
- `wordlistFile`: Path to subdomain wordlist (optional, uses defaults if not provided)
- `delay`: Delay between DNS queries in milliseconds (default: 100)
- `checkWildcard`: Enable wildcard DNS detection (default: true)

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
10. WebSocket Security Tester
11. Subdomain Enumerator 🌐
12. Exit
```

### Subdomain Enumerator Example

1. **Configure your target** in `config.json`:
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

2. **Run the enumerator**:
```bash
node index.js
```

3. **Select option 11**

### Output Options

After each module completes, you can export results in:
- **JSON**: Structured data for programmatic access
- **CSV**: Spreadsheet-compatible format
- **Both**: Both formats simultaneously
- **Console Only**: Display results without saving

---

## 📊 Output Examples

### Subdomain Enumerator Output

**Console Output:**
```
🌐 Subdomain Enumerator Started
================================================================
Target Domain: example.com
Delay: 100ms
================================================================

🔍 Checking for Wildcard DNS...
✓ No wildcard DNS detected

🔍 Bruteforcing Subdomains...
Testing: 150/200 - api.example.com
✓ Found: www.example.com [93.184.216.34]
  HTTP: 200 - Example Domain
✓ Found: mail.example.com [93.184.216.34]
  HTTP: 200 - Mail Server
✓ Found: api.example.com [93.184.216.34]
  HTTP: 200 - API Gateway

✓ Bruteforce complete: 15 subdomains found

🔍 Querying Certificate Transparency Logs...
Verifying: admin.example.com
✓ Found: admin.example.com [93.184.216.34]
✓ Found: dev.example.com [93.184.216.35]
  ⚠️  Potential takeover: GitHub Pages

✓ Certificate Transparency: 8 subdomains found

🔍 Performing Permutation Scan...
Testing permutation: api-dev.example.com
✓ Found: api-dev.example.com [93.184.216.36]
✓ Found: api-staging.example.com [93.184.216.37]

✓ Permutation scan complete: 5 additional subdomains found

🔍 Testing DNS Zone Transfer...
Found 2 nameservers: ns1.example.com, ns2.example.com
✓ ns1.example.com: Zone transfer refused
✓ ns2.example.com: Zone transfer refused

📊 Enumeration Summary
================================================================

✓ Total Subdomains Found: 28

Discovered Subdomains:
  • admin.example.com
  • api.example.com
  • api-dev.example.com
  • api-staging.example.com
  • dev.example.com
  • mail.example.com
  • www.example.com
  ...

⚠️  Total Vulnerabilities Found: 1

Time elapsed: 45.23s
================================================================

✅ Subdomain Enumeration Complete!
```

**JSON Export:**
```json
{
  "timestamp": "2025-11-24T10:30:00.000Z",
  "domain": "example.com",
  "wildcardCheck": {
    "hasWildcard": false
  },
  "results": {
    "bruteforce": [
      {
        "subdomain": "www.example.com",
        "ips": ["93.184.216.34"],
        "type": "A",
        "http": {
          "accessible": true,
          "protocol": "https://",
          "status": 200,
          "title": "Example Domain",
          "server": "nginx"
        },
        "cname": {
          "hasCNAME": false
        },
        "vulnerabilities": []
      },
      {
        "subdomain": "dev.example.com",
        "ips": ["93.184.216.35"],
        "type": "A",
        "http": {
          "accessible": true,
          "protocol": "https://",
          "status": 200,
          "title": "Development",
          "server": "GitHub Pages"
        },
        "cname": {
          "hasCNAME": true,
          "records": ["username.github.io"]
        },
        "vulnerabilities": [
          {
            "type": "SUBDOMAIN_TAKEOVER",
            "severity": "HIGH",
            "service": "GitHub Pages",
            "cname": "username.github.io",
            "description": "Potential subdomain takeover vulnerability via GitHub Pages"
          }
        ]
      }
    ]
  },
  "summary": {
    "totalSubdomains": 28,
    "totalVulnerabilities": 1,
    "timeElapsed": "45.23"
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
- **DNS Caching**: Efficient resource usage
- **Wildcard Detection**: Reduces false positives

---

## 📚 Module Details

### Subdomain Enumerator Features

#### 1. DNS Bruteforce
- Uses custom wordlists (200+ common subdomains included)
- Concurrent DNS resolution
- Real-time progress tracking
- Configurable delay to prevent rate limiting

#### 2. Certificate Transparency
- Queries crt.sh for historical certificate data
- Discovers subdomains from SSL/TLS certificates
- Verifies discovered subdomains via DNS
- Extracts subdomains from wildcard certificates

#### 3. Permutation Scanning
- Generates variations of discovered subdomains
- Common patterns: -dev, -staging, -prod, -test, etc.
- Numbered variations: 01, 02, 1, 2, etc.
- Prefix and suffix combinations

#### 4. Wildcard Detection
- Tests for wildcard DNS configurations
- Prevents false positives
- Alerts user to potential issues
- Continues enumeration with awareness

#### 5. DNS Zone Transfer
- Tests all nameservers for zone transfer
- Identifies critical misconfigurations
- CRITICAL severity vulnerability
- Extracts all domain records if vulnerable

#### 6. HTTP/HTTPS Probing
- Tests both HTTP and HTTPS
- Extracts page titles
- Identifies server types
- Records status codes

#### 7. DNS Record Analysis
- CNAME records
- MX records (mail servers)
- TXT records (SPF, DKIM, etc.)
- A and AAAA records

#### 8. Subdomain Takeover Detection
- Detects vulnerable CNAME records
- Supports 10+ cloud services:
  - GitHub Pages
  - Heroku
  - AWS S3
  - Azure
  - Shopify
  - Tumblr
  - WordPress.com
  - Ghost.io
  - Bitbucket
  - Fastly
- HIGH severity classification

---

## 🔧 Advanced Usage

### Custom Wordlist

Create `wordlists/subdomains.txt`:
```
www
mail
api
admin
dev
staging
test
blog
shop
portal
```

### Selective Methods

Run only specific enumeration methods:

```json
{
  "subdomainEnumerator": {
    "domain": "example.com",
    "methods": ["bruteforce", "crt"],
    "delay": 50
  }
}
```

### Multiple Domains

```javascript
const SubdomainEnumerator = require('./modules/subdomainEnumerator');

const domains = ['example.com', 'test.com', 'demo.com'];

for (const domain of domains) {
  const enumerator = new SubdomainEnumerator({
    domain,
    methods: ['all'],
    delay: 100
  });
  await enumerator.run();
}
```

---

## 🐛 Troubleshooting

### Subdomain Enumerator Issues

**Problem**: "No subdomains found"
- **Solution**: Try a larger wordlist or enable all enumeration methods

**Problem**: "Too many false positives"
- **Solution**: Wildcard DNS detected - results may be inaccurate for this domain

**Problem**: "DNS timeout errors"
- **Solution**: Increase delay between queries or check internet connection

**Problem**: "Certificate Transparency query failed"
- **Solution**: crt.sh may be down or rate limiting, try again later

**Problem**: "Zone transfer not working"
- **Solution**: Requires `dig` command to be installed (Linux/Mac) or equivalent on Windows

---

## 📖 Best Practices

1. **Always Get Authorization**: Obtain written permission before testing
2. **Use Isolated Environments**: Test in controlled, non-production environments
3. **Rate Limiting**: Use appropriate delays to avoid DNS server abuse
4. **Logging**: Keep detailed logs of all testing activities
5. **Responsible Disclosure**: Report vulnerabilities responsibly
6. **Stay Updated**: Keep NexusBrute and dependencies up to date
7. **Respect DNS**: Don't flood DNS servers with rapid queries
8. **Verify Results**: Always verify discovered subdomains manually

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
- DNS resolution via Node.js built-in dns module
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