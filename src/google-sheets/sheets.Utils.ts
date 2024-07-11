// src/sheets/sheetsUtils.js
import sheets from "./sheetsService";

async function readSheet(spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values;
    if (rows?.length) {
      console.log("Data from Google Sheet:");
      console.log(rows);
      return rows;
    } else {
      console.log("No data found.");
      return [];
    }
  } catch (err) {
    console.error("Error reading Google Sheet:", err);
  }
}

export default readSheet;
