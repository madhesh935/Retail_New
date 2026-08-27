/** Remove markdown symbols so LLM replies render as plain text in bubbles. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\\(\*+|#+)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
