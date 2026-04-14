import { otpEmailTemplate } from "../templates/otpEmail";
import { sendEmail } from "./sendEmail";

export const sendOTPEmail = async (to: string, otp: string) => {
  return sendEmail({
    to,
    subject: "Your OTP Code - AutoChatix 🔐",
    body: otpEmailTemplate(otp),
    isHtml: true,
  });
};