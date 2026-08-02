import { Worker } from "bullmq";
import * as cheerio from "cheerio";
import { analyzeResarch } from "./ai.js";
import { db } from "./index.js";
import { resarchTable } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { evaluationQueue } from "./evalutaion-engine/evalutation_queue.js";
import { chunkText } from "./rag/chunk-text.js";
import { embedText } from "./rag/embd-text.js";

const worker = new Worker(
  "resarch-processing",
  async (job) => {
    const { resarchId, normalizedUrl } = job.data;
    console.log("Processing research:", resarchId);
    // console.log(job.attemptsMade+1)

    const isAlreadyProcessed = await db
      .select()
      .from(resarchTable)
      .where(eq(resarchTable.id, resarchId));
    if (!isAlreadyProcessed || isAlreadyProcessed.length === 0) {
      throw new Error("there is no record persent in the db");
    }
    if (isAlreadyProcessed[0].status === "completed") {
      return { message: "already completed" };
    }

    await db
      .update(resarchTable)
      .set({
        status: "processing",
        stage: "fetching",
      })
      .where(eq(resarchTable.id, resarchId));

    const response = await fetch(normalizedUrl);
    if (!response.ok) {
      throw new Error(`failed to fetched the url:${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, svg, template").remove();
    const contentRoot =
      $("article").length > 0
        ? $("article")
        : $("main").length > 0
          ? $("main")
          : $("body");

    const textParts: string[] = [];

    contentRoot.find("h1, h2, h3, h4, h5, h6, p, li").each((_, element) => {
      const elementText = $(element).text().replace(/\s+/g, " ").trim();

      if (elementText) {
        textParts.push(elementText);
      }
    });
    const text = textParts.join(" ");

    await db
      .update(resarchTable)
      .set({
        sourceText: text,
        stage: "analyzing",
      })
      .where(eq(resarchTable.id, resarchId));

    const chunks = chunkText(resarchId, text);
    console.log(chunks);
    const firstChunk=chunks[0]?.text
    const embedding= await embedText(firstChunk)
    console.log(embedding)
   

    const result = await analyzeResarch(text);

    await db
      .update(resarchTable)
      .set({
        title: result.title,
        summary: result.summary,
        sourceText: text,
        keyConcepts: result.keyConcepts,
        usefulFor: result.usefulFor,
        errorMessage: null,
        status: "completed",
        stage: "analyzed",
      })
      .where(eq(resarchTable.id, resarchId));

    // Mark the stage before enqueueing: the evaluation worker can pick the job
    // up immediately, and a later write here would drag the stage backwards.
    await db
      .update(resarchTable)
      .set({
        stage: "eval-queued",
      })
      .where(eq(resarchTable.id, resarchId));

    await evaluationQueue.add("result-processing", {
      resarchId,
    });
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
    concurrency: 3,
  },
);

console.log("Resarch work started.....");
worker.on("failed", async (job, error) => {
  if (job?.attemptsMade! < job?.opts.attempts!) {
    console.log("Retrying research processing...");
    console.log("Attempts:", job?.attemptsMade);
    console.log("no of attempts:", job?.opts.attempts);
  } else {
    console.log("Attempts:", job?.attemptsMade);
    console.log("no of attempts:", job?.opts.attempts);
    console.log("Research processing failed after maximum attempts:", job?.id);
    console.log("Error:", error);
    await db
      .update(resarchTable)
      .set({
        status: "failed",
        stage: "failed",
        errorMessage: error.message,
      })
      .where(eq(resarchTable.id, job?.data?.resarchId!));
  }
});
