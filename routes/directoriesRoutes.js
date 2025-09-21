import express from "express";
import {
  CreateDirectory,
  DeleteDirectory,
  ReadDirectory,
  UpdateDirectory,
} from "../controllers/directoryController.js";
import { checkStorageLimit } from "../utils/userAuth.js";

const router = express.Router();

//Create Directories
router.post("/?*", checkStorageLimit, CreateDirectory);

//Read Directories
router.get("/?*", ReadDirectory);

//Update Directories
router.patch("/?*", UpdateDirectory);

//Delete Directories
router.delete("/:dirId", DeleteDirectory);

export default router;
