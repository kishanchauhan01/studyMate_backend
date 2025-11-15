import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log(`
Mongodb connected !! DB HOST: ${connectionInstance.connection.host}
      `);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
