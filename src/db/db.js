import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
  try {
    // const connectionInstance = await mongoose.connect(
    //   `${process.env.MONGODB_URI}/${DB_NAME}`
    // );
      const connectionInstance = await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`)

    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error", error);
    process.exit(1);
  }
};

export default connectDB;
