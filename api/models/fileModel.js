import { model, Schema } from "mongoose";
import { type } from "node:os";

const fileSchema = new Schema(
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
    path: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const File = model("File", fileSchema);
