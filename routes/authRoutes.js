import express from "express";
import { googleLogin } from "../controllers/authControllers.js";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
router.use(express.json());
const {
  CLIENT_ID: client_id,
  CLIENT_SECRET: clientSecret,
  REDIRECT_URI: redirectUri,
} = process.env;
//users google-auth route
router.post(
  "/google",
  async (req, res, next) => {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ error: "Invalid request!" });
      const client = new OAuth2Client({ client_id, clientSecret, redirectUri });
      const responseTicket = await client.verifyIdToken({ idToken });
      const data = responseTicket.getPayload();
      req.data = data;
      next();
    } catch (err) {
      next(err); // forward to Express error middleware
    }
  },
  googleLogin
);

export default router;
