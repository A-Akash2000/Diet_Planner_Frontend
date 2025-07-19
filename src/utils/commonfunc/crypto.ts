const encoder = new TextEncoder();
const decoder = new TextDecoder();

const keyString = import.meta.env.VITE_SECRET_KEY || '12345678901234567890123456789012'; // Must be 32 characters
const ivLength = 16;

/**
 * Converts a hex string to a Uint8Array.
 */
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

/**
 * Converts a Uint8Array to a hex string.
 */
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generates a CryptoKey from the secret key string.
 */
const getKey = async (): Promise<CryptoKey> => {
  const keyBuffer = encoder.encode(keyString);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypts a string using AES-CBC and returns a hex-encoded string.
 */
export const encrypt = async (text: string): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  const key = await getKey();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    encoder.encode(text)
  );
  return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(encrypted))}`;
};

/**
 * Decrypts a hex-encoded AES-CBC string and returns the original string.
 */

export const decrypt = async <T = string>(data: string): Promise<T> => {
  const [ivHex, encryptedHex] = data.split(':');

  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted data format. Expected format "iv:encryptedData".');
  }
  const iv = hexToBytes(ivHex);
  const encryptedBytes = hexToBytes(encryptedHex);
  const key = await getKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    encryptedBytes
  );
  const decoded = decoder.decode(decrypted);
  try {
    return JSON.parse(decoded) as T;
  } catch {
    return decoded as unknown as T;
  }
};
