import express from "express";
import {
  CreateDirectory,
  DeleteDirectory,
  ReadDirectory,
  UpdateDirectory,
} from "../controllers/directoryController.js";

const router = express.Router();

//Create Directories
router.post("/?*", CreateDirectory);

//Read Directories
router.get("/?*", ReadDirectory);

//Update Directories
router.patch("/?*", UpdateDirectory);

//Delete Directories
router.delete("/:dirId", DeleteDirectory);

export default router;
