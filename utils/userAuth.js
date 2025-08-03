import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";

//Authenticate user
export default async function checkuser(req, res, next) {
  const { sid } = req.signedCookies;
  try {
    if (!sid) return res.status(401).json({ error: "Un-authorized user" });
    const session = await Session.findOne({ _id: sid });
    if (!session) return res.status(401).json({ error: "Un-authorized user" });
    const user = await User.findOne({ _id: session.userId });
    if (!user) return res.status(401).json({ error: "Un-authorized user" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
