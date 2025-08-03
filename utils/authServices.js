import { User } from "../models/userModel.js";
import { Directory } from "../models/directoryModel.js";

export const newUserRegistration = async (perem) => {
  const userInserted = await User.insertOne(
    {
      name: perem.name,
      email: perem.email,
      password: perem.password,
      profileImg: perem.imageURL,
    },
    { session: perem.session }
  );
  await Directory.insertOne(
    {
      _id: userInserted._id,
      name: "root",
      dirLocation: null,
      uid: userInserted._id,
    },
    { session: perem.session }
  );
  return userInserted;
};
