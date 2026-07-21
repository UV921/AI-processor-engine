
import { string } from "zod"

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

console.log(promptB("hi i am here"))