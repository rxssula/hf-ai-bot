import "dotenv/config";
import express from "express";
import globalRouter from "./global-router";
import { logger } from "./logger";
import readSheet from "./google-sheets/sheets.Utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import geminiApiRoutes from "./routes/GeminiRoute";
import dotenv from "dotenv";
import ngramsRouter from './routes/N-grams';
import cors from 'cors'; // Import the cors package

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;
const genAI = new GoogleGenerativeAI(process.env.GoogleGenerative_api as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: 'http://localhost:3001' // Enable CORS for the front-end domain
}));

const sheetId = "1QwsW7AtMKT66Od_hoLFvO5Bmy3G083ND_atfCtj7G-4";
const range = "A1:Z100";

app.use(logger);
app.use(express.json());
app.use("/api/v1/", globalRouter);
app.use("/", geminiApiRoutes);
app.use('/', ngramsRouter);


app.get("/helloworld", async (request, response) => {
  const rows = await readSheet(sheetId, range);
  response.send(rows);
});

app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`Server runs at http://localhost:${PORT}`);
});
