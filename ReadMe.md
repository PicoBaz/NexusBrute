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

### 🔐 **JWT Analyzer** ⭐ NEW!
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
# Clone the repository
git clone https://github.com/PicoBaz/NexusBrute.git
cd NexusBrute

# Install dependencies
npm install axios chalk

# Create results directory
mkdir results

# Create wordlists directory (for JWT analyzer)
mkdir wordlists

# Create keys directory (optional, for JWT analyzer)
mkdir keys
```

---

## ⚙️ Configuration

Edit `config.json` to customize module settings:

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

**Parameters:**
- `token`: JWT token to analyze (required)
- `targetUrl`: Protected endpoint to test attacks against (optional)
- `wordlistFile`: Path to wordlist for secret bruteforcing (optional)
- `publicKeyFile`: Path to public key for key confusion attack (optional)
- `testClaims`: Custom claims to test manipulation (optional)
- `useProxy`: Enable proxy rotation (default: false)

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
    },
    {
      "host": "proxy2.example.com",
      "port": 3128,
      "protocol": "https"
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

**SQL Payload File** (`payloads/sql_payloads.json`):
```json
[
  "' OR '1'='1",
  "admin' --",
  "' OR 1=1--",
  "1' UNION SELECT NULL--"
]
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
8. JWT Analyzer 🔐
9. Exit
```

### JWT Analyzer Example

1. **Prepare your JWT token** in `config.json`
2. **Create a wordlist** at `wordlists/jwt_secrets.txt`:
```
secret
password
jwt_secret
your-256-bit-secret
```
3. **Run the analyzer**:
```bash
node index.js
# Select option 8
```

### Output Options

After each module completes, you can export results in:
- **JSON**: Structured data for programmatic access
- **CSV**: Spreadsheet-compatible format
- **Both**: Both formats simultaneously
- **Console Only**: Display results without saving

---

## 📊 Output Examples

### JWT Analyzer Output

**Console Output:**
```
🔐 JWT Analyzer Started
================================================================

📋 Step 1: Parsing JWT Token...
✅ Token parsed successfully

📄 Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

📄 Payload:
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "role": "user"
}

🔍 Step 2: Security Analysis...

⚠️  WARNINGS:

1. HMAC Algorithm
   Using symmetric algorithm - Vulnerable to secret bruteforce
   Severity: MEDIUM

2. No Expiration
   Token has no expiration time (exp claim missing)
   Severity: HIGH

🔍 Testing None Algorithm Attack...
📝 Manipulated Token (alg: none):
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwI...
Server rejected none algorithm (Good!)

🔍 Bruteforcing JWT Secret...
Attempts: 500/1000
✅ SECRET FOUND: "secret"
Time: 2.34s | Attempts: 156

✅ JWT Analysis Complete!
================================================================
```

**JSON Export:**
```json
{
  "timestamp": "2025-11-11T10:30:00.000Z",
  "token": {
    "header": {
      "alg": "HS256",
      "typ": "JWT"
    },
    "payload": {
      "sub": "1234567890",
      "name": "John Doe",
      "role": "user"
    }
  },
  "securityAnalysis": {
    "vulnerabilities": [],
    "warnings": [
      {
        "type": "WARNING",
        "issue": "HMAC Algorithm",
        "description": "Using symmetric algorithm - Vulnerable to secret bruteforce",
        "severity": "MEDIUM"
      }
    ]
  },
  "attackResults": {
    "noneAlgorithm": {
      "success": false,
      "message": "Server rejected none algorithm (Good!)"
    },
    "bruteforce": {
      "success": true,
      "secret": "secret",
      "attempts": 156,
      "timeElapsed": "2.34"
    }
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

### JWT Analyzer Features

#### 1. Token Parsing & Decoding
- Decodes Base64URL encoded JWT components
- Extracts header, payload, and signature
- Validates JWT structure

#### 2. Security Vulnerability Detection
- **None Algorithm**: Detects disabled signature verification
- **Weak Algorithms**: Identifies HMAC usage (bruteforce vulnerable)
- **Missing Expiration**: Checks for `exp` claim
- **Long Expiration**: Warns about tokens valid for over 1 year
- **Sensitive Data**: Scans payload for passwords, secrets, keys

#### 3. None Algorithm Attack
- Modifies `alg` header to `none`
- Removes signature
- Tests against target endpoint
- Reports vulnerability if successful

#### 4. Secret Bruteforce
- Supports HS256, HS384, HS512 algorithms
- Uses custom wordlists
- Real-time progress tracking
- Calculates attempts and time elapsed

#### 5. Key Confusion Attack
- Tests RS256 → HS256 algorithm confusion
- Uses public key as HMAC secret
- Generates manipulated token
- Tests against target endpoint

#### 6. Claims Manipulation
- Modifies payload claims (e.g., role, permissions)
- Keeps original signature
- Tests server-side signature verification
- Reports if server accepts invalid signature

---

## 🔧 Advanced Usage

### Custom Wordlist for JWT Secrets

Create `wordlists/jwt_secrets.txt`:
```
secret
password
123456
admin
jwt_secret
my_secret_key
supersecret
your-256-bit-secret
```

### Testing Multiple JWTs

Modify `config.json` and run multiple times, or create a script:

```javascript
const JWTAnalyzer = require('./modules/jwtAnalyzer');

const tokens = [
  'eyJhbGci...',
  'eyJhbGci...',
  'eyJhbGci...'
];

tokens.forEach(async (token) => {
  const analyzer = new JWTAnalyzer({ token });
  await analyzer.run();
});
```

---

## 🐛 Troubleshooting

### JWT Analyzer Issues

**Problem**: "Invalid JWT format"
- **Solution**: Ensure token has 3 parts separated by dots (header.payload.signature)

**Problem**: "Wordlist file not found"
- **Solution**: Create `wordlists/jwt_secrets.txt` or update path in config

**Problem**: "Server rejected token"
- **Solution**: This is expected if the server has proper security. It means the vulnerability test failed (good for security!)

**Problem**: "Secret not found in wordlist"
- **Solution**: Expand your wordlist or the secret is too strong to bruteforce

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
- **Telegram**: [@PicoBaz](https://t.me/picobaz)
- **Issues**: [GitHub Issues](https://github.com/PicoBaz/NexusBrute/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PicoBaz/NexusBrute/discussions)

---

## 🌟 Star History

If you find NexusBrute useful, please consider giving it a star! ⭐


---

**Remember: With great power comes great responsibility. Use NexusBrute ethically and legally.** 🌌

---

Made with ❤️ by the security community