import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otpRefId: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  email: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export const Otp = mongoose.model("Otp", otpSchema);
