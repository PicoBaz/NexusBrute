const axios = require('axios');
const chalk = require('chalk');
const sessionLogger = require('./sessionLogger');

class ProxyRotator {
    constructor(proxies) {
        this.proxies = proxies;
        this.currentIndex = 0;
        this.failedProxies = new Set();
    }

    getNextProxy() {
        if (this.proxies.length === 0) return null;
        let attempts = 0;
        while (attempts < this.proxies.length) {
            const proxy = this.proxies[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
            if (!this.failedProxies.has(proxy.host + ':' + proxy.port)) {
                return proxy;
            }
            attempts++;
        }
        return null;
    }

    markProxyFailed(proxy) {
        this.failedProxies.add(proxy.host + ':' + proxy.port);
        console.log(chalk.yellow(`[WARN] Proxy failed: ${proxy.host}:${proxy.port}`));
    }

    createAxiosInstance() {
        const proxy = this.getNextProxy();
        if (!proxy) {
            console.log(chalk.red('[ERROR] No available proxies'));
            return axios;
        }
        console.log(chalk.cyan(`[PROXY] Using ${proxy.protocol}://${proxy.host}:${proxy.port}`));
        return axios.create({
            proxy: {
                host: proxy.host,
                port: proxy.port,
                protocol: proxy.protocol
            }
        });
    }

    async createAxiosWithRotation(config, sessionLog) {
        const axiosInstance = this.createAxiosInstance();
        sessionLog.push(await sessionLogger.log(config, {
            operation: 'proxy_rotator',
            details: `Selected proxy: ${axiosInstance.defaults.proxy?.host}:${axiosInstance.defaults.proxy?.port}`
        }));
        return axiosInstance;
    }
}

module.exports = ProxyRotator;
