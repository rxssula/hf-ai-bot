import "dotenv/config";
import express from "express";
import globalRouter from "./global-router";
import { logger } from "./logger";
import readSheet from "./google-sheets/sheets.Utils";

const app = express();
const PORT = process.env.PORT || 3000;

const sheetId = "1QwsW7AtMKT66Od_hoLFvO5Bmy3G083ND_atfCtj7G-4";
const range = "A1:Z100";

app.use(logger);
app.use(express.json());
app.use("/api/v1/", globalRouter);

app.get("/helloworld", async (request, response) => {
  const rows = await readSheet(sheetId, range);
  response.send(rows);
});

app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`Server runs at http://localhost:${PORT}`);
});
