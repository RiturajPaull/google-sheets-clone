const mongoose = require("mongoose");
// const MONGO_URI = process.env.MONGO_URI;

const URL =
  "mongodb+srv://rituraj:warwar11@cluster0.nfcm1.mongodb.net/google_sheet?retryWrites=true&w=majority&appName=Cluster0";
const connectDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = connectDB;
