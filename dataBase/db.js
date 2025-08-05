import mongoose from "mongoose";
import { MongoClient } from "mongodb";

async function conectToDb(cb, dbPath) {
  try {
    console.log(mongoose);
    await mongoose.connect(dbPath);
    // #*Connect to mongodb*#
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
