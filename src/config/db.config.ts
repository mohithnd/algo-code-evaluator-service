import mongoose from "mongoose";

import serverConfig from "./server.config";

async function connectToDB() {
  try {
    await mongoose.connect(serverConfig.MONGO_URI);
    console.log("Successfully Connected To DB");
  } catch (error) {
    console.log("Unable To Connect To The DB Server");
    console.log(error);
    process.exit(1);
  }
}

export default connectToDB;
