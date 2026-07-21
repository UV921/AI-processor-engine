import { Queue} from "bullmq";

export const resarchQueue=new Queue("resarch-processing",{
    connection:{
        host:"127.0.0.1",
        port:6379
    }

})