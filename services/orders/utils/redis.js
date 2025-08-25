const Redis = require('ioredis');
const config = require('../shared/config');

class RedisClient {
    constructor() {
        this.client = new Redis(config.redisUrl);
        
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });
    }

    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis GET Error:', error);
            return null;
        }
    }

    async set(key, value, expireSeconds = 3600) {
        try {
            await this.client.set(
                key,
                JSON.stringify(value),
                'EX',
                expireSeconds
            );
            return true;
        } catch (error) {
            console.error('Redis SET Error:', error);
            return false;
        }
    }

    async del(key) {
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Redis DEL Error:', error);
            return false;
        }
    }

    async clearCache() {
        try {
            await this.client.flushdb();
            return true;
        } catch (error) {
            console.error('Redis Clear Cache Error:', error);
            return false;
        }
    }

    generateKey(...parts) {
        return parts.join(':');
    }
}

module.exports = new RedisClient();
