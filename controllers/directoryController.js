import { ObjectId } from "mongodb";
import { rm } from "node:fs/promises";
import { File } from "../models/fileModel.js";
import { Directory } from "../models/directoryModel.js";

export const CreateDirectory = async (req, res, next) => {
  const { 0: parentId } = req.params;
  const parentDirId = parentId || req.user._id.toString();
  const dirName = req.headers.dirname || "New Folder";
  try {
    const parentDirectory = await Directory.findOne({ _id: parentDirId });
    if (!parentDirectory)
      return res.status(403).json({ error: "Directory could not created!" });
    await Directory.insertOne({
      name: dirName,
      dirLocation: parentDirId,
      uid: req.user._id,
    });
    return res.status(201).json({ msg: "Directory created successfuslly!" });
  } catch (error) {
    next(error);
  }
};

export const ReadDirectory = async (req, res) => {
  const { 0: dirId } = req.params;
  const uid = req.user._id;
  const directoryId = dirId || req.user._id.toString();
  const directoryData = await Directory.findOne({ _id: directoryId, uid });
  if (!directoryData)
    return res.status(404).json({ error: "No Such Directory Exist!" });
  const { _id, name, dirLoction } = directoryData;
  const id = _id.toString();
  const foundFiles = await File.find({ dirLocation: id }).lean();
  const files = foundFiles.map(({ _id, ...rest }) => {
    const id = _id.toString();
    return { id, ...rest };
  });
  const foundDirectories = await Directory.find({ dirLocation: id }).lean();
  const directories = foundDirectories.map(({ _id, ...rest }) => {
    const id = _id.toString();
    return { id, ...rest };
  });
  return res.status(200).json({ id, name, dirLoction, files, directories });
};

export const UpdateDirectory = async (req, res) => {
  const { newName, id } = JSON.parse(req.headers.filename);
  const uid = req.user._id;
  const directoryData = await Directory.findOne({ _id: id, uid }).lean();
  if (!directoryData || !newName)
    return res.status(403).json({ error: "Directory Reaname Failed!" });
  await Directory.findByIdAndUpdate({ _id: id }, { name: newName });
  return res.status(200).json({ msg: "Directory Renamed Successfully!" });
};

export const DeleteDirectory = async (req, res, next) => {
  const { dirId: id } = req.params;
  const uid = req.user._id;
  const directory = await Directory.findOne({ _id: id, uid }).lean();
  if (!directory)
    return res.status(404).json({ error: "No Such Directory Found!" });
  try {
    const { Directories, Files } = await deleteDirectory(id);
    Files.map(async ({ _id, ext }) => {
      await rm(`./storage/${_id.toString()}${ext}`);
    });
    await File.deleteMany({ _id: { $in: Files } });
    await Directory.deleteMany({
      _id: { $in: [...Directories, new ObjectId(id)] },
    });
    return res.status(200).json({ message: "Directory Deleted Successfully!" });
  } catch (error) {
    next(error);
  }
};

async function deleteDirectory(id) {
  let Directories = await Directory.find({ dirLocation: id }).select({
    _id: 1,
  });
  let Files = await File.find({ dirLocation: id }).select({ _id: 1, ext: 1 });

  for (const dirId of Directories) {
    const { Directories: subDirectories, Files: subFiles } =
      await deleteDirectory(dirId.toString());
    Directories = [...Directories, ...subDirectories];
    Files = [...Files, ...subFiles];
  }

  return { Directories, Files };
}
