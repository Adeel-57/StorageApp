import path from "node:path";
import { rm } from "fs/promises";
import { ObjectId } from "mongodb";
import { createWriteStream } from "node:fs";
import { File } from "../models/fileModel.js";
import { Directory } from "../models/directoryModel.js";

export const PostFile = async (req, res) => {
  const { 0: parentId } = req.params;
  const directoryId = parentId || req.user._id.toString();
  const parentDirectory = await Directory.findOne({ _id: directoryId }).lean();
  const fileName = req.headers.filename;
  if (!parentDirectory || !fileName)
    return res.status(403).json({ error: "File could not be uploaded!" });
  const fileExtension = path.extname(fileName);
  const fileID = new ObjectId();
  // const writeStream = createWriteStream(
  //   `./storage/${fileID.toString()}${fileExtension}`
  // );
  // req.pipe(writeStream);
  req.on("error", async () => {
    return await rm(`./storage/${fileID.toString()}${fileExtension}`);
  });
  req.on("end", async () => {
    if (req.complete) {
      await File.insertOne({
        _id: fileID,
        name: fileName,
        dirLocation: directoryId,
        uid: req.user._id,
        ext: fileExtension,
      });
      return res.status(201).json({ msg: "File uploaded successfully" });
    }
    next("error");
  });
};

export const ReadFile = async (req, res, next) => {
  const { fileId } = req.params;
  const uid = req.user._id;
  const fileData = await File.findOne({ _id: fileId, uid }).lean();
  if (!fileData) return res.status(404).json({ error: "File Not Found!" });
  if (req.query.action == "download") {
    res.set("Content-Disposition", `attachment ; filename=${fileData.name}`);
  }
  try {
    res.sendFile(`${process.cwd()}/storage/${fileId}${fileData.ext}`);
  } catch (err) {
    next(err);
  }
};

export const ReadProfile = (req, res) => {
  const { imgId } = req.params;
  res.sendFile(`${process.cwd()}/profileUploads/${imgId}`);
};

export const UpdateFile = async (req, res) => {
  const { newName, id } = JSON.parse(req.headers.filename);
  const uid = req.user._id;
  const fileData = await File.findOne({ _id: id, uid });
  if (!fileData || !newName)
    return res.status(403).json({ error: "File Rename Failed!" });
  fileData.name = newName;
  fileData.save();
  return res.status(200).json({ msg: "File Renamed Successfully!" });
};

export const DeleteFile = async (req, res) => {
  const { fileID: id } = req.params;
  const uid = req.user._id;
  const file = await File.findOne({ _id: id, uid });
  if (!file) return res.status(404).json({ error: "File Not Found!" });
  await rm(`./storage/${id}${file.ext}`);
  await file.deleteOne();
  return res.status(200).json({ msg: "File Deleted Successfully!" });
};
