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

    await db
      .update(resarchTable)
      .set({ stage: "extracting-claims" })
      .where(eq(resarchTable.id, resarchId));

    const extractedClaims = await claimExtraction({
      summary: result[0].summary,
      keyConcepts: result[0].keyConcepts,
    });
    console.log(extractedClaims);

    extractedClaims.claims.push("Mcaly guarantees zero email loss.");

    await db
      .update(resarchTable)
      .set({ stage: "verifying-claims" })
      .where(eq(resarchTable.id, resarchId));

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

    await db
      .update(resarchTable)
      .set({
        claims: verifiedClaims.results,
        groundedness,
        stage: "scored",
      })
      .where(eq(resarchTable.id, resarchId));
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);
console.log("evaluation started");

evaluationWorker.on("failed", async (job, error) => {
  console.log("Evaluation failed:", job?.id, error);
  const resarchId = job?.data?.resarchId;
  if (!resarchId) return;

  // The research itself succeeded, so only the stage regresses — the summary
  // stays viewable without a groundedness score.
  await db
    .update(resarchTable)
    .set({ stage: "failed", errorMessage: error.message })
    .where(eq(resarchTable.id, resarchId));
});
