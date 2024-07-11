import path from "path";

export const GOOGLE_SHEETS_KEYFILE = path.join(
  __dirname,
  "../config/google-sheets.json"
);
export const GOOGLE_SHEETS_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];
