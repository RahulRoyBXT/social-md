// require('dotenv').config({path: './env})
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

connectDB().then(() => {
  app.on("error", (error) => {
    console.log("Error", error);
    throw error;
  });
  app.listen(process.env.PORT || 5000, () => {
    console.log(`App is running on PORT ${process.env.PORT}`);
  });
})
.catch(error=> {
    console.log("MongoDB connected wasn't established successfully", error)
})