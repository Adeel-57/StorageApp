import express from "express";
import { googleLogin } from "../controllers/authControllers.js";
import { OAuth2Client } from "google-auth-library";

const clientID =
  "520513079843-6ng2r1pgsrmh3dhspo2fh2s79o0kmmkg.apps.googleusercontent.com";
const clientSecret = "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";
const redirectUri = "http://localhost:5173";

const router = express.Router();
router.use(express.json());

//users google-auth route
router.post(
  "/google",
  async (req, res, next) => {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ error: "Invalid request!" });
      const client = new OAuth2Client({ clientID, clientSecret, redirectUri });
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
