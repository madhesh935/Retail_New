import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Clock,
  KeyRound,
  User,
} from 'lucide-react'

const KNOWN_WORKERS: Record<
  string,
  { name: string; role: string; shift: string; zoneName: string }
> = {
  S03: {
    name: "Liam O'Connor",
    role: 'Inventory Restocker',
    shift: 'Shift B',
    zoneName: 'Beverages',
  },
  S01: {
    name: 'Elena Rostova',
    role: 'Floor Lead',
    shift: 'Shift B',
    zoneName: 'Fresh Produce',
  },
  S02: {
    name: 'Marcus Chen',
    role: 'Checkout Associate',
    shift: 'Shift B',
    zoneName: 'Checkout Front',
  },
}

export const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { loginStaff } = useAppStore()

  const [employeeId, setEmployeeId] = useState('S03')
  const [pin, setPin] = useState('1234')
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const cleanId = employeeId.trim().toUpperCase()
      const workerInfo = KNOWN_WORKERS[cleanId] || {
        name: `Worker ${cleanId}`,
        role: 'Store Associate',
        shift: 'Shift B',
        zoneName: 'Store Floor',
      }

      if (cleanId && pin.length >= 4) {
        loginStaff({
          id: `STAFF-${cleanId}`,
          name: workerInfo.name,
          employeeId: cleanId,
          role: workerInfo.role,
          storeId: 'STORE-01',
          storeName: 'Chennai Central',
          shift: workerInfo.shift,
          zoneName: workerInfo.zoneName,
        })
        navigate('/staff/attendance')
      } else {
        setError('Please enter a valid Employee ID and 4-digit PIN.')
        setIsLoading(false)
      }
    }, 600)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F8] text-slate-900 justify-between p-6 select-none font-sans max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center font-black text-sm rounded-xl shadow-xs shadow-blue-500/20">
            RE
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 leading-none block">Retail Edge</span>
            <span className="text-[10px] text-slate-500 font-medium font-mono">Store Companion</span>
          </div>
        </div>

        {/* Edge Connectivity status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[10px] font-bold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Edge Online (2ms)</span>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="my-auto py-6 space-y-6">
        {/* Welcome Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Chennai Central • Store 01</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Worker Sign In</h1>
          <p className="text-xs text-slate-500 font-medium">
            Enter your employee ID and PIN to start your shift.
          </p>
        </div>

        {/* Individual Sign In Form Card */}
        <form onSubmit={handleLogin} className="space-y-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {/* Employee ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Employee ID</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">e.g. S03</span>
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase font-mono tracking-wider"
              placeholder="S03"
              required
            />
          </div>

          {/* Security PIN Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Shift PIN (4 digits)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPin ? 'Hide' : 'Show'}</span>
              </button>
            </label>
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              maxLength={6}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono tracking-widest"
              placeholder="••••"
              required
            />
          </div>

          {/* Shift Schedule Alert */}
          <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-medium">
              Active Shift: <strong className="font-bold">Shift B (14:00 – 22:00)</strong>
            </span>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* Sign In CTA Button */}
          <button
            type="submit"
            disabled={isLoading || !employeeId || !pin}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Shift</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </>
            )}
          </button>
        </form>
      </div>

      <div />
    </div>
  )
}
