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

//Initialize dataBase conection and Middlewares
conectToDb(async (err) => {
  if (!err) {
    app.listen(4000);
  } else {
    await mongoose.disconnect();
    process.exit(0);
  }
});

//parsing cookies
export const mySecretKey = "storage-demo-key-12345";
app.use(cookieParser(mySecretKey));

//setting cors policy
const origins = ["http://localhost:5173", "http://localhost:3000"];
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
  console.log("The End");
  process.exit(0);
});
