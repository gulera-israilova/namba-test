import * as crypto from 'crypto';

const randomString = (len: number, charSet = '') => {
  charSet =
    charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
};

const createHash = (value: string, key: string): string => {
  if (!value) {
    throw new Error(`Error An empty required parameter was passed: value`);
  }
  if (!key) {
    throw new Error(`Error An empty required parameter was passed: key`);
  }

  const valueToHash = value + key;
  return crypto.createHash('sha256').update(valueToHash).digest('hex');
};

const verifyHash = (value: string, key: string, hash: string): boolean => {
  if (!value) {
    throw new Error(`Error An empty required parameter was passed: value`);
  }
  if (!key) {
    throw new Error(`Error An empty required parameter was passed: key`);
  }
  if (!hash) {
    throw new Error(`Error An empty required parameter was passed: hash`);
  }

  const valueToHash = value + key;
  return hash == crypto.createHash('sha256').update(valueToHash).digest('hex');
};

export { randomString, createHash, verifyHash };
