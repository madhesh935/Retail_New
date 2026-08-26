import React, { useState } from 'react'
import { Sparkles, X, ArrowRight, Send, Bot, MessageSquare } from 'lucide-react'
import { useCustomerShopping } from '../context/CustomerShoppingContext'
import { CopilotRobotIcon } from './CopilotRobotIcon'

export const CustomerCopilotQuickDrawer: React.FC = () => {
  const {
    isCopilotDrawerOpen,
    setIsCopilotDrawerOpen,
    activeTab,
    setActiveTab,
    sendCopilotMessage,
  } = useCustomerShopping()

  const [inputVal, setInputVal] = useState('')

  if (!isCopilotDrawerOpen) {
    return null
  }

  // Context-aware suggested prompts
  const getContextualPrompts = () => {
    switch (activeTab) {
      case 'SEARCH':
        return [
          'Find cheaper alternatives',
          'Where is this item on shelf?',
          'Show only in-stock options',
          'Find shampoo under ₹300',
        ]
      case 'LIST':
        return [
          'Generate the fastest route for my list',
          'Find substitutes for low stock items',
          'What is my total estimated cost?',
          'Add snacks for 4 people to list',
        ]
      case 'ROUTE':
        return [
          'Where do I go next?',
          'Can I avoid crowded Aisle 4?',
          'Which checkout lane is fastest?',
          'How much walking distance is left?',
        ]
      default: // HOME
        return [
          'I need groceries for breakfast for 4 people',
          'Where can I find milk?',
          'I need snacks for 5 people under ₹500',
          'Help me buy pasta ingredients',
          'Which checkout is fastest?',
        ]
    }
  }

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return
    sendCopilotMessage(text)
    setIsCopilotDrawerOpen(false)
    setActiveTab('COPILOT')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => setIsCopilotDrawerOpen(false)}
      />

      {/* Drawer Card */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 space-y-4 text-slate-800 animate-in slide-in-from-bottom duration-200 border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold shadow-2xs">
              <CopilotRobotIcon className="h-5.5 w-5.5" stroke="#0284C7" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                Shopping Copilot
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                What do you want to buy?
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCopilotDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendPrompt(inputVal)
            setInputVal('')
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Tell me what you're shopping for..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-3.5 pr-10 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-inner"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="absolute right-2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Suggested Quick Prompts */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Suggested for You
          </span>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
            {getContextualPrompts().map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(prompt)}
                className="text-left text-xs font-semibold text-slate-700 hover:text-cyan-800 bg-slate-50 hover:bg-cyan-50/70 border border-slate-100 hover:border-cyan-200 rounded-xl px-3 py-2 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate">{prompt}</span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-cyan-600 shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Link: Open Full Copilot */}
        <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Full AI Planning page</span>
          <button
            onClick={() => {
              setIsCopilotDrawerOpen(false)
              setActiveTab('COPILOT')
            }}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Open Full Copilot</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
