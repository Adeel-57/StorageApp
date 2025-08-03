import express from "express";
import {
  DeleteFile,
  PostFile,
  ReadFile,
  ReadProfile,
  UpdateFile,
} from "../controllers/fileControllers.js";

const router = express.Router();

//Create Files
router.post("/*", PostFile);

//ReadFiles
router.get("/:fileId", ReadFile);

router.get("/profile/:imgId", ReadProfile);

//UpdateFiles
router.patch("/?*", UpdateFile);

//DeleteFiles
router.delete("/:fileID", DeleteFile);

export default router;
