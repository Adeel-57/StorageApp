import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      minLength: 3,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String
    },
    profileImg: {
      type: String
    },
    userRole:{
      type:String,
      enum:['User','Manager','Admin'],
      default:'User',
    },
  },
  {
    optimisticConcurrency: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
});

userSchema.methods.checkPassword = async function (userPassword) {
  return bcrypt.compare(userPassword, this.password);
};

export const User = model("User", userSchema);
