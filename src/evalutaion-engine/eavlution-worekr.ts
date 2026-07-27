import { Worker } from "bullmq";
import { db } from "../index.js";
import { resarchTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { claimExtraction } from "./claim-exrtaction.js";
import { verifyClaims } from "./claim-verify.js";

const evaluationWorker = new Worker(
  "result-processing",
  async (job) => {
    const { resarchId } = job.data;

    const result = await db
      .select()
      .from(resarchTable)
      .where(eq(resarchTable.id, resarchId));
    if (!result || result.length === 0) {
      throw new Error("there is no record exist for this resarch id ");
    }
    const research = result[0];

    const extractedClaims = await claimExtraction({
      summary: result[0].summary,
      keyConcepts: result[0].keyConcepts,
    });
    console.log(extractedClaims);

    extractedClaims.claims.push("Mcaly guarantees zero email loss.");

    const verifiedClaims = await verifyClaims({
      claims: extractedClaims.claims,
      sourceText: result[0].sourceText,
    });
    console.log(verifiedClaims);
    const totalClaim = verifiedClaims.results.length;
    if (totalClaim === 0) {
      throw new Error("no claim found for this resarch");
    }
    const falseClaim = verifiedClaims.results.filter(
      (claim) => claim.supported === false,
    );
    const supportedClaim = totalClaim - falseClaim.length;
    const groundedness = supportedClaim / totalClaim;
    console.log(groundedness);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);
console.log("evaluation started");
