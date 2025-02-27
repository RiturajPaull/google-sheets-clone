const express = require("express");
const router = express.Router();
const {
  PostSpreadsheet,
  GetSpreadsheet,
  GetSpreadsheetById,
  UpdateSpreadsheet,
  DeleteSpreadsheet,
  UpdateSpreadsheet2,
} = require("../controller/spreadsheet.controller");
// directly handling the api calls. Didnot create any controller

router.post("/input", PostSpreadsheet);
router.get("/all-data", GetSpreadsheet);
router.get("/data/:id", GetSpreadsheetById);
router.put("/update-sheet/:id", UpdateSpreadsheet);
router.put("/delete/:id", DeleteSpreadsheet);
router.put("/update-sheet", UpdateSpreadsheet2);
module.exports = router;
