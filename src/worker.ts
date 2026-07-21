import { Worker } from "bullmq";
import * as cheerio from "cheerio"
import { analyzeResarch } from "./ai";
import { db } from "./index";
import { resarchTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { json } from "zod";

const worker =new Worker("resarch-processing",
    async (job)=>{
        const {resarchId,normalizedUrl}=job.data;
         console.log("Processing research:", resarchId);
        // console.log(job.attemptsMade+1)
  
     

       const isAlreadyProcessed=await db.select().from(resarchTable).where(eq(resarchTable.id,resarchId))
       if(!isAlreadyProcessed || isAlreadyProcessed.length===0){
        throw new Error("there is no record persent in the db")
       }
       if(isAlreadyProcessed[0].status==="completed"){
        return {message:"already completed"}
       }

       await db.update(resarchTable).set({
        status:"processing"
       }).where(eq(resarchTable.id,resarchId))

    
      
     
    const response= await fetch(normalizedUrl)
    if(!response.ok){
        throw new Error(`failed to fetched the url:${response.status}`)
    }
    const html = await response.text();
    const $ = cheerio.load(html);

  const text = $("body")
  .text()
  .replace(/\s+/g, " ")
  .trim();
  console.log(text)
  const result = await analyzeResarch(text);
  
  await db.update(resarchTable).set({
    title:result.title,
    summary:result.summary,
    keyConcepts:result.keyConcepts,
    usefulFor:result.usefulFor,
    errorMessage:null,
    status:"completed"

  }).where(eq(resarchTable.id,resarchId))
  

  console.log("AI STRUCTURED RESULT:");
  console.dir(result,{depth:null});
    },
    {
        connection:{
            host:"127.0.0.1",
            port:6379
        },concurrency:3
    }
)

console.log("Resarch work started.....")
worker.on("failed",async (job,error)=>{
    if(job?.attemptsMade! < job?.opts.attempts!){
        console.log("Retrying research processing...")
        console.log("Attempts:",job?.attemptsMade);
        console.log("no of attempts:",job?.opts.attempts)
        

    }else{
        console.log("Attempts:",job?.attemptsMade);
        console.log("no of attempts:",job?.opts.attempts)
        console.log("Research processing failed after maximum attempts:",job?.id);
        console.log("Error:",error);
        await db.update(resarchTable).set({
            status:"failed",
            errorMessage:error.message
        }).where(eq(resarchTable.id,job?.data?.resarchId!))
        

    }
    
    
})