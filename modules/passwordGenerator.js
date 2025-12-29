const chalk = require('chalk');
const crypto = require('crypto');

class PasswordGenerator {
    constructor(config) {
        this.config = config;
        this.results = [];
    }

    getCharacterSet() {
        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        if (this.config.includeSpecialChars) {
            chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        }

        return chars;
    }

    generateSecurePassword(length) {
        const chars = this.getCharacterSet();
        let password = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, chars.length);
            password += chars[randomIndex];
        }

        return password;
    }

    analyzePasswordStrength(password) {
        let strength = 0;
        const checks = {
            hasLower: /[a-z]/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
            length: password.length,
        };

        if (checks.hasLower) strength += 1;
        if (checks.hasUpper) strength += 1;
        if (checks.hasNumber) strength += 1;
        if (checks.hasSpecial) strength += 2;
        if (checks.length >= 12) strength += 2;
        if (checks.length >= 16) strength += 1;

        let rating = 'Weak';
        if (strength >= 7) rating = 'Very Strong';
        else if (strength >= 5) rating = 'Strong';
        else if (strength >= 3) rating = 'Medium';

        return {
            strength,
            rating,
            checks,
        };
    }

    generate() {
        console.log(chalk.bold.cyan('\n🔐 Password Generator Started\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white(`Length: ${this.config.length}`));
        console.log(chalk.white(`Count: ${this.config.count}`));
        console.log(chalk.white(`Special Characters: ${this.config.includeSpecialChars ? 'Yes' : 'No'}`));
        console.log(chalk.gray('='.repeat(60)));

        const passwords = [];
        const strengthStats = {
            'Very Strong': 0,
            'Strong': 0,
            'Medium': 0,
            'Weak': 0,
        };

        console.log(chalk.yellow('\n🔑 Generated Passwords:\n'));

        for (let i = 0; i < this.config.count; i++) {
            const password = this.generateSecurePassword(this.config.length);
            const analysis = this.analyzePasswordStrength(password);

            passwords.push({
                index: i + 1,
                password,
                strength: analysis.strength,
                rating: analysis.rating,
                checks: analysis.checks,
                timestamp: new Date().toISOString(),
            });

            strengthStats[analysis.rating]++;

            let strengthColor = chalk.white;
            if (analysis.rating === 'Very Strong') strengthColor = chalk.green;
            else if (analysis.rating === 'Strong') strengthColor = chalk.cyan;
            else if (analysis.rating === 'Medium') strengthColor = chalk.yellow;
            else strengthColor = chalk.red;

            console.log(chalk.white(`${i + 1}. ${password}`));
            console.log(strengthColor(`   Strength: ${analysis.rating} (Score: ${analysis.strength}/8)`));
        }

        console.log(chalk.bold.cyan('\n\n📊 Password Strength Statistics\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.green(`Very Strong: ${strengthStats['Very Strong']} (${((strengthStats['Very Strong'] / this.config.count) * 100).toFixed(1)}%)`));
        console.log(chalk.cyan(`Strong: ${strengthStats['Strong']} (${((strengthStats['Strong'] / this.config.count) * 100).toFixed(1)}%)`));
        console.log(chalk.yellow(`Medium: ${strengthStats['Medium']} (${((strengthStats['Medium'] / this.config.count) * 100).toFixed(1)}%)`));
        console.log(chalk.red(`Weak: ${strengthStats['Weak']} (${((strengthStats['Weak'] / this.config.count) * 100).toFixed(1)}%)`));
        console.log(chalk.gray('='.repeat(60)));

        const finalResults = {
            timestamp: new Date().toISOString(),
            configuration: {
                length: this.config.length,
                count: this.config.count,
                includeSpecialChars: this.config.includeSpecialChars,
            },
            passwords,
            statistics: strengthStats,
        };

        this.results.push(finalResults);

        console.log(chalk.bold.green('\n✅ Password Generation Complete!\n'));

        return passwords.map(p => p.password);
    }

    run() {
        return this.generate();
    }

    exportJSON(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }

    exportCSV(filename) {
        const fs = require('fs');
        const csvRows = ['Index,Password,Strength Score,Rating,Has Lowercase,Has Uppercase,Has Number,Has Special,Length'];

        this.results.forEach(result => {
            result.passwords.forEach(pwd => {
                csvRows.push(
                    `${pwd.index},"${pwd.password}",${pwd.strength},"${pwd.rating}",${pwd.checks.hasLower},${pwd.checks.hasUpper},${pwd.checks.hasNumber},${pwd.checks.hasSpecial},${pwd.checks.length}`
                );
            });
        });

        fs.writeFileSync(filename, csvRows.join('\n'));
        console.log(chalk.green(`\n✅ Results exported to ${filename}`));
    }
}

module.exports = PasswordGenerator;