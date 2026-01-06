# Changelog

All notable changes to NexusBrute will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.6.0] - 2025-11-27

### Added
- **Authentication Bypass Tester Module**: Comprehensive authentication vulnerability scanner
  - Default credentials testing with 20+ common combinations
  - Session fixation vulnerability detection
  - Cookie manipulation testing (8 bypass techniques)
  - JWT token manipulation (None Algorithm, role manipulation, user ID tampering)
  - Password reset vulnerability testing
  - Automatic vulnerability classification with severity levels
  - Support for selective test execution
  - Real-time progress tracking
  - JSON and CSV export support
- Enhanced module menu with Authentication Bypass Tester option

### Changed
- Updated `config.json` with `authBypass` configuration section
- Updated `index.js` to include Authentication Bypass Tester in main menu (option 14)
- Updated `package.json` to version 2.6.0
- Expanded README.md with comprehensive Authentication Bypass Tester documentation
- Updated module count from 13 to 14 modules

### Security
- Detection of default credentials (CRITICAL severity)
- Session fixation identification (HIGH severity)
- Cookie-based authentication bypass (HIGH severity)
- JWT manipulation vulnerabilities (CRITICAL severity)
- Password reset exploitation (CRITICAL severity)

---

## [2.5.0] - 2025-11-26

### Added
- **SSL/TLS Analyzer Module**: Comprehensive SSL/TLS security testing and certificate analysis
  - SSL/TLS protocol version testing (SSLv3, TLS 1.0, 1.1, 1.2, 1.3)
  - Cipher suite analysis and weak cipher detection
  - Certificate validation and expiration checking
  - Self-signed certificate detection
  - Certificate chain verification
  - Key size validation (RSA, ECDSA)
  - Signature algorithm analysis
  - Subject Alternative Names (SAN) enumeration
  - HTTP to HTTPS redirect testing
  - HSTS (HTTP Strict Transport Security) validation
  - Certificate authority verification
  - Automatic vulnerability classification
  - JSON and CSV export support
- Enhanced module menu with SSL/TLS Analyzer option

### Changed
- Updated `config.json` with `sslAnalyzer` configuration section
- Updated `index.js` to include SSL/TLS Analyzer in main menu (option 13)
- Updated `package.json` to version 2.5.0
- Expanded README.md with comprehensive SSL/TLS Analyzer documentation
- Updated module count from 12 to 13 modules

### Security
- Detection of deprecated SSL/TLS protocols
- Identification of weak cipher suites
- Certificate expiration warnings
- Self-signed certificate alerts
- HSTS misconfiguration detection

---

## [2.4.0] - 2025-11-25

### Added
- **Multi-Target Campaign Manager Module**: Advanced orchestration system for testing multiple targets
  - Sequential and parallel execution modes
  - Support for multiple security modules per target
  - Configurable delays between targets and modules
  - Automatic vulnerability aggregation across all targets
  - Campaign-level reporting and statistics
  - Target prioritization and queue management
  - Batch processing with configurable concurrency
  - Failed operation tracking and retry logic
  - JSON report generation with recommendations
  - Real-time progress tracking and live updates
  - JSON and CSV export support
- Sample campaign targets file (campaign-targets.json)
- Enhanced module menu with Campaign Manager option

### Changed
- Updated `config.json` with `campaignManager` configuration section
- Updated `index.js` to include Campaign Manager in main menu (option 12)
- Updated `package.json` to version 2.4.0
- Expanded README.md with comprehensive Campaign Manager documentation
- Updated module count from 11 to 12 modules

### Features
- Multi-target testing automation
- Intelligent vulnerability correlation
- Comprehensive campaign statistics
- Automated report generation
- Real-time campaign monitoring

---

## [2.3.0] - 2025-11-24

### Added
- **Subdomain Enumerator Module**: Comprehensive subdomain discovery and analysis toolkit
  - DNS bruteforce with custom wordlists (200+ common subdomains included)
  - Certificate Transparency log querying via crt.sh
  - Permutation scanning for discovered subdomains
  - Wildcard DNS detection
  - DNS Zone Transfer testing
  - HTTP/HTTPS accessibility checks
  - CNAME record analysis
  - MX and TXT record enumeration
  - Subdomain takeover vulnerability detection (10+ services)
  - Real-time progress tracking
  - Automatic vulnerability classification
  - JSON and CSV export support
- Comprehensive subdomain wordlist with 200+ entries
- Enhanced module menu with Subdomain Enumerator option

### Changed
- Updated `config.json` with `subdomainEnumerator` configuration section
- Updated `index.js` to include Subdomain Enumerator in main menu (option 11)
- Updated `package.json` to version 2.3.0
- Expanded README.md with comprehensive Subdomain Enumerator documentation
- Updated module count from 10 to 11 modules

### Security
- DNS timeout protection
- Configurable delays to prevent DNS flooding
- Wildcard detection to reduce false positives
- Zone transfer vulnerability detection
- Subdomain takeover detection for multiple cloud services

---

## [2.2.0] - 2025-11-23

### Added
- **WebSocket Security Tester Module**: Comprehensive WebSocket vulnerability scanner
  - Connection security testing (ws:// vs wss://)
  - Origin validation bypass detection with 8 malicious origin scenarios
  - Message injection testing with 15+ payloads (XSS, SQLi, Path Traversal, Template Injection, NoSQL, Prototype Pollution)
  - CSRF protection validation with 3 authentication scenarios
  - Rate limiting analysis with configurable message flooding
  - Authentication bypass testing with 5 different techniques
  - Denial of Service testing (large messages up to 10MB, connection flooding)
  - Real-time message logging and monitoring
  - Automatic vulnerability detection with severity classification
  - JSON and CSV export support
- WebSocket dependency (ws ^8.14.2) added to package.json
- Enhanced module menu with WebSocket Security Tester option

### Changed
- Updated `config.json` with `websocketTester` configuration section
- Updated `index.js` to include WebSocket Security Tester in main menu (option 10)
- Updated `package.json` to version 2.2.0 with ws dependency
- Expanded README.md with comprehensive WebSocket Security Tester documentation
- Updated module count from 9 to 10 modules

### Security
- WebSocket connection timeout protection (10 second default)
- Configurable delays to prevent abuse
- Graceful error handling for connection failures
- Message size validation testing
- Automatic connection cleanup and resource management

---

## [2.1.0] - 2025-11-22

### Added
- **Header Injection Tester Module**: Comprehensive HTTP header vulnerability scanner
  - CRLF Injection testing with 10+ payload variations
  - Host Header Injection detection with 9 attack scenarios
  - X-Forwarded-For manipulation testing across 5 different headers
  - Header Value Injection testing for 6 common headers with 7 payload types
  - Automatic vulnerability detection with intelligent pattern matching
  - Severity classification (CRITICAL/HIGH/MEDIUM/LOW)
  - Real-time progress tracking during tests
  - Detailed vulnerability reporting with proof of concept
  - JSON and CSV export support
- Contact information in README (Email, Telegram, GitHub)
- Enhanced module menu with Header Injection Tester option

### Changed
- Updated `config.json` with `headerInjection` configuration section
- Updated `index.js` to include Header Injection Tester in main menu
- Expanded README.md with comprehensive Header Injection Tester documentation
- Updated module count from 8 to 9 modules

### Security
- All header injection tests include configurable delays to prevent abuse
- Proxy rotation support for distributed testing
- Timeout protection to prevent hanging requests

---

## [2.0.0] - 2025-11-20

### Added
- **JWT Analyzer Module**: Advanced JWT security testing toolkit
  - Token parsing and Base64URL decoding
  - Comprehensive security vulnerability detection
  - None Algorithm Attack testing
  - HMAC secret bruteforce with custom wordlists (HS256/HS384/HS512)
  - Key Confusion Attack (RS256 to HS256)
  - Claims manipulation testing
  - Token expiration analysis
  - Sensitive data detection in payloads
  - Detailed reporting with severity levels
  - JSON and CSV export functionality
- Sample JWT secrets wordlist (`jwt_secrets.txt`)
- JWT Analyzer configuration in `config.json`
- Comprehensive JWT testing documentation in README

### Changed
- Updated main menu to include JWT Analyzer option
- Enhanced README with JWT Analyzer usage examples
- Updated configuration structure for new module

### Performance
- Optimized bruteforce algorithm for 500+ attempts per second
- Memory-efficient wordlist processing

---

## [1.0.0] - 2025-11-10

### Added
- **Smart Brute Force Module**: Intelligent login testing
  - Rate-limited brute force with customizable delays
  - Proxy rotation support
  - Multiple username/password combinations
  - Success/failure tracking
- **Password Generator Module**: Strong password generation
  - Customizable length and complexity
  - Special character inclusion
  - Bulk generation support
  - Cryptographically secure randomization
- **Rate Limit Checker Module**: API rate limit analysis
  - Automated rate limit detection
  - Request timing analysis
  - Threshold identification
- **Wordlist Optimizer Module**: Password list optimization
  - Duplicate removal
  - Length-based filtering
  - Sorting capabilities
  - Memory-efficient processing
- **API Fuzzer Module**: Comprehensive API testing
  - Multiple HTTP method support
  - Custom payload injection
  - Response analysis
  - Vulnerability pattern detection
- **SQL Injection Tester Module**: Automated SQL injection detection
  - Extensive payload database
  - Multiple injection techniques
  - Field-based testing
  - Error-based detection
- **DDoS Tester Module**: Load testing and stress analysis
  - Concurrent request simulation
  - Configurable request rates
  - Multiple HTTP methods
  - Performance monitoring
- **Session Logger Module**: Activity logging
  - Comprehensive audit trails
  - Session tracking
- **Proxy Rotator**: Dynamic proxy management
  - Automatic proxy switching
  - Protocol support (HTTP/HTTPS/SOCKS)
  - Load distribution
- Interactive CLI with color-coded output
- Modular architecture for easy extensibility
- JSON and CSV export functionality
- Comprehensive configuration system
- MIT License

### Documentation
- Complete README with usage examples
- Module-specific documentation
- Configuration guidelines
- Best practices and legal disclaimer
- Contributing guidelines

### Security
- Rate limiting to prevent service disruption
- Configurable delays for ethical testing
- Timeout protection
- Error handling for graceful failures

---

## Release Notes

### [2.2.0] - WebSocket Security Scanner

This release introduces advanced WebSocket vulnerability testing capabilities, expanding NexusBrute's coverage to real-time communication protocols.

**Key Highlights:**
- 135+ test scenarios across 7 attack categories
- Real-time message logging and monitoring
- Intelligent vulnerability detection algorithms
- Comprehensive WebSocket security coverage

**Use Cases:**
- Real-time application security testing (chat, gaming, dashboards)
- WebSocket API security audits
- Bug bounty hunting for WebSocket vulnerabilities
- Security training and research

### [2.1.0] - Header Injection Security Scanner

This release introduces advanced HTTP header vulnerability testing capabilities, making NexusBrute a more complete penetration testing toolkit.

**Key Highlights:**
- 50+ injection payloads across 4 attack categories
- Intelligent vulnerability detection algorithms
- Risk-based severity classification
- Professional reporting format

**Use Cases:**
- Web application security audits
- API security testing
- Bug bounty hunting
- Security compliance validation

### [2.0.0] - JWT Security Arsenal

Major release introducing professional-grade JWT security testing capabilities.

**Key Highlights:**
- Complete JWT token analysis and manipulation
- Multiple attack vectors (None Algorithm, Secret Bruteforce, Key Confusion, Claims Manipulation)
- Automated security vulnerability detection
- Professional penetration testing capabilities

**Use Cases:**
- API authentication security audits
- Token-based authentication testing
- Bug bounty programs
- Security training and research

### [1.0.0] - Initial Release

First stable release of NexusBrute with 8 core security testing modules.

**Core Features:**
- Modular architecture
- Interactive CLI interface
- Multiple export formats
- Proxy rotation support
- Comprehensive documentation

---

## Upgrade Guide

### From 2.5.0 to 2.6.0

1. Pull the latest changes:
```bash
git pull origin main
```

2. Update `config.json` with new `authBypass` section:
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

3. Ensure `authBypass.js` is in `modules/` directory

4. Run the updated tool:
```bash
node index.js
```

### From 2.4.0 to 2.5.0

1. Pull the latest changes:
```bash
git pull origin main
```

2. Update `config.json` with new `sslAnalyzer` section:
```json
{
  "sslAnalyzer": {
    "target": "example.com"
  }
}
```

3. Ensure `sslAnalyzer.js` is in `modules/` directory

4. Run the updated tool:
```bash
node index.js
```

### From 2.3.0 to 2.4.0

1. Pull the latest changes:
```bash
git pull origin main
```

2. Update `config.json` with new `campaignManager` section:
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
      }
    ],
    "generateReport": true
  }
}
```

3. Create campaign targets file `campaign-targets.json`

4. Ensure `campaignManager.js` is in `modules/` directory

5. Run the updated tool:
```bash
node index.js
```

### From 2.2.0 to 2.3.0

1. Pull the latest changes:
```bash
git pull origin main
```

2. Update `config.json` with new `subdomainEnumerator` section:
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

3. Add subdomain wordlist to `wordlists/subdomains.txt`

4. Ensure `subdomainEnumerator.js` is in `modules/` directory

5. Run the updated tool:
```bash
node index.js
```

### From 2.1.0 to 2.2.0

1. Pull the latest changes:
```bash
git pull origin main
```

2. Install new WebSocket dependency:
```bash
npm install ws
```

3. Update `config.json` with new `websocketTester` section:
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

4. Ensure `websocketTester.js` is in `modules/` directory

5. Run the updated tool:
```bash
node index.js
```

### From 2.0.0 to 2.1.0

1. Pull the latest changes:
```bash
git pull origin main
```

2. Update `config.json` with new `headerInjection` section:
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

3. Ensure `headerInjection.js` is in `modules/` directory

4. Run the updated tool:
```bash
node index.js
```

### From 1.0.0 to 2.0.0

1. Pull the latest changes
2. Create required directories:
```bash
mkdir wordlists keys
```

3. Update `config.json` with `jwtAnalyzer` section
4. Add sample wordlist to `wordlists/jwt_secrets.txt`

---

## Links

- [GitHub Repository](https://github.com/PicoBaz/NexusBrute)
- [Report Issues](https://github.com/PicoBaz/NexusBrute/issues)
- [Discussions](https://github.com/PicoBaz/NexusBrute/discussions)

---

**Maintained by**: [@PicoBaz](https://github.com/PicoBaz)  
**Contact**: picobaz3@gmail.com | [@picobaz](https://t.me/picobaz)