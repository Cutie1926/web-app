import CryptoJS from "crypto-js";

// Get encryption key from environment variable or use a default (in production, use secure key management)
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "tars-default-key";

export const encryptMessage = (message: string): string => {
  try {
    return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return message;
  }
};

export const decryptMessage = (encryptedMessage: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedMessage;
  } catch (error) {
    console.error("Decryption error:", error);
    return "[Unable to decrypt message]";
  }
};

export const isEncrypted = (message: string): boolean => {
  // CryptoJS AES output starts with "U2FsdGVkX1" ("Salted__" in base64).
  return /^U2FsdGVkX1/.test(message);
};
