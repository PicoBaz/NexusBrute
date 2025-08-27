
# ╭─── NexusBrute v1.0 ───╮

**A Node.js tool for ethical security testing.**  
NexusBrute is designed for security professionals to perform controlled brute-force tests, generate secure passwords, and analyze API rate limits. Built for precision and compliance, it ensures safe and authorized use.

## ╾─ Features
- **Smart Brute**: Controlled login testing with rate-limiting.
- **Password Generator**: Creates strong, customizable passwords.
- **Rate Limit Checker**: Analyzes API request restrictions.
- **Output**: Exports results in JSON and CSV formats.
- **Compliance**: Engineered for ethical, legal testing.

## ╾─ Installation
```bash
git clone https://github.com/PicoBaz/NexusBrute.git
```
```bash
cd NexusBrute
```
```bash
npm install axios chalk
```
```bash
node index.js
```

## ╾─ Configuration
Edit `config.json` to customize:
- `smartBrute`: Target URL, usernames, passwords, delay, max attempts.
- `passwordGenerator`: Password length, count, special characters.
- `rateLimitChecker`: Target URL, max requests, interval.

## ╾─ Sample Output
**brute_results.csv**:
```
Operation,Target,Result,Timestamp,Error
smart_brute,admin:password123,Failed,2025-08-27T15:59:00Z,Unauthorized
password_gen,generated_password,Zq$9xP#2mWn5,2025-08-27T15:59:01Z,
rate_limit,https://example.com/api,Request 1: 200,2025-08-27T15:59:02Z,
```

## ╾─ Important Notice
Use NexusBrute only on systems with explicit permission. Unauthorized use is prohibited and illegal.

## ╾─ License
MIT License. See [LICENSE](LICENSE) for details.

## ╾─ Contribute
Join the project at `https://github.com/PicoBaz/NexusBrute`. Star, fork, or submit a PR to enhance it! 🚀

# ╰──────────────────────╯