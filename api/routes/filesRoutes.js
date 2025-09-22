import express from "express";
import {
  DeleteFile,
  PostFile,
  ReadFile,
  ReadProfile,
  UpdateFile,
} from "../controllers/fileControllers.js";
import { checkStorageLimit } from "../utils/userAuth.js";

const router = express.Router();

router.use(express.json());

//Create Files
router.post("/*", checkStorageLimit, PostFile);

//ReadFiles
router.get("/:fileId", ReadFile);

router.get("/profile/:imgId", ReadProfile);

//UpdateFiles
router.patch("/?*", UpdateFile);

//DeleteFiles
router.delete("/:fileID", DeleteFile);

export default router;
