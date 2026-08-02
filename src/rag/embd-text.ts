import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
import type { TextChunk } from "./chunk-text.js";



type EmbeddedChunk = TextChunk & {
    embedding: number[];
  };
// . Accept one chunk’s text
//2. Send it to Gemini’s embedding model
//3. Receive an embedding response
//4. Take the first embedding’s values
//5. Ensure the values exist

const ai=new  GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});

export async function embedText(chunks:TextChunk[]): Promise<EmbeddedChunk[]>{
   
    //const cleanedText=text.trim()
   const EmbeddedChunkPromises= chunks.map(async(chunk)=>{
        
        const response=await ai.models.embedContent({
            model:'gemini-embedding-2',
            contents:chunk.text,
            config:{
    outputDimensionality:768        }
        })
        const values=response.embeddings?.[0]?.values;
    if(!values || values.length===0) {
        throw new Error("Embedding mdoel return no vector values")
    }

        return{
           ...chunk,
           embedding:values


        }


    })
    const EmbeddedChunks = await Promise.all(EmbeddedChunkPromises);

    return EmbeddedChunks;
   
   

    
    
    


}