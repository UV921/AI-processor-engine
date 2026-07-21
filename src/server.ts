import  express from "express";
import crypto from "node:crypto";
import { resarchQueue } from "./queue";
import {db} from "./index"
import { resarchTable } from "./db/schema";
import { createResarchRecordInDB,getResarch } from "./service";
import { normalizeUrl } from "./utility";
import { and, eq, or } from "drizzle-orm";

const app=express()

app.use(express.json());

app.post("/resarch",async (req,res)=>{
    try{const {url}=req.body;
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

app.listen(3000,()=>{
    console.log("server runing ")
})