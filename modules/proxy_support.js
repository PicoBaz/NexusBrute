const axios = require('axios');
const chalk = require('chalk');

// Create axios instance with proxy
function createProxyAxios(proxyConfig) {
    const { host, port, protocol } = proxyConfig;
    if (!host || !port || !protocol) {
        console.error(chalk.red('[ERROR] Invalid proxy configuration. Using direct connection.'));
        return axios;
    }

    const proxyUrl = `${protocol}://${host}:${port}`;
    console.log(chalk.cyan(`[PROXY] Using proxy: ${proxyUrl}`));

    return axios.create({
        proxy: {
            host,
            port,
            protocol
        }
    });
}

module.exports = { createProxyAxios };