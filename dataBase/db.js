import mongoose from "mongoose";
import { MongoClient } from "mongodb";

async function conectToDb(cb) {
  try {
    await mongoose.connect(
      "mongodb://storageController:storageController123@localhost:27017/storageApp?replicaSet=localReplica"
    );
    
    // client = await MongoClient.connect(
      //   "mongodb://admin:admin123@localhost:27017/admin?replicaSet=localReplica"
      // );
      // db = client.db();

    cb();
  } catch (error) {
    cb(error);
  }
}
export { conectToDb };
