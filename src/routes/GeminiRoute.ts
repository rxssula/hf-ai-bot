import express from "express";
import {GoogleGenerativeAI} from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config(); // Загрузка переменных окружения из файла .env
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
router.post("/generate-story", async (req, res) => {
    try {
        // const { prompt } = req.body;
        const prompt = "Привет ты кто?"; // Ваш промпт для генерации

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Вывод результата в консоль        console.log(text);
        // Отправка результата как JSON ответ клиенту
        res.json({story: text});
    } catch (error) {
        console.error("Error generating story:", error);
        res.status(500).json({error: "Error generating story"});
    }
});
export default router;

