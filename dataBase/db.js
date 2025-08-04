import mongoose from "mongoose";
import { MongoClient } from "mongodb";
const dbPath = process.env.DB_PATH;
async function conectToDb(cb) {
  try {
    await mongoose.connect(dbPath);
    console.log("db");
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
