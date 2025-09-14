# Changelog

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