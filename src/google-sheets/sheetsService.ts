import { google } from "googleapis";
import { GOOGLE_SHEETS_KEYFILE, GOOGLE_SHEETS_SCOPES } from "../config";

const auth = new google.auth.GoogleAuth({
  keyFile: GOOGLE_SHEETS_KEYFILE,
  scopes: GOOGLE_SHEETS_SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

export default sheets;
