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

### 🔒 **SSL/TLS Analyzer** ⭐ NEW!
Comprehensive SSL/TLS security testing and certificate analysis:
- **Protocol Testing**: SSLv3, TLS 1.0, 1.1, 1.2, 1.3 support detection
- **Cipher Suite Analysis**: Weak cipher identification (RC4, DES, 3DES, MD5)
- **Certificate Validation**: Expiration, validity period, and chain verification
- **Self-Signed Detection**: Identifies self-signed certificates
- **Key Size Analysis**: Validates RSA/ECDSA key sizes (minimum 2048-bit)
- **Signature Algorithm**: Detects weak algorithms (SHA-1)
- **SAN Enumeration**: Lists Subject Alternative Names
- **HTTPS Redirect**: Tests HTTP to HTTPS redirection
- **HSTS Validation**: Checks HTTP Strict Transport Security configuration
- **Chain Verification**: Validates complete certificate chain
- **Automated Severity**: CRITICAL/HIGH/MEDIUM/LOW classification
- **Export Support**: JSON and CSV output formats

### 🎯 **Multi-Target Campaign Manager**
Advanced orchestration system for coordinating security tests:
- Sequential & Parallel execution modes
- Multi-module support per target
- Real-time monitoring and vulnerability aggregation
- Automated reporting with recommendations

### 🌐 **Subdomain Enumerator**
Advanced subdomain discovery and reconnaissance:
- DNS Bruteforce, Certificate Transparency
- Permutation scanning, Wildcard detection
- Subdomain takeover detection

### 🔌 **WebSocket Security Tester**
Real-time WebSocket vulnerability scanner:
- Connection security, Origin validation
- Message injection, CSRF protection
- Authentication bypass testing

### 🔬 **Header Injection Tester**
HTTP header vulnerability scanner:
- CRLF Injection, Host Header Injection
- X-Forwarded-For manipulation

### 🔐 **JWT Analyzer**
JWT security analyzer:
- Token decoding, None Algorithm Attack
- Secret bruteforce, Key Confusion

### Additional Modules

- Smart Brute Force, Password Generator
- Rate Limit Checker, Wordlist Optimizer
- API Fuzzer, SQL Injection Tester, DDoS Tester

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

### SSL/TLS Analyzer Configuration

```json
{
  "sslAnalyzer": {
    "target": "example.com"
  }
}
```

**Parameters:**
- `target`: Target domain or hostname (required) - can include port like "example.com:443"

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
12. Multi-Target Campaign Manager
13. SSL/TLS Analyzer 🔒
14. Exit
```

### SSL/TLS Analyzer Example

1. **Configure target** in `config.json`:
```json
{
  "sslAnalyzer": {
    "target": "google.com"
  }
}
```

2. **Run NexusBrute** and select option 13

---

## 📊 Output Examples

### SSL/TLS Analyzer Output

**Console Output:**
```
🔒 SSL/TLS Analyzer Started
================================================================
Target: google.com
================================================================

✓ Successfully connected to google.com:443
  Protocol: TLSv1.3
  Cipher: TLS_AES_256_GCM_SHA384

🔍 Analyzing Certificate...

Certificate Details:
  Subject: *.google.com
  Issuer: GTS CA 1C3
  Valid From: Nov 13 08:21:04 2025 GMT
  Valid To: Feb 05 08:21:03 2026 GMT

✓ Certificate valid (72 days remaining)
✓ Key size: 2048 bits
✓ Signature algorithm: sha256WithRSAEncryption

Subject Alternative Names:
  • *.google.com
  • google.com
  ... and 50 more

🔍 Testing SSL/TLS Protocol Support...
Testing TLSv1.3...
✓ TLSv1.0 not supported
✓ TLSv1.1 not supported
✓ TLSv1.2 not supported
✗ TLSv1.3 supported

🔍 Testing Cipher Suites...

Negotiated Cipher: TLS_AES_256_GCM_SHA384
  Version: TLSv1.3
  Bits: 256
✓ Cipher appears secure

🔍 Testing Certificate Chain...

Certificate Chain (3 certificates):
  1. *.google.com
     Issued by: GTS CA 1C3
  2. GTS CA 1C3
     Issued by: GTS Root R1
  3. GTS Root R1
     Issued by: GTS Root R1

✓ Certificate chain appears valid

🔍 Testing HTTP to HTTPS Redirect...
✓ HTTP redirects to HTTPS

🔍 Testing HSTS...
✓ HSTS header present
  max-age=31536000; includeSubDomains; preload

📊 SSL/TLS Analysis Summary
================================================================

✓ No critical vulnerabilities detected
⚠️  Warnings: 0

Time elapsed: 3.45s
================================================================

✅ SSL/TLS Analysis Complete!
```

**JSON Export:**
```json
{
  "timestamp": "2025-11-26T10:30:00.000Z",
  "target": "google.com",
  "hostname": "google.com",
  "port": 443,
  "tests": {
    "certificateAnalysis": {
      "subject": "*.google.com",
      "issuer": "GTS CA 1C3",
      "validFrom": "Nov 13 08:21:04 2025 GMT",
      "validTo": "Feb 05 08:21:03 2026 GMT",
      "keySize": 2048,
      "signatureAlgorithm": "sha256WithRSAEncryption",
      "vulnerabilities": [],
      "warnings": []
    },
    "protocolSupport": [
      {
        "protocol": "TLSv1.3",
        "supported": true,
        "secure": true,
        "vulnerability": null
      }
    ],
    "hsts": {
      "enabled": true,
      "maxAge": 31536000,
      "includeSubDomains": true,
      "preload": true,
      "warnings": []
    }
  },
  "summary": {
    "totalVulnerabilities": 0,
    "totalWarnings": 0,
    "timeElapsed": "3.45"
  }
}
```

---

## 📚 Module Details

### SSL/TLS Analyzer Features

#### 1. Protocol Version Testing
- Tests support for SSLv3, TLS 1.0, 1.1, 1.2, 1.3
- Identifies deprecated protocols (CRITICAL for SSLv3)
- Recommends TLS 1.2+ only configurations
- Detects protocol downgrade vulnerabilities

#### 2. Cipher Suite Analysis
- Negotiates cipher with target server
- Identifies weak ciphers: RC4, DES, 3DES, MD5, NULL, EXPORT
- Validates cipher strength (bits)
- Reports HIGH severity for weak ciphers

#### 3. Certificate Analysis
- Subject and Issuer information
- Validity period (valid from/to dates)
- Expiration warnings (30 days threshold)
- Self-signed certificate detection
- Key size validation (minimum 2048-bit RSA)
- Signature algorithm analysis (detects SHA-1)
- Subject Alternative Names enumeration
- Serial number and fingerprint

#### 4. Certificate Chain Verification
- Validates complete trust chain
- Lists all intermediate certificates
- Detects incomplete chains (MEDIUM severity)
- Verifies proper certificate hierarchy

#### 5. HTTP to HTTPS Redirect
- Tests if HTTP (port 80) redirects to HTTPS
- Validates redirect status codes (301, 302, 307, 308)
- MEDIUM severity if missing

#### 6. HSTS Configuration
- Checks Strict-Transport-Security header
- Validates max-age duration (recommends 1 year minimum)
- Checks includeSubDomains directive
- Checks preload directive
- MEDIUM severity if missing

---

## 🔧 Advanced Usage

### Test Custom Port

```json
{
  "sslAnalyzer": {
    "target": "example.com:8443"
  }
}
```

### Batch Testing Multiple Domains

```javascript
const SSLAnalyzer = require('./modules/sslAnalyzer');

const domains = ['google.com', 'github.com', 'example.com'];

for (const domain of domains) {
  const analyzer = new SSLAnalyzer({ target: domain });
  await analyzer.run();
}
```

---

## 🐛 Troubleshooting

### SSL/TLS Analyzer Issues

**Problem**: "Failed to connect"
- **Solution**: Check if target is accessible on port 443, verify hostname

**Problem**: "Connection timeout"
- **Solution**: Target may be blocking connections, increase timeout

**Problem**: "Protocol not supported" errors
- **Solution**: Normal behavior, means deprecated protocols are disabled (good!)

**Problem**: "Certificate chain incomplete"
- **Solution**: Server misconfiguration, report to target admin

---

## 📖 Best Practices

1. **Regular Scanning**: Test SSL/TLS configuration regularly
2. **Protocol Updates**: Disable SSLv3, TLS 1.0, TLS 1.1
3. **Strong Ciphers**: Use only modern cipher suites
4. **Certificate Monitoring**: Track expiration dates
5. **HSTS Deployment**: Enable with long max-age
6. **Certificate Transparency**: Monitor CT logs
7. **Key Management**: Use 2048-bit or higher keys
8. **Chain Validation**: Ensure complete certificate chains

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

**Remember: With great power comes great responsibility. Use NexusBrute ethically and legally.** 🌌

Made with ❤️ by the security community