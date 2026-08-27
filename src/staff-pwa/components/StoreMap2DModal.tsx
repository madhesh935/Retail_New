import React from 'react'
import { X, Navigation, MapPin, Compass } from 'lucide-react'

interface StoreMap2DModalProps {
  isOpen: boolean
  onClose: () => void
  destinationName?: string
  destinationZone?: string
  shelfCode?: string
  originZone?: string
}

export const StoreMap2DModal: React.FC<StoreMap2DModalProps> = ({
  isOpen,
  onClose,
  destinationName = 'Shelf B4 — Cold Beverages',
  destinationZone = 'Beverages & Snacks',
  shelfCode = 'B4',
  originZone = 'Stockroom (Bay 3B)',
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Store Navigation</h3>
              <p className="text-[11px] text-slate-500 font-medium">Indoor Floor Route • Zone 4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route Info Pill */}
        <div className="p-4 bg-sky-50/60 border-b border-sky-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-800 block">Destination</span>
              <span className="font-bold text-slate-900">{destinationName}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Est. Walk</span>
            <span className="font-bold text-sky-700 font-mono">~35 sec</span>
          </div>
        </div>

        {/* 2D Schematic Store Map */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="w-full aspect-[4/3] bg-slate-900 rounded-2xl p-3 text-white relative shadow-inner overflow-hidden border border-slate-800">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Store Zones */}
            {/* Stockroom */}
            <div className="absolute top-2 left-2 w-28 h-16 bg-slate-800/90 border border-slate-700 rounded-lg p-1.5 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Stockroom</span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>You (Bay 3B)</span>
              </div>
            </div>

            {/* Produce */}
            <div className="absolute top-2 right-2 w-32 h-16 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-1.5 text-[9px] font-bold text-emerald-300 uppercase">
              Produce & Fruits
            </div>

            {/* Dairy */}
            <div className="absolute top-22 left-2 w-28 h-20 bg-cyan-950/40 border border-cyan-800/60 rounded-lg p-1.5 text-[9px] font-bold text-cyan-300 uppercase">
              Dairy Wall (C2)
            </div>

            {/* Beverages & Snacks (Target Zone) */}
            <div className="absolute top-22 right-2 w-32 h-20 bg-sky-900/60 border-2 border-sky-400 rounded-lg p-1.5 flex flex-col justify-between shadow-lg shadow-sky-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-sky-200 uppercase">Beverages</span>
                <span className="text-[9px] bg-sky-400 text-slate-950 font-black px-1 rounded">B4</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-sky-200 font-bold">
                <MapPin className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                <span>Target: {shelfCode}</span>
              </div>
            </div>

            {/* Checkout Area */}
            <div className="absolute bottom-2 left-2 right-2 h-12 bg-slate-800/80 border border-slate-700 rounded-lg px-2 flex items-center justify-between text-[9px] font-bold text-slate-300">
              <span className="uppercase">Checkout Counters C1–C4</span>
              <span className="text-slate-400">Main Entrance ↓</span>
            </div>

            {/* Route Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 60 40 L 140 40 L 140 110 L 220 110"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="animate-[dash_1.5s_linear_infinite]"
              />
            </svg>
          </div>

          {/* Turn-by-Turn Waypoint Steps */}
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step-by-Step Route</h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <div>
                  <span className="font-semibold text-slate-900 block">Exit Stockroom Bay 3B</span>
                  <span className="text-[11px] text-slate-500">Head east into Central Concourse walkway</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <div>
                  <span className="font-semibold text-slate-900 block">Enter Aisle 4 (Beverages)</span>
                  <span className="text-[11px] text-slate-500">Walk past cold juice displays on left</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-medium">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                <div>
                  <span className="font-bold text-sky-950 block">Arrive at Shelf {shelfCode}</span>
                  <span className="text-[11px] text-sky-800">{destinationZone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 text-white/90" />
            <span>Got Route Details</span>
          </button>
        </div>
      </div>
    </div>
  )
}
