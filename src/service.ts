import { db } from "./index.js";
import { resarchTable } from "./db/schema.js";
import { eq } from "drizzle-orm";

export const createResarchRecordInDB = async (url: string) => {
    const resarch = await db.insert(resarchTable).values({ url }).returning({id:resarchTable.id});
    if(!resarch || resarch.length === 0){
        throw new Error("no resarch record created");
    }
    return resarch[0].id;

};

export const getResarch =async(id:string)=>{
    const resarch =await db.select().from(resarchTable).where(eq(resarchTable.id,id))
    if(!resarch || resarch.length ===0){
        throw new Error("no record found ")
    }
    return resarch[0]

}
