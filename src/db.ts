import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { config } from './__shared__/config';

export const setValueRd = async (key: string, value: string, exp = 60 * 5) => {
  if (!config.REDIS_URI) return;
  try {
    const redis = new Redis(config.REDIS_URI);
    await redis.setex(key, exp, value);
    redis.disconnect();
    console.log(`Key: ${key} set in Redis`);
  } catch (e) {
    console.log('Error in setValueRd: ', e);
  }
};

export const getValueRd = async (key: string) => {
  if (!config.REDIS_URI) return;
  try {
    const redis = new Redis(config.REDIS_URI);
    const value = await redis.get(key);
    redis.disconnect();
    console.log(`Key: ${key} retrieved from Redis`);
    return value;
  } catch (e) {
    console.log('Error in getValueRd: ', e);
  }
};

export const delValueRd = async (key: string) => {
  if (!config.REDIS_URI) return;
  try {
    const redis = new Redis(config.REDIS_URI);
    await redis.del(key);
    redis.disconnect();
    console.log(`Key: ${key} deleted from Redis`);
  } catch (e) {
    console.log('Error in delValueRd: ', e);
  }
};

export const db = new PrismaClient();
