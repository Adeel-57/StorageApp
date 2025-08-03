import { model, Schema } from "mongoose";

const dirSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  dirLocation: {
    type: String,
    default: null,
    ref: "Directory",
  },
  uid: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

export const Directory = model("Directory", dirSchema);
