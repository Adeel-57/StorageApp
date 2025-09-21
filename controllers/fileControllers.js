import path from "node:path";
import { rm } from "fs/promises";
import { ObjectId } from "mongodb";
import { createWriteStream } from "node:fs";
import { File } from "../models/fileModel.js";
import { Directory } from "../models/directoryModel.js";
import { CreatePath } from "./directoryController.js";

export const updateDirectoriesSize = async (perDirId, deltaSize) => {
  while (perDirId) {
    const dir = await Directory.findById(perDirId);
    dir.size += deltaSize;
    dir.save();
    perDirId = dir.dirLocation;
  }
};

/** @param {import("express").Request} req @param {import("express").Response} res @param {import("express").NextFunction} next */
/* export const PostFile = async (req, res, next) => {
  const { 0: parentId } = req.params;
  const directoryId = parentId || req.user._id.toString();
  const parentDirectory = await Directory.findOne({ _id: directoryId });
  const fileName = req.headers.filename;
  if (!parentDirectory || !fileName)
    return res.status(403).json({ error: "File could not be uploaded!" });
  const fileExtension = path.extname(fileName);
  const fileID = new ObjectId();
  const writeStream = createWriteStream(
    `./storage/${fileID.toString()}${fileExtension}`
  );
  const filePath = await CreatePath(parentDirectory._id);
  let fileSize = 0;
  req.on("data", (chunk) => {
    let writeData = writeStream.write(chunk);
    if (!writeData) {
      req.pause();
      writeStream.once("drain", () => req.resume());
    }
    fileSize += chunk.length;
    if (req.remainingStorage < fileSize) {
      req.destroy();
    }
  });
  req.on("end", async () => {
    if (req.complete) {
      await File.insertOne({
        _id: fileID,
        name: fileName,
        size: fileSize,
        dirLocation: directoryId,
        uid: req.user._id,
        ext: fileExtension,
        path: filePath,
      });
      parentDirectory.numberOfFiles += 1;
      await parentDirectory.save();
      await updateDirectoriesSize(directoryId, fileSize);
      return res.status(201).json({ msg: "File uploaded successfully" });
    }
  });
  req.on("error", async () => {
    await rm(`./storage/${fileID.toString()}${fileExtension}`);
    next("error");
  });
}; */

export const PostFile = async (req, res, next) => {
  const { 0: parentId } = req.params;
  const directoryId = parentId || req.user._id.toString();
  const parentDirectory = await Directory.findOne({ _id: directoryId });
  const fileName = req.headers.filename;

  if (!parentDirectory || !fileName) {
    return res.status(403).json({ error: "File could not be uploaded!" });
  }

  const fileExtension = path.extname(fileName);
  const fileID = new ObjectId();
  const storagePath = `./storage/${fileID.toString()}${fileExtension}`;
  // const writeStream = createWriteStream(storagePath);
  const filePath = await CreatePath(parentDirectory._id);

  let fileSize = 0;
  let aborted = false;

  // req.on("data", (chunk) => {
  //   if (aborted) return;

  //   fileSize += chunk.length;
  //   if (fileSize > req.remainingStorage) {
  //     aborted = true;
  //     writeStream.destroy();
  //     req.unpipe(writeStream);
  //     rm(storagePath).catch(() => {});
  //     return res.status(413).json({ error: "File exceeds storage limit" });
  //   }

  //   const canContinue = writeStream.write(chunk);
  //   if (!canContinue) {
  //     req.pause();
  //     writeStream.once("drain", () => req.resume());
  //   }
  // });

  req.on("end", async () => {
    if (aborted) return;
    writeStream.end();
    if (req.complete) {
      await File.insertOne({
        _id: fileID,
        name: fileName,
        size: fileSize,
        dirLocation: directoryId,
        uid: req.user._id,
        ext: fileExtension,
        path: filePath,
      });
      parentDirectory.numberOfFiles += 1;
      await parentDirectory.save();
      await updateDirectoriesSize(directoryId, fileSize);
      return res.status(201).json({ msg: "File uploaded successfully" });
    }
  });

  req.on("error", async (err) => {
    if (!aborted) {
      await rm(storagePath).catch(() => {});
      next(err);
    }
  });
};

export const ReadFile = async (req, res, next) => {
  const { fileId } = req.params;
  const uid = req.user._id;
  const fileData = await File.findOne({ _id: fileId, uid }).lean();
  if (!fileData) return res.status(404).json({ error: "File Not Found!" });
  if (req?.query?.action == "download") {
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
  const { 0: id } = req.params;
  const { newFilename } = req.body;
  const uid = req.user._id;
  const fileData = await File.findOne({ _id: id, uid });
  if (!fileData || !newFilename)
    return res.status(403).json({ error: "File Rename Failed!" });
  fileData.name = newFilename;
  fileData.save();
  return res.status(200).json({ msg: "File Renamed Successfully!" });
};

export const DeleteFile = async (req, res) => {
  const { fileID: id } = req.params;
  const uid = req.user._id;
  const file = await File.findOne({ _id: id, uid });
  if (!file) return res.status(404).json({ error: "File Not Found!" });
  // await rm(`./storage/${id}${file.ext}`);
  const parentDirectory = await Directory.findOne({
    _id: file.dirLocation,
  });
  parentDirectory.numberOfFiles -= 1;
  await parentDirectory.save();
  await file.deleteOne();
  await updateDirectoriesSize(file.dirLocation, -file.size);
  return res.status(200).json({ msg: "File Deleted Successfully!" });
};
