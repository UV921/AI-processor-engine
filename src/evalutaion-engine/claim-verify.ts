import {boolean, z} from "zod"
import type { claim } from "./claim-exrtaction.js"
import { GoogleGenAI } from "@google/genai"
import { promptVerification } from "../prompt.js"

export  const verificationSchema=z.object({
    results:z.array(
        z.object({
           claim:z.string(),
           supported:z.boolean(),
           evidence:z.string().nullable(),
           reason:z.string()


})
    )
})
 export type verificationInput={
    claims:string[],
    sourceText:string |null
}
const ai=new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
})


 export async function  verifyClaims(input:verificationInput){
    const prompt=promptVerification(input)
    const response=await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:prompt,
        config:{
            responseMimeType:"application/json",
            responseJsonSchema:z.toJSONSchema(verificationSchema)
        }


    })
    if(!response.text){throw new Error("Engine not give the verification! try again")}
    const parsedVerification=JSON.parse(response.text)
    const verificationResult=verificationSchema.parse(parsedVerification)
    return verificationResult;

}