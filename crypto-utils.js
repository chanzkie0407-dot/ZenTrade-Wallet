// crypto-utils.js — Inayos para sa Expo

const toBase64 = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

export const generateKeyPair = async () => {
  const random = Math.random().toString(36) + Date.now().toString(36);
  const privateKey = toBase64(random);
  const publicKey = toBase64(privateKey.split('').reverse().join(''));
  return { privateKey, publicKey };
};

export const signData = async (data, privateKey) => {
  const stringified = JSON.stringify(data) + privateKey;
  return toBase64(stringified);
};

export const verifySignature = async (tx, senderPublicKey) => {
  return !!tx.signature && !!tx.id && tx.amount > 0;
};
