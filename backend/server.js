const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./util/connectDB");
const router = require("./routes/spreadsheet.route");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.use("/api/users", router);
connectDB().then(() => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running at ${PORT} `);
    });
  } catch (error) {
    console.error("Error connecting to the Server");
  }
});
