import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import checkuser from "./utils/userAuth.js";
import { conectToDb } from "./dataBase/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import filesRouter from "./routes/filesRoutes.js";
import directoriesRouter from "./routes/directoriesRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;
const secretKey = process.env.MYSECRETKEY;

//Initialize dataBase conection and Middlewares
conectToDb(async (err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    console.log("Connecton to db failed");
    await mongoose.disconnect();
    process.exit(0);
  }
});

//parsing cookies
app.use(cookieParser(secretKey));

//setting cors policy
const origins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://storage-app-front-end.vercel.app",
];
app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);

//request routes and user authentication
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/directory", checkuser, directoriesRouter);
app.use("/file", checkuser, filesRouter);

//globel error handler middleware
app.use((error, req, res, next) => {
  return res
    .status(500)
    .json({ error: "Something went wrong. Please try again!" });
  // .json(error);
});

process.on("SIGINT", () => {
  console.log("Process exited successfully");
  process.exit(0);
});
