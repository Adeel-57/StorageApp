import { model, Schema } from "mongoose";

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required:true
  },
  verified:{
    type: Schema.Types.Boolean,
    default:false,
  },
  createdAt: {
    type: Date,
    default:new Date(),
    expires: 600,
  },
});

export const OTP = model("OTP", otpSchema);
