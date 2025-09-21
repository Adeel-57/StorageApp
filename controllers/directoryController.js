import { ObjectId } from "mongodb";
import { rm } from "node:fs/promises";
import { File } from "../models/fileModel.js";
import { Directory } from "../models/directoryModel.js";
import { updateDirectoriesSize } from "./fileControllers.js";

export const CreatePath = async (id) => {
  let path = [id];
  const parentDirectory = await Directory.findById(id);
  if (!parentDirectory) return path;
  if (parentDirectory.dirLocation) {
    const parentPath = await CreatePath(
      new ObjectId(parentDirectory.dirLocation)
    );
    path = [...parentPath, ...path];
  }
  return path;
};

export const CreateDirectory = async (req, res, next) => {
  const { 0: parentId } = req.params;
  const parentDirId = parentId || req.user._id.toString();
  const dirName = req.headers.dirname || "New Folder";
  // const dirName = "";
  try {
    const parentDirectory = await Directory.findOne({ _id: parentDirId });
    if (!parentDirectory || !dirName)
      return res.status(403).json({ error: "Directory could not be created!" });
    const insertedDirectory = await Directory.create({
      name: dirName,
      dirLocation: parentDirId,
      uid: req.user._id,
    });
    const newPath = await CreatePath(insertedDirectory._id);
    insertedDirectory.path = newPath;
    await insertedDirectory.save();
    parentDirectory.numberOfFolders += 1;
    await parentDirectory.save();
    return res.status(201).json({ msg: "Directory created successfully!" });
  } catch (error) {
    next(error);
  }
};

export const ReadDirectory = async (req, res, next) => {
  try {
    const { 0: dirId } = req.params;
    const uid = req.user._id;
    const directoryId = dirId || req.user._id.toString();
    const directoryData = await Directory.findOne({
      _id: directoryId,
      uid,
    }).lean();
    if (!directoryData)
      return res.status(404).json({ error: "No Such Directory Exist!" });
    const { _id, name, dirLocation, numberOfFiles, numberOfFolders, path } =
      directoryData;
    const id = _id.toString();
    const pathData = await updatePath(path);
    const foundFiles = await File.find({ dirLocation: id }).lean();
    let files = await updateItems(foundFiles);
    const foundDirectories = await Directory.find({ dirLocation: id }).lean();
    let directories = await updateItems(foundDirectories);

    return res.status(200).json({
      id,
      name,
      dirLocation,
      numberOfFiles,
      numberOfFolders,
      path: pathData,
      files,
      directories,
      size: directoryData.size,
    });
  } catch (error) {
    next(error);
  }
};

async function updateItems(itemsArray) {
  let updatedItems = [];
  for (const item of itemsArray) {
    const { _id, path, ...rest } = item;
    const id = _id.toString();
    const newpath = await updatePath(path);
    updatedItems.push({ id, path: newpath, ...rest });
  }
  return updatedItems;
}
async function updatePath(path) {
  const updatedPath = await Directory.find({
    _id: { $in: path },
  }).select({
    _id: 1,
    name: 1,
  });
  return updatedPath;
}

export const UpdateDirectory = async (req, res, next) => {
  try {
    const { 0: id } = req.params;
    const newName = req.headers.dirname;
    const uid = req.user._id;
    const directoryData = await Directory.findOne({ _id: id, uid }).lean();
    if (!directoryData || !newName)
      return res.status(403).json({ error: "Directory Rename Failed!" });
    await Directory.findByIdAndUpdate(id, { name: newName });
    return res.status(200).json({ msg: "Directory Renamed Successfully!" });
  } catch (error) {
    next(error);
  }
};

export const DeleteDirectory = async (req, res, next) => {
  try {
    const { dirId: id } = req.params;
    const uid = req.user._id;
    const directory = await Directory.findOne({ _id: id, uid }).lean();
    if (!directory)
      return res.status(404).json({ error: "No Such Directory Found!" });
    const parentDirectory = await Directory.findOne({
      _id: directory.dirLocation,
    });
    parentDirectory.numberOfFolders -= 1;
    await parentDirectory.save();
    const { Directories, Files } = await getDirectoryContent(id);
    // await Promise.all(
    //   Files.map(async ({ _id, ext }) => {
    //      await rm(`./storage/${_id.toString()}${ext}`);
    //   })
    // );
    await File.deleteMany({ _id: { $in: Files.map((f) => f._id) } });
    await Directory.deleteMany({
      _id: { $in: [...Directories.map((d) => d._id), new ObjectId(id)] },
    });

    await updateDirectoriesSize(directory.dirLocation, -directory.size);
    return res.status(200).json({ message: "Directory Deleted Successfully!" });
  } catch (error) {
    next(error);
  }
};

async function getDirectoryContent(id) {
  let Directories = await Directory.find({ dirLocation: id }).select({
    _id: 1,
  });
  let Files = await File.find({ dirLocation: id }).select({ _id: 1, ext: 1 });

  for (const dirId of Directories) {
    const { Directories: subDirectories, Files: subFiles } =
      await getDirectoryContent(dirId.id);
    Directories = [...Directories, ...subDirectories];
    Files = [...Files, ...subFiles];
  }

  return { Directories, Files };
}
