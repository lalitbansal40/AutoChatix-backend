import crypto from "crypto";

type OTPData = {
  otp: string;
  expiresAt: number;
};

const otpStore = new Map<string, OTPData>();

export const generateOTP = (key: string) => {
  const otp = crypto.randomInt(100000, 999999).toString();

  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
  });

  return otp;
};

export const verifyOTP = (key: string, otp: string) => {
  const data = otpStore.get(key);

  if (!data) return false;

  if (Date.now() > data.expiresAt) {
    otpStore.delete(key);
    return false;
  }

  if (data.otp !== otp) return false;

  otpStore.delete(key);
  return true;
};