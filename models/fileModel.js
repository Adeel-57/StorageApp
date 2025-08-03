import { model, Schema } from "mongoose";

const fileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  dirLocation: {
    type: String,
    required: true,
    ref: "File",
  },
  uid: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  ext: {
    type: String,
    required: true,
  },
});

export const File = model("File", fileSchema);
