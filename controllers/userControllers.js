import path from "node:path";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { OTP } from "../models/otpModel.js";
import { writeFile } from "node:fs/promises";
import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";
import { newUserRegistration } from "../utils/authServices.js";

export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true }
    );
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
    //   auth: {
    //     user: "adeeljatt557@gmail.com",
    //     pass: "vxou clbm hdsi ezec",
    //   },
    // });
    // const info = await transporter.sendMail({
    //   from: '"Storage App" <adeeljatt557@gmail.com>',
    //   to: `${email}`,
    //   subject: "OTP",
    //   html: `<p>An varification OTP sent at ${email}</p>
    //   <b>${otp}</b>`,
    // });
    return res
      .status(201)
      .json({ msg: `An varification OTP sent at ${email}` });
  } catch (error) {
    next(error);
  }
};

export const varifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const isEmailDocoment = await OTP.findOneAndUpdate(
      { email, otp },
      { verified: true }
    );
    if (!isEmailDocoment) {
      return res.status(401).json({ error: `Invalid or expired OTP` });
    } else {
      return res
        .status(200)
        .json({ msg: `Your eamil ${email} successfuly varified` });
    }
  } catch (error) {
    next(error);
  }
};

export const userRegistration = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (user) {
      return res.status(409).json({ error: "Email already registered!" });
    }
    const isEmailDocument = await OTP.findOne({ email });
    if (!isEmailDocument || !isEmailDocument.verified) {
      return res
        .status(401)
        .json({ error: `Please enter a verfied email address` });
    }
    let imageURL = "";
    // if (req.file) {
    //   const imageID = crypto.randomUUID();
    //   const fileExtension = path.extname(req?.file?.originalname);
    //   imageURL = `http://localhost:4000/file/profile/${imageID}${fileExtension}`;
    //   await writeFile(
    //     `./profileUploads/${imageID}${fileExtension}`,
    //     req.file.buffer
    //   );
    // }
    await newUserRegistration({
      email,
      name,
      password,
      imageURL,
      session,
    });
    await session.commitTransaction();
    return res.status(201).json({ msg: "Registration successfull!" });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 121) {
      return res
        .status(400)
        .json({ error: "Invalid inputs, Please enter correct values!" });
    } else {
      next(error);
    }
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Invalid Credentials!" });
  const isPasswordValid = await user.checkPassword(password);
  if (!isPasswordValid) {
    return res.status(404).json({ error: "Invalid Credentials!" });
  }
  const registeredDevices = await Session.find({ userId: user.id });
  if (registeredDevices.length >= 2) {
    registeredDevices[0].deleteOne();
  }
  const newSession = await Session.create({ userId: user._id });
  res.cookie("sid", newSession.id, {
    httpOnly: true,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "None",
    secure: true,
  });
  return res.status(200).json({ msg: "Login Successfull!" });
};

export const userLogout = async (req, res) => {
  const { sid } = req.signedCookies;
  await Session.findOneAndDelete({ _id: sid });
  res.clearCookie("sid");
  return res.status(200).json({ msg: "Logout Successfull!" });
};

export const userLogoutAllDevices = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await Session.deleteMany({ userId });
    return res.status(200).json({ msg: "Logout Successfull!" });
  } catch (error) {
    next(error);
  }
};

export const userDetails = async (req, res) => {
  const { _id, name, email, profileImg, storagePlan } = await User.findOne({
    _id: req.user._id,
  }).lean();
  return res
    .status(200)
    .json({ name, email, imageURL: profileImg, storagePlan });
};

export const allUsers = async (req, res) => {
  const users = await User.find({}).lean();
  const allSessions = (
    await Session.find({}).select(["-_id", "-createdAt", "-__v"])
  ).map(({ userId }) => userId.toHexString());
  const data = users.map((user) => {
    if (allSessions.includes(user._id.toString())) {
      return { ...user, isLoggedIn: true };
    } else {
      return { ...user, isLoggedIn: false };
    }
  });
  return res.status(200).json(data);
};
