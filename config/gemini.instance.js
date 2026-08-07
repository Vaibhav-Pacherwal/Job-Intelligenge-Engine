import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const clients = [
    new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_1 }),
    new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_2 }),
    new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_3 }),
    new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_4 }),
    new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_5 }),
    new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_6 }),
    new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_7 })
];

const getGeminiResponse = async (prompt, index) => {
    const client = clients[index % clients.length];
    const interaction = await client.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt,
    });

    return interaction.output_text;
}

export default getGeminiResponse;