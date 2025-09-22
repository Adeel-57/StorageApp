import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";
import { newUserRegistration } from "../utils/authServices.js";

export const googleLogin = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, name, picture, sub } = req.data;
    let user = await User.findOne({ email });

    if (!user) {
      user = await newUserRegistration({
        email,
        name,
        imageURL: picture,
        password: sub,
        session,
      });
      res.statusCode = 201;
    } else {
      res.statusCode = 200;
    }

    // Limit sessions to 2 devices per user
    const registeredDevices = await Session.find({ userId: user._id });
    if (registeredDevices.length >= 2) {
      await registeredDevices[0].deleteOne();
    }

    const newSession = await Session.create({ userId: user._id });
    res.cookie("sid", newSession.id, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "None",
      secure: true,
    });

    await session.commitTransaction();
    return res.json({
      msg: res.statusCode === 201 ? "Registration Successful!" : "Login Successful!",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
