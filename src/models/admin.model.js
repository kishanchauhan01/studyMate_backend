import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  instituteId: {
    type: Schema.Types.ObjectId,
    ref: "Institute",
    required: true,
  },
});

adminSchema.set("autoIndex", true);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const Admin = mongoose.model("Admin", adminSchema);
