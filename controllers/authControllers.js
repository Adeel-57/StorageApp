import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";
import { newUserRegistration } from "../utils/authServices.js";

export const googleLogin = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ email: req.data.email });
    if (!user) {
      const newUser = await newUserRegistration({
        email: req.data.email,
        name: req.data.name,
        imageURL: req.data.picture,
        password: req.data.sub,
        session,
      });
      const registeredDevices = await Session.find({ userId: newUser._id });
      if (registeredDevices.length >= 2) {
        await registeredDevices[0].deleteOne();
      }
      const newSession = await Session.create({ userId: newUser._id });
      res.cookie("sid", newSession.id, {
        httpOnly: true,
        signed: true,
        maxAge: 1000 * 60 * 60 * 24,
      });
      await session.commitTransaction();
      return res.status(201).json({ msg: "Registration Successfull!" });
    }
    const registeredDevices = await Session.find({ userId: user._id });
    if (registeredDevices.length >= 2) {
      await registeredDevices[0].deleteOne();
    }
    const newSession = await Session.create({ userId: user._id });
    res.cookie("sid", newSession.id, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    await session.commitTransaction();
    return res.status(200).json({ msg: "Login Successful!" });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  }
};
