import { User } from "../models/userModel.js";
import { Directory } from "../models/directoryModel.js";
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

export const checkStorageLimit = async (req, res, next) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Un-authorized user" });
  const { storagePlan } = user;
  let storageLimit;
  switch (storagePlan) {
    case "Free":
      storageLimit = 1 * 1024 * 1024 * 1024; // 1 GB
      break;
    case "Basic":
      storageLimit = 5 * 1024 * 1024 * 1024; // 5 GB
      break;
    case "Premium":
      storageLimit = 10 * 1024 * 1024 * 1024; // 10 GB
      break;
    default:
      storageLimit = 1 * 1024 * 1024 * 1024; // 1 GB
  }
  const storageUsed = (await Directory.findById(user._id))?.size;
  req.remainingStorage = storageLimit - storageUsed;
  if (storageUsed >= storageLimit) {
    return res.status(413).json({ error: "Storage limit exceeded" });
  }
  next();
};
