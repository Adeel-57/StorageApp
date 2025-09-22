import express from "express";
import multer from "multer";
import checkuser from "../utils/userAuth.js";
import {
  allUsers,
  sendOTP,
  userDetails,
  userLogin,
  userLogout,
  userLogoutAllDevices,
  userRegistration,
  varifyOTP,
} from "../controllers/userControllers.js";

const router = express.Router();
const formParser = multer();
router.use(express.json());

//users OTP send route
router.post("/send-otp", formParser.fields(["email"]), sendOTP);

//users OTP varify route
router.post("/otp-verify", formParser.fields(["email", "otp"]), varifyOTP);

//users registration route
router.post("/register", formParser.single("profileImg"), userRegistration);

//users login route
router.post("/login", formParser.fields(["email", "password"]), userLogin);

//users logout route
router.post("/logout", userLogout);

//users logoutAll route
router.post("/logoutAll/:userId", userLogoutAllDevices);

//Get Allusers route
router.get(
  "/users",
  checkuser,
  (req, res, next) => {
    const user = req.user;
    if (!user.userRole === "User") return next();
    return res.status(401).json({ error: "Un-authorized User" });
  },
  allUsers
);

//user details route
router.get("/?*", checkuser, userDetails);

export default router;
