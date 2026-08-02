import  express from "express";
import crypto from "node:crypto";
import { resarchQueue } from "./queue.js";
import {db} from "./index.js"
import { resarchTable } from "./db/schema.js";
import { createResarchRecordInDB,getResarch } from "./service.js";
import { normalizeUrl } from "./utility.js";
import { and, eq, or } from "drizzle-orm";

const app=express()

app.use(express.json());

app.get("/health",(_req,res)=>{
    res.status(200).json({ok:true})
})

app.post("/resarch",async (req,res)=>{
    try{const {url}=req.body;
    if(typeof url!=="string" || url.trim()===""){
        return res.status(400).json({message:"a url is required"})
    }
    const normalizedUrl=normalizeUrl(url)
    const existingResearch = await db
    .select()
    .from(resarchTable)
    .where(
        and(
            eq(resarchTable.url, normalizedUrl),
            or(
                eq(resarchTable.status, "pending"),
                eq(resarchTable.status, "processing")
            )
        )
    );
    if( existingResearch.length>0) {
        return res.status(200).json({
            resarchId:existingResearch[0].id,
            status:existingResearch[0].status,
        })
        

    }
    const resarchId=await createResarchRecordInDB(normalizedUrl)
   
    await resarchQueue.add("process-resarch",{
        resarchId,
        normalizedUrl

    },{attempts:3,backoff:{type:"fixed",delay:5000}})

    res.status(200).json({
        resarchId,
        status:"pending",

    })}catch(err){
        res.status(500).json({

            message: err instanceof Error ? err.message : "try again there some error"

        });


    }
})
app.get("/resarch/:id",async (req,res)=>{
   try{ const {id}=  req.params
    const resarch=await getResarch(id)
    res.status(200).json({
        resarch
    })}catch(err){
        res.status(404).json({

            message: err instanceof Error ? err.message : "Research not found"

        });

    }

})

const PORT=Number(process.env.PORT ?? 3000)

const server=app.listen(PORT,"127.0.0.1",()=>{
    console.log(`server running on http://127.0.0.1:${PORT}`)
})

server.on("error",(err:NodeJS.ErrnoException)=>{
    if(err.code==="EADDRINUSE"){
        console.error(`port ${PORT} is already used by another app. Free it or start with PORT=3001 npx tsx src/server.ts`)
    }else{
        console.error(err)
    }
    process.exit(1)
})