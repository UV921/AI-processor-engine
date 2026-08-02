export type TextChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  start: number;
  end: number;
};

export function chunkText(
  documentId: string,
  text: string,
  chunkSize = 1000,
  overlap = 100,
): TextChunk[] {
  const cleanedText = text.replace(/\s+/g, " ").trim();
  if(cleanedText.length===0 ||chunkSize<=overlap || overlap<0 || chunkSize<=0) return []

  let start = 0;
  let end = 0;

  let Index = 0;

  let Chunks: TextChunk[] = [];
  while (start < cleanedText.length) {
    end = Math.min(start + chunkSize, cleanedText.length); //100
    let chunkText = cleanedText.slice(start, end);

    const chunk = {
      id: `${documentId}-chunk-${Index}`,
      documentId: documentId,
      chunkIndex: Index,
      text: chunkText,
      start: start,
      end: end,
    };
    Chunks.push(chunk);
    if (end >= cleanedText.length) break;
   
    Index = Index + 1;
    start = end - overlap;
  }

  return Chunks;
}

