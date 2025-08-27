# NexusBrute

A sleek, modular brute-force login testing tool built for ethical security audits. NexusBrute empowers developers and security enthusiasts to simulate password attacks on their own systems, highlighting weak credentials and promoting stronger defenses.

⚠️ **Ethical Use Only**: This tool is for testing your own systems or with explicit permission. Misuse can lead to legal consequences. Always prioritize security best practices.

## Features
- **Modular Config**: All settings (URL, usernames, password rules) in a single `config.json` file for quick tweaks.
- **Auto CSRF Extraction**: Seamlessly pulls WP Nonce tokens from WooCommerce/WordPress login pages.
- **Smart Password Generation**: Combines common patterns with random strings for realistic testing.
- **Error Resilience**: Automatic retries on transient errors, with configurable delays to avoid locks.
- **CSV Reporting**: Detailed logs of attempts, including timestamps and response codes.
- **Node.js Powered**: Lightweight, no bloat—runs anywhere with Node.

## Installation
1. Clone the repo:
   ```
   git clone https://github.com/PicoBaz/NexusBrute.git
   cd NexusBrute
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Edit `config.json` to match your setup (e.g., login URL, usernames).

## Usage
Run the script:
```
npm start
```
- Output: Progress in console, results in `brute_force_results.csv`.
- Example config tweak: Increase `maxAttemptsPerUser` for deeper tests, but monitor for rate limits.

## Configuration
Edit `config.json`:
- `loginUrl`: Target login endpoint.
- `usernames`: Array of usernames to test.
- `characters`: Char sets for random passwords.
- `passwordConfig`: Tune lengths, attempts, delays, and retries.

## Extending NexusBrute
- Add custom patterns in `index.js`.
- Integrate with external password lists (e.g., load from TXT files).
- For advanced setups, fork and add parallel processing via worker threads.

## Disclaimer
NexusBrute is an educational tool. Use responsibly—test only what you own. The author assumes no liability for misuse.

## License
MIT License. See [LICENSE](LICENSE) for details.

Star the repo if it helps your audits! 🌟 Contributions welcome.
