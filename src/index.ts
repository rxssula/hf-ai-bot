import "dotenv/config";
import express from "express";
import globalRouter from "./global-router";
import { logger } from "./logger";
import readSheet from "./google-sheets/sheets.Utils";
import {GoogleGenerativeAI} from "@google/generative-ai";
import geminiApiRoutes from "./routes/GeminiRoute";
import dotenv from "dotenv";


const app = express();
const PORT = process.env.PORT || 3005;

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GoogleGenerative_api as string);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
// Middleware
app.use(express.json());

const sheetId = "1QwsW7AtMKT66Od_hoLFvO5Bmy3G083ND_atfCtj7G-4";
const range = "A1:Z100";

app.use(logger);
app.use(express.json());
app.use("/api/v1/", globalRouter);
app.use("/",geminiApiRoutes)

app.get("/helloworld", async (request, response) => {
  const rows = await readSheet(sheetId, range);
  response.send(rows);
});

app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`Server runs at http://localhost:${PORT}`);
});






