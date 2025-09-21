import { model, Schema } from "mongoose";

const dirSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
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
    numberOfFiles: {
      type: Number,
      default: 0,
    },
    numberOfFolders: {
      type: Number,
      default: 0,
    },
    path: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Directory = model("Directory", dirSchema);
