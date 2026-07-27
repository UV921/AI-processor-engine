import "dotenv/config"
import { GoogleGenAI } from "@google/genai"
import {string, z} from "zod"
import { promptClaim } from "../prompt.js"

export const claimSchema=z.object({
    claims:z.array(z.string())
})
export type claim=z.infer<typeof claimSchema>
type ClaimPromptInput = {
    summary: string | null;
    keyConcepts: string[] | null;
  };

const ai=new GoogleGenAI(
    {
        apiKey:process.env.GEMINI_API_KEY
    }
   
)
export async function claimExtraction(input:ClaimPromptInput){
    const prompt=promptClaim(input)
    const response=await ai.models.generateContent({
        model:"gemini-2.5-flash-lite",
        contents:prompt
        ,
        config:{
            responseMimeType:"application/json",
            responseJsonSchema:z.toJSONSchema(claimSchema)
        }

    })
    if(!response.text){
        throw new Error("Engine return no claims try again")
    }
    console.log(`raw text genrated by the Engine ${response.text}`)
    const parsedJson=JSON.parse(response.text)
    return claimSchema.parse(parsedJson)


    



}