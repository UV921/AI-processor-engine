
import { string } from "zod"
import { verificationInput } from "./evalutaion-engine/claim-verify.js";


type ClaimPromptInput = {
  summary: string | null;
  keyConcepts: string[] | null;
};

export function promptA(text:string){
  return  `Analyze the following technical webpage content.

Focus on the actual technical content and ignore navigation,
menus, login buttons, repeated links, and other webpage noise.

Content:
${text}`

}





 export  function promptB(text:string) {
    return `
You are analyzing extracted text from a technical webpage.

Your goal is to identify the most valuable technical information for a software engineer who wants to learn from the resource.

The extracted text may contain noise such as:
- navigation menus
- repeated headings
- login or signup text
- product links
- footer content
- unrelated UI text

Ignore this noise.

Analyze only the meaningful technical content.

Requirements:

1. TITLE
Return a clear title representing the main topic of the resource.

2. SUMMARY
Write a concise 3-5 sentence summary.
Explain the core technical idea and why it matters.
Do not include marketing language or unnecessary details.

3. KEY CONCEPTS
Select exactly the 5 most important technical concepts.
Choose concepts that are central to understanding the resource.
Do not simply list every technology or product mentioned.

4. USEFUL FOR
Return at most 3 specific types of developers, engineers, or use cases that would benefit most from this resource.

Important rules:
- Base your analysis only on the provided content.
- Do not invent information that is not supported by the content.
- Prioritize technical substance over marketing claims.
- Ignore repeated or irrelevant webpage content.
- Prefer quality over quantity.

CONTENT:

${text}
`}

export function promptClaim(text:ClaimPromptInput){
  return `Extract ALL factual claims from the input.

Rules:
- Each claim must contain exactly one atomic fact.
- Do not combine multiple facts into one claim.
- Do not summarize or generalize the input.
- Do not rewrite a specific claim into a broader claim.
- Do not infer anything that is only implied.
- Do not add new information.
- Preserve the original meaning as closely as possible.
- Extract claims from both the summary and key concepts.
- If one sentence contains multiple facts, split them into separate claims.
- Do not judge whether the claims are true.

Example:
Input:
" BullMQ uses Redis and supports retries."

Correct:
[
  "BullMQ uses Redis.",
  "BullMQ supports retries."
]

Incorrect:
[
  "BullMQ is a powerful background processing system."
]
summary:${text.summary}
keyConcepts:${text.keyConcepts}
`
}

export function promptVerification(text:verificationInput){
  return`You are given two inputs:
1. Source text
2. Claims

Your task is to verify each claim only on the basis of the source text.
Rules:
- Evaluate every claim independently.
- Mark supported=true only when the source text provides evidence for the claim.
- Do not use outside knowledge.
- Do not assume or infer facts that are not supported by the source.
- If supported, provide the relevant evidence from the source.
- If unsupported, set evidence to null.
- Give a short reason explaining the decision.
claim:${text.claims}
sourceText:${text.sourceText}
`

}