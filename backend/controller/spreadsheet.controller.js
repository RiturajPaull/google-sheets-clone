const SpreadsheetModel = require("../models/Spreadsheet.js");

// post API
async function PostSpreadsheet(req, resp) {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return resp.status(201).json({
        message: "Both the fields are mandatory",
        error: true,
        success: false,
      });
    }

    const spreadsheetData = await SpreadsheetModel.create({ name, data });
    return resp.status(200).json({
      message: "Spreadsheet data saved!",
      error: false,
      success: true,
    });
  } catch (error) {
    return resp.status(400).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get API
async function GetSpreadsheet(req, resp) {
  try {
    const spreadsheetData = await SpreadsheetModel.find();
    return resp.status(200).json(spreadsheetData);
  } catch (error) {
    return resp.status(500).json({
      message: "Error displaying all the data",
      error: true,
      success: false,
    });
  }
}

// get by id API

async function GetSpreadsheetById(req, resp) {
  try {
    const id = req.params.id;

    const user = await SpreadsheetModel.findById(id);
    if (!user) {
      return resp.status(400).json({
        message: "No user found",
        error: true,
        success: false,
      });
    }

    return resp.status(200).json(user);
  } catch (error) {
    return resp.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//update data by ID

async function UpdateSpreadsheet(req, resp) {
  try {
    const { id } = req.params;
    const { name, data } = req.body;

    const userSheet = await SpreadsheetModel.findById(id);
    if (!userSheet) {
      return resp.status(200).json({
        message: "Sheet not found",
        error: true,
        success: false,
      });
    }

    const updatedSheet = await SpreadsheetModel.findByIdAndUpdate(
      id,
      {
        name,
        data,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return resp.status(200).json({
      message: "Spreadsheet upated successfully",
      error: false,
      success: true,
      sheet: updatedSheet,
    });
  } catch (error) {
    return resp.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

async function DeleteSpreadsheet(req, resp) {
  try {
    const { id } = req.params;
    const sheet = await SpreadsheetModel.findById(id);

    if (!sheet) {
      return resp.status(400).json({
        message: "No such sheet present",
        error: true,
        success: false,
      });
    }

    await SpreadsheetModel.findByIdAndDelete(id);
    return resp.status(200).json({
      message: "Sheet deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return resp.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// update sheet without id

const UpdateSpreadsheet2 = async (req, res) => {
  try {
    const { name, data } = req.body;

    if (!name || !data) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find spreadsheet by name
    const spreadsheet = await SpreadsheetModel.findOne({ name });

    if (!spreadsheet) {
      return res.status(404).json({ message: "Spreadsheet not found" });
    }

    // Update spreadsheet data
    spreadsheet.data = data;
    await spreadsheet.save();

    res
      .status(200)
      .json({ message: "Spreadsheet updated successfully", spreadsheet });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
module.exports = {
  PostSpreadsheet,
  GetSpreadsheet,
  GetSpreadsheetById,
  UpdateSpreadsheet,
  DeleteSpreadsheet,
  UpdateSpreadsheet2,
};
