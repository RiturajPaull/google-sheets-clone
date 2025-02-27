const mongoose = require("mongoose");

const Spreadsheetschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SpreadsheetModel = mongoose.model("Spreadsheet", Spreadsheetschema);

module.exports = SpreadsheetModel;
