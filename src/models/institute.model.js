import mongoose, { Schema } from "mongoose";

const instituteSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,

      required: true,
    },

    contact: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: false,
      unique: true,
    },

    address: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
instituteSchema.set("autoIndex", true);

export const Institute = mongoose.model("Institute", instituteSchema);
