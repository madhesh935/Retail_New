import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  ListOrdered,
  Camera,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Calculator,
  UserCheck,
} from 'lucide-react'
import { Checkout3DData } from '../scene/CheckoutLanes3D'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'

interface TwinCheckoutDrawerProps {
  checkout: Checkout3DData | null
  onClose: () => void
  onExplain?: (checkout: Checkout3DData) => void
}

export const TwinCheckoutDrawer: React.FC<TwinCheckoutDrawerProps> = ({
  checkout,
  onClose,
  onExplain,
}) => {
  const navigate = useNavigate()
  const [isLaneActivated, setIsLaneActivated] = useState(false)

  if (!checkout) return null

  const isCritical = checkout.congestionRisk === 'CRITICAL' || checkout.status === 'CONGESTED'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200 select-none font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs shadow-2xs font-mono">
              {checkout.code}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-sans">
                {checkout.name}
              </h3>
              <span className="text-[10px] text-sky-700 font-medium">
                Cashier: {checkout.cashierName} ({checkout.cashierEmpId})
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Status & Queue Metrics */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Congestion Level</span>
              <StatusBadge
                status={isCritical ? 'CONGESTED' : 'ONLINE'}
                label={isCritical ? 'Critical Congestion' : 'Active'}
                size="sm"
              />
            </div>

            {/* Matrix */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-sans text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Queue Depth</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {checkout.queueLength} shoppers
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Average Wait</span>
                <span className="text-base font-bold text-amber-800 font-mono">
                  {checkout.waitTimeMinutes} min
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Arrival Rate (λ)</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {checkout.arrivalRate}/min
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Service Rate (μ)</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {checkout.serviceRate}/min
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
              <span>Forecast +5 min: <strong className="text-rose-700 font-mono">{checkout.forecast5Min} shoppers</strong></span>
              <span>Risk: <strong className="text-rose-700">{checkout.congestionRisk}</strong></span>
            </div>
          </div>

          {/* AI Recommendation Card */}
          <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-sky-800 font-bold">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                <span>Autonomous Queue Rebalance</span>
              </span>
              <span className="text-[10px] text-sky-700 font-mono">92% Conf</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Open Standby Counter C3 and reallocate Associate Marcus Vance (EMP-402) to register immediately.
            </p>

            {isLaneActivated ? (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-center flex items-center justify-center gap-1.5 text-xs shadow-2xs">
                <CheckCircle2 className="h-4 w-4" /> Standby Counter C3 Activated
              </div>
            ) : (
              <Button
                variant="action"
                size="sm"
                onClick={() => setIsLaneActivated(true)}
                className="w-full gap-1 text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Open Counter C3 & Assign Staff</span>
              </Button>
            )}
          </div>

          {/* Actions Grid: View Camera | Open Queue Intelligence | Explain Prediction */}
          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  navigate('/queue-intelligence')
                }}
                className="gap-1 text-xs border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Queue Intel</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onExplain) onExplain(checkout)
                }}
                className="gap-1 text-xs border-sky-200 bg-white text-sky-700 hover:bg-sky-50 shadow-2xs font-semibold"
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>Explain Why</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                onClose()
                navigate('/digital-twin')
              }}
              className="w-full text-slate-500 hover:text-slate-900 text-[11px] gap-1"
            >
              <Camera className="h-3 w-3" /> View Overhead Camera Stream (CAM-06)
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Counter ID: #TWIN-CHECKOUT-{checkout.code}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px] text-slate-600 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
