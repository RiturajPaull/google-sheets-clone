

# Spreadsheet App (MERN Stack)

This is a feature-rich spreadsheet application built using the MERN (MongoDB, Express, React, Node.js) stack. It allows users to create, edit, and manage spreadsheet data with functionalities such as formula evaluation, charts, data visualization, and basic CRUD operations.

## Features

- **Spreadsheet Management**: Create, update, and delete spreadsheets.
- **Formula Support**: Supports formulas like `SUM`, `AVERAGE`, `MAX`, `MIN`, `COUNT`, and text functions like `UPPER`, `LOWER`, and `TRIM`.
- **Data Manipulation**:
  - Add/Delete Rows and Columns.
  - Find and Replace functionality.
  - Remove duplicates within a selected range.
- **Chart Integration**:
  - Create Bar Charts and Line Charts from spreadsheet data.
  - Dynamic selection of data columns for visualization.
- **Real-Time Data Evaluation**: Automatically updates formulas and dependencies when data changes.

## Tech Stack

- **Frontend**: React, Handsontable, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Other Libraries**: Axios, Math.js

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/spreadsheet-app.git
   cd spreadsheet-app/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /api/users/all-data` - Fetch all spreadsheets
- `POST /api/users/update-sheet` - Create a new spreadsheet
- `PUT /api/users/update-sheet/:id` - Update an existing spreadsheet

## Usage

1. Create a new spreadsheet or select an existing one.
2. Enter data into the cells and use formulas as needed.
3. Save your work to the database.
4. Generate charts based on spreadsheet data.
5. Use Find & Replace or Remove Duplicates to clean up data.

## Future Enhancements

- Implement user authentication and multi-user collaboration.
- Add more chart types and advanced data visualization.
- Export and import spreadsheet data in CSV/Excel format.

## License

This project is licensed under the MIT License.

