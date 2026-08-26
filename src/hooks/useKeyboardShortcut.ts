import { useEffect } from 'react'

interface ShortcutOptions {
  key: string
  ctrlOrCmd?: boolean
  alt?: boolean
  shift?: boolean
  handler: () => void
}

export function useKeyboardShortcut({
  key,
  ctrlOrCmd = false,
  alt = false,
  shift = false,
  handler,
}: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // If shortcut uses ctrl/cmd + key, allow it even in inputs (like Cmd+K)
        if (!ctrlOrCmd) return
      }

      const isKeyMatch = event.key.toLowerCase() === key.toLowerCase()
      const isModifierMatch = ctrlOrCmd ? (event.metaKey || event.ctrlKey) : true
      const isAltMatch = alt ? event.altKey : true
      const isShiftMatch = shift ? event.shiftKey : true

      if (isKeyMatch && isModifierMatch && isAltMatch && isShiftMatch) {
        event.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, ctrlOrCmd, alt, shift, handler])
}
