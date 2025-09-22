import cors from "cors";
import helmet from "helmet";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import slowDown from "express-slow-down";
import rateLimit from "express-rate-limit";
import checkuser from "./utils/userAuth.js";
import { conectToDb } from "./dataBase/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import filesRouter from "./routes/filesRoutes.js";
import directoriesRouter from "./routes/directoriesRoutes.js";
import serverless from "serverless-http";

const app = express();
const PORT = process.env.PORT || 4000;
const { MYSECRETKEY: secretKey, DB_PATH } = process.env;

// Validate environment variables
if (!secretKey || !DB_PATH) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// Rate limiter middleware (tracks requests per IP)
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 10 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
});
// app.use(limiter); // Apply rate limiter globally

// Slow down middleware for /user route
const userSpeedLimiter = slowDown({
  windowMs: 5 * 60 * 1000, // 5 minutes
  delayAfter: 5, // allow 5 requests per 5 minutes, then start delaying
  delayMs: () => 500, // delay each request by 500ms after the limit
});

// Initialize database connection and middlewares
let connection = false;
app.use((req, res, next) => {
  if (!connection) {
    conectToDb(async (err) => {
      if (!err) {
        connection = true;
        // app.listen(PORT, () => {
        //   console.log(`Server running on port ${PORT}`);
        // });
      } else {
        console.log("Connection to db failed");
        process.exit(0);
      }
    }, DB_PATH);
  }
  next();
});

// Use helmet for security headers
// app.use(helmet());

// Parsing cookies
app.use(cookieParser(secretKey));

// app.use((req, res, next) => {
//   console.log(req.ip);
//   next();
// });

// Setting cors policy
// const origins = [
//   "http://localhost:5173",
//   "http://localhost:3000",
//   "https://storage-app-front-end.vercel.app",
// ];
// app.use(
//   cors({
//     origin: origins,
//     credentials: true,
//   })
// );

// Request routes and user authentication
app.use("/auth", authRouter);
app.use("/user", userSpeedLimiter, userRouter);
app.use("/directory", checkuser, directoriesRouter);
app.use("/file", checkuser, filesRouter);
// app.use("/", (req, res) => {
//   return res
//     .status(401)
//     .json({ error: "This server responds only to authorized APIs" });
// });

// Global error handler middleware
app.use((error, req, res, next) => {
  return res
    .status(500)
    .json({ error: "Something went wrong. Please try again!" });
});

// Graceful shutdown
const shutdown = async () => {
  await mongoose.disconnect();
  console.log("Process exited successfully");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default serverless(app);
