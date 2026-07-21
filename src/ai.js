import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { promptB } from "./prompt";
export const resarchSchema = z.object({
    title: z.string(),
    summary: z.string(),
    keyConcepts: z.array(z.string()),
    usefulFor: z.array(z.string()),
});
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
export async function analyzeResarch(text) {
    const prompt = promptB(text);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(resarchSchema)
        }
    });
    if (!response.text) {
        throw new Error("Gemini retuned no text");
    }
    console.log("Raw Gemini response:", response.text);
    const parsedJson = JSON.parse(response.text);
    return resarchSchema.parse(parsedJson);
}
