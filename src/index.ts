import "dotenv/config";
import express from "express";
import globalRouter from "./global-router";
import { logger } from "./logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(express.json());
app.use("/api/v1/", globalRouter);

app.get("/helloworld", (request, response) => {
  response.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server runs at http://localhost:${PORT}`);
});
