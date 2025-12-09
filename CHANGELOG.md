# Changelog

All notable changes to NexusBrute will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
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


## [v1.3.0] - 2025-09-14
- Added **DDoS Tester** module for controlled distributed stress testing with proxy rotation.
- Updated `index.js` to include DDoS Tester in the CLI menu.
- Added `ddosTester` configuration in `config.json` for request count, concurrency, and rate.
- Strengthened legal warnings in `README.md` and CLI for DDoS Tester.
- Bumped version to `1.3.0` in `package.json` and `README.md`.

## [v1.2.1] - 2025-09-09
- Separated SQL Injection payloads into `payloads/sql_payloads.json` for better modularity.
- Updated `sql_injection.js` to load payloads from `sql_payloads.json`.
- Updated `config.json` to reference `sql_payloads.json` via `payloadFile`.
- Bumped version to `1.2.1` in `package.json` and `README.md`.

## [v1.2.0] - 2025-09-09
- Added **SQL Injection** module for testing forms with SQLi payloads.
- Updated `index.js` to include SQL Injection in the CLI menu.
- Added `sqlInjection` configuration in `config.json` with payloads and fields.
- Strengthened legal warnings in `README.md` and CLI.
- Bumped version to `1.2.0` in `package.json` and `README.md`.

## [v1.1.0] - 2025-08-30
- Added **Proxy Rotator** module for dynamic proxy switching.
- Replaced `proxy_support.js` with `proxy_rotator.js` for enhanced stealth.
- Updated `smart_brute.js`, `rate_limit_checker.js`, and `api_fuzzer.js` to use Proxy Rotator.
- Updated `config.json` to support multiple proxies (`proxies` array).
- Introduced `CHANGELOG.md` for version tracking.

## [v1.0.0] - 2025-08-28
- Initial release with Smart Brute, Password Generator, Rate Limit Checker, Wordlist Optimizer, API Fuzzer, Session Logger, and Interactive CLI.
