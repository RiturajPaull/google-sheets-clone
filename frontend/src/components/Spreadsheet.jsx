import React, { useState, useEffect } from "react";
import axios from "axios";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import "./Spreadsheet.css";
import * as math from "mathjs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Spreadsheet = () => {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [sheetName, setSheetName] = useState(""); // State to hold the sheet name
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [removeDuplicateRange, setRemoveDuplicateRange] = useState("");

  const [chartData, setChartData] = useState([]);
  const [selectedChartCols, setSelectedChartCols] = useState({ x: 0, y: 1 });

  useEffect(() => {
    if (gridData.length === 0) return;

    // Convert selected columns into chart data
    const formattedData = gridData.slice(1).map((row, index) => ({
      label: row[selectedChartCols.x] || `Row ${index + 1}`,
      value: parseFloat(row[selectedChartCols.y]) || 0,
    }));

    setChartData(formattedData);
  }, [gridData, selectedChartCols]);

  const handleChartColumnChange = (e, axis) => {
    setSelectedChartCols((prev) => ({
      ...prev,
      [axis]: Number(e.target.value),
    }));
  };

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/all-data");
        if (res.data.length > 0) {
          setSheets(res.data);
          setSelectedSheet(res.data[0]);
          setGridData(res.data[0].data);
        }
      } catch (error) {
        console.error("❌ Error Fetching the data:", error);
      }
    };
    fetchSpreadsheetData();
  }, []);

  const handleSheetChange = (e) => {
    const sheet = sheets.find((s) => s._id === e.target.value);
    setSelectedSheet(sheet);
    setGridData(sheet.data);
  };

  const saveNewSpreadsheet = async () => {
    if (!sheetName) {
      alert("❌ Please provide a sheet name!");
      return;
    }
    try {
      const newSheet = {
        name: sheetName,
        data: gridData, // Send the new data for the sheet
      };
      console.log(newSheet);

      const res = await axios.post(
        "http://localhost:5000/api/users/update-sheet",
        newSheet
      );

      alert("✅ New Spreadsheet saved successfully!");
    } catch (error) {
      console.error("❌ Error saving new spreadsheet:", error);
    }
  };

  const saveSpreadsheet = async () => {
    if (!selectedSheet) return;
    try {
      await axios.put(
        `http://localhost:5000/api/users/update-sheet/${selectedSheet._id}`,
        { data: gridData }
      );
      alert("✅ Spreadsheet saved successfully!");
    } catch (error) {
      console.error("❌ Error saving spreadsheet:", error);
    }
  };

  const addRow = () => {
    setGridData((prevData) => [
      ...prevData,
      new Array(prevData[0].length).fill(""),
    ]);
  };

  const addColumn = () => {
    setGridData((prevData) => prevData.map((row) => [...row, ""]));
  };

  const deleteRow = () => {
    if (gridData.length > 1) {
      setGridData((prevData) => prevData.slice(0, -1));
    } else {
      alert("❌ Cannot delete all rows!");
    }
  };

  const deleteColumn = () => {
    if (gridData[0].length > 1) {
      setGridData((prevData) => prevData.map((row) => row.slice(0, -1)));
    } else {
      alert("❌ Cannot delete all columns!");
    }
  };

  const getCellIndices = (cellRef) => {
    const colLetter = cellRef.match(/[A-Za-z]+/)[0].toUpperCase();
    const rowNumber = parseInt(cellRef.match(/\d+/)[0], 10);

    const colIndex =
      colLetter.split("").reduce((result, letter) => {
        return result * 26 + (letter.charCodeAt(0) - 64);
      }, 0) - 1;

    const rowIndex = rowNumber - 1;

    return { rowIndex, colIndex };
  };

  const getCellValue = (cellRef, data) => {
    const { rowIndex, colIndex } = getCellIndices(cellRef);
    if (data[rowIndex] && data[rowIndex][colIndex] !== undefined) {
      let value = data[rowIndex][colIndex];

      if (typeof value === "string") {
        value = value.trim();
        if (value.startsWith("=")) {
          value = evaluateFormula(value, data);
        } else if (!isNaN(value)) {
          value = parseFloat(value);
        }
      }

      return value;
    }
    return 0;
  };

  const evaluateFormula = (formula, data) => {
    if (!formula.startsWith("=")) return formula;

    const cellRefRegex = /\b[A-Za-z]+[0-9]+\b/g;
    const rangeRegex = /([A-Za-z]+[0-9]+):([A-Za-z]+[0-9]+)/g;

    try {
      let expression = formula.substring(1);

      expression = expression.replace(
        rangeRegex,
        (match, startCell, endCell) => {
          const { rowIndex: startRow, colIndex: startCol } =
            getCellIndices(startCell);
          const { rowIndex: endRow, colIndex: endCol } =
            getCellIndices(endCell);
          let values = [];

          for (let i = startRow; i <= endRow; i++) {
            for (let j = startCol; j <= endCol; j++) {
              let cellValue =
                data[i] && data[i][j] !== undefined ? data[i][j] : 0;

              if (typeof cellValue === "string" && cellValue.startsWith("=")) {
                cellValue = evaluateFormula(cellValue, data);
              }

              if (!isNaN(cellValue)) {
                values.push(parseFloat(cellValue));
              }
            }
          }

          return `[${values.join(",")}]`;
        }
      );

      expression = expression.replace(cellRefRegex, (cellRef) => {
        let value = getCellValue(cellRef, data);

        if (typeof value === "string" && value.startsWith("=")) {
          value = evaluateFormula(value, data);
        }

        if (!isNaN(value)) {
          return value;
        } else {
          return `"${value}"`;
        }
      });

      const customFunctions = {
        SUM: (...args) =>
          args.flat().reduce((acc, val) => acc + parseFloat(val || 0), 0),
        AVERAGE: (...args) =>
          args
            .flat()
            .map((val) => parseFloat(val) || 0)
            .reduce((acc, val, index, array) => acc + val / array.length, 0),

        MAX: (...args) =>
          Math.max(...args.flat().map((val) => parseFloat(val || -Infinity))),
        MIN: (...args) =>
          Math.min(...args.flat().map((val) => parseFloat(val || Infinity))),
        COUNT: (...args) => args.flat().filter((val) => !isNaN(val)).length,

        TRIM: (str) => str.trim(),
        UPPER: (str) => str.toUpperCase(),
        LOWER: (str) => str.toLowerCase(),
      };

      const node = math.parse(expression);
      const code = node.compile();
      return code.evaluate(customFunctions);
    } catch (error) {
      console.error("❌ Error evaluating formula:", error);
      return "ERROR";
    }
  };

  const handleCellChange = (changes, source) => {
    if (!changes) return;

    setGridData((prevData) => {
      const newData = [...prevData];
      changes.forEach(([row, col, oldValue, newValue]) => {
        // If the new value is empty, leave it as is (not NaN)
        if (newValue === "" || newValue === null || newValue === undefined) {
          newData[row][col] = "";
        } else {
          newData[row][col] = newValue;
        }
      });

      for (let i = 0; i < newData.length; i++) {
        for (let j = 0; j < newData[i].length; j++) {
          let cellValue = newData[i][j];

          // Handle formulas that start with "="
          if (typeof cellValue === "string" && cellValue.startsWith("=")) {
            newData[i][j] = evaluateFormula(cellValue, newData);
          } else if (cellValue === "" || cellValue === null) {
            // If the cell is empty or null, explicitly set it as an empty string
            newData[i][j] = "";
          } else if (!isNaN(cellValue)) {
            newData[i][j] = parseFloat(cellValue); // Ensure it's treated as a number
          }
        }
      }

      return newData;
    });
  };

  const removeDuplicates = (range) => {
    setGridData((prevData) => {
      const newData = prevData.map((row) => [...row]);
      const seenValues = new Set();

      const match = range.match(/([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)/);
      if (!match) {
        alert("❌ Invalid range format! Use A1:B2");
        return prevData;
      }

      const [, startColLetter, startRow, endColLetter, endRow] = match;
      const startCol = getCellIndices(startColLetter + "1").colIndex;
      const endCol = getCellIndices(endColLetter + "1").colIndex;
      const startRowIndex = parseInt(startRow, 10) - 1;
      const endRowIndex = parseInt(endRow, 10) - 1;

      for (let i = startRowIndex; i <= endRowIndex; i++) {
        for (let j = startCol; j <= endCol; j++) {
          const cellValue = newData[i][j];
          if (cellValue && seenValues.has(cellValue)) {
            newData[i][j] = "";
          } else {
            seenValues.add(cellValue);
          }
        }
      }

      return newData;
    });
  };

  const handleFindAndReplace = () => {
    if (!findText) return;

    setGridData((prevData) => {
      return prevData.map((row) =>
        row.map((cell) => {
          if (typeof cell === "string") {
            return cell.replace(new RegExp(findText, "g"), replaceText);
          }
          return cell;
        })
      );
    });
  };

  const handleFindChange = (e) => setFindText(e.target.value);
  const handleReplaceChange = (e) => setReplaceText(e.target.value);

  return (
    <div className="spreadsheet-container">
      <h1>Spreadsheet App</h1>
      <select
        className="sheet-select"
        value={selectedSheet?._id || ""}
        onChange={handleSheetChange}
      >
        {sheets.map((sheet) => (
          <option key={sheet._id} value={sheet._id}>
            {sheet.name}
          </option>
        ))}
      </select>

      <div className="create-sheet">
        <input
          type="text"
          placeholder="Enter new sheet name"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
        />
        <button onClick={saveNewSpreadsheet}>Save New Spreadsheet</button>
      </div>

      <div className="spreadsheet-actions">
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={deleteRow}>Delete Row</button>
        <button onClick={deleteColumn}>Delete Column</button>
        <button onClick={saveSpreadsheet}>Save Spreadsheet</button>
      </div>

      <div className="find-replace">
        <input
          type="text"
          placeholder="Find"
          value={findText}
          onChange={handleFindChange}
        />
        <input
          type="text"
          placeholder="Replace"
          value={replaceText}
          onChange={handleReplaceChange}
        />
        <button onClick={handleFindAndReplace}>Find and Replace</button>
      </div>

      <div className="remove-duplicates">
        <input
          type="text"
          placeholder="Range (e.g., A1:B5)"
          value={removeDuplicateRange}
          onChange={(e) => setRemoveDuplicateRange(e.target.value)}
        />
        <button onClick={() => removeDuplicates(removeDuplicateRange)}>
          Remove Duplicates
        </button>
      </div>

      <HotTable
        data={gridData}
        width="100%"
        height="500"
        stretchH="all"
        licenseKey="non-commercial-and-evaluation"
        contextMenu={true}
        manualColumnMove={true}
        manualRowMove={true}
        afterChange={handleCellChange}
        colHeaders={true} // Enable column headers (A, B, C, ...)
        rowHeaders={true} // Enable row headers (1, 2, 3, ...)
        beforeChange={(changes, source) => {
          if (changes) {
            changes.forEach(([row, col, oldValue, newValue]) => {
              // Prevent NaN in empty cells
              if (
                newValue === "" ||
                newValue === null ||
                newValue === undefined
              ) {
                changes = [[row, col, oldValue, ""]]; // Make sure empty cells remain empty
              }
            });
          }
          return changes;
        }}
      />

      <div className="chart-container">
        <h2>Chart Visualization</h2>

        <div className="chart-controls">
          <label>
            X-Axis:
            <select onChange={(e) => handleChartColumnChange(e, "x")}>
              {gridData[0]?.map((col, index) => (
                <option key={index} value={index}>{`Column ${
                  index + 1
                }`}</option>
              ))}
            </select>
          </label>

          <label>
            Y-Axis:
            <select onChange={(e) => handleChartColumnChange(e, "y")}>
              {gridData[0]?.map((col, index) => (
                <option key={index} value={index}>{`Column ${
                  index + 1
                }`}</option>
              ))}
            </select>
          </label>
        </div>

        <ResponsiveContainer width="80%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Spreadsheet;
