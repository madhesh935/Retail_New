import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CopilotRichTextProps {
  text: string
  className?: string
}

const INLINE_TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[Source\s+\d+\])/gi
const SOURCE_ONLY = /^(?:\[Source\s+\d+\][,\s.]*)+$/i

function normalizeModelText(value: string): string {
  let normalized = value
    .replace(/\r\n?/g, '\n')
    .replace(/\\n/g, '\n')
    // Models sometimes place every numbered item on one line. Split only clear
    // Markdown list markers to avoid changing ordinary numbers in prose.
    .replace(/\s+(?=\d+\.\s+\*\*)/g, '\n')
    // Keep shelf metrics readable without creating a tall nested list.
    .replace(
      /\s+-\s+(?=(?:Current|Availability|Minutes|Status|Backroom|Stock|Price|Location)\b)/gi,
      ' · '
    )
    .trim()

  // Move a trailing source group onto its own wrapping row.
  normalized = normalized.replace(
    /\s+((?:\[Source\s+\d+\]\s*,?\s*)+\.?)$/i,
    '\n$1'
  )
  return normalized.replace(/\],\s*(?=\[Source)/g, '] ')
}

function renderInline(value: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null
  INLINE_TOKEN.lastIndex = 0

  while ((match = INLINE_TOKEN.exec(value)) !== null) {
    if (match.index > cursor) {
      nodes.push(value.slice(cursor, match.index))
    }

    const token = match[0]
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`strong-${match.index}`} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('`')) {
      nodes.push(
        <code
          key={`code-${match.index}`}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.92em] text-slate-800"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else {
      nodes.push(
        <span
          key={`source-${match.index}`}
          className="mx-0.5 inline-flex whitespace-nowrap rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 align-baseline font-mono text-[10px] font-semibold text-sky-700"
        >
          {token.slice(1, -1)}
        </span>
      )
    }
    cursor = match.index + token.length
  }

  if (cursor < value.length) {
    nodes.push(value.slice(cursor))
  }
  return nodes
}

export function CopilotRichText({ text, className }: CopilotRichTextProps) {
  const lines = normalizeModelText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const blocks: ReactNode[] = []

  for (let index = 0; index < lines.length; ) {
    const orderedMatch = lines[index].match(/^\d+\.\s+(.+)$/)
    if (orderedMatch) {
      const items: string[] = []
      while (index < lines.length) {
        const item = lines[index].match(/^\d+\.\s+(.+)$/)
        if (!item) break
        items.push(item[1])
        index += 1
      }
      blocks.push(
        <ol key={`ordered-${index}`} className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-sky-700">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="pl-1 leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    const bulletMatch = lines[index].match(/^[-*•]\s+(.+)$/)
    if (bulletMatch) {
      const items: string[] = []
      while (index < lines.length) {
        const item = lines[index].match(/^[-*•]\s+(.+)$/)
        if (!item) break
        items.push(item[1])
        index += 1
      }
      blocks.push(
        <ul key={`bullet-${index}`} className="list-disc space-y-1.5 pl-5 marker:text-sky-600">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="pl-1 leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    const headingMatch = lines[index].match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      blocks.push(
        <h4 key={`heading-${index}`} className="font-semibold text-slate-950">
          {renderInline(headingMatch[2])}
        </h4>
      )
      index += 1
      continue
    }

    if (SOURCE_ONLY.test(lines[index])) {
      blocks.push(
        <div key={`sources-${index}`} className="flex flex-wrap items-center gap-1 pt-1">
          {renderInline(lines[index])}
        </div>
      )
      index += 1
      continue
    }

    blocks.push(
      <p key={`paragraph-${index}`} className="leading-relaxed">
        {renderInline(lines[index])}
      </p>
    )
    index += 1
  }

  return (
    <div
      className={cn(
        'select-text space-y-2.5 break-words text-xs text-slate-700 [overflow-wrap:anywhere]',
        className
      )}
    >
      {blocks}
    </div>
  )
}
