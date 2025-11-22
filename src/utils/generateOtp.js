import { nanoid } from "nanoid";

export const generateOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  const otpRefId = nanoid(6);
  return { otp, otpRefId };
};
