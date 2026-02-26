"use client";

import { useCallback } from "react";
import { encryptMessage, decryptMessage, isEncrypted } from "@/lib/encryption";

export const useEncryption = () => {
  const encrypt = useCallback((message: string): string => {
    if (!message) return "";
    return encryptMessage(message);
  }, []);

  const decrypt = useCallback((encryptedMessage: string): string => {
    if (!encryptedMessage) return "";
    // Only decrypt if it looks encrypted
    if (isEncrypted(encryptedMessage)) {
      return decryptMessage(encryptedMessage);
    }
    return encryptedMessage;
  }, []);

  const checkIsEncrypted = useCallback((message: string): boolean => {
    return isEncrypted(message);
  }, []);

  return {
    encrypt,
    decrypt,
    isEncrypted: checkIsEncrypted,
  };
};
