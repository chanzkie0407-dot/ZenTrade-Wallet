// Simplified crypto utilities
export const generateKeyPair = async () => {
  const random = Math.random().toString(36) + Date.now().toString(36);
  const privateKey = btoa(random);
  const publicKey = btoa(privateKey.split('').reverse().join(''));
  return { privateKey, publicKey };
};

export const signData = async (data, privateKey) => {
  const stringified = JSON.stringify(data) + privateKey;
  return btoa(stringified);
};

export const verifySignature = async (tx, senderPublicKey) => {
  return !!tx.signature && !!tx.id && tx.amount > 0;
};
