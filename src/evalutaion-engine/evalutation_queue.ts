import { Queue } from "bullmq";

export const evaluationQueue=new Queue("result-processing",{
    connection:{
        host:"127.0.0.1",
        port:6379
        

    }
})
