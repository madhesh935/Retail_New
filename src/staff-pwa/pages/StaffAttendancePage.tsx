import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import {
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  ShieldCheck,
  ArrowRight,
  Coffee,
  Check,
} from 'lucide-react'

export const StaffAttendancePage: React.FC = () => {
  const navigate = useNavigate()
  const { authenticatedStaff, checkInShift, pendingTasks } = useAppStore()

  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [checkInTimestamp, setCheckInTimestamp] = useState('--:--')

  // Dynamic Live Clock
  const [timeStr, setTimeStr] = useState('')
  const [secondsStr, setSecondsStr] = useState('')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
      setSecondsStr(now.toLocaleTimeString([], { second: '2-digit' }))
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!authenticatedStaff) navigate('/staff/login', { replace: true })
  }, [authenticatedStaff, navigate])

  if (!authenticatedStaff) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-500">
        Returning to staff sign inâ€¦
      </div>
    )
  }

  const handleCheckIn = () => {
    setIsCheckingIn(true)
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    setCheckInTimestamp(nowTime)

    setTimeout(() => {
      setIsCheckingIn(false)
      setIsSuccess(true)
      checkInShift(nowTime, 'PRESENT')
    }, 800)
  }

  // 1. Success Confirmed View
  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 justify-between p-6 select-none font-sans max-w-md mx-auto relative overflow-hidden shadow-2xl animate-in fade-in duration-300">
        {/* Top Header */}
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
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
            ● Checked In
          </span>
        </div>

        {/* Success Card */}
        <div className="my-auto py-6 space-y-6 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-emerald-200/80 animate-in zoom-in-90 duration-300">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shift Check-In Confirmed</h1>
            <p className="text-xs text-slate-500 font-medium">
              Welcome back, <strong className="text-slate-800">{authenticatedStaff.name}</strong>. Your attendance is logged.
            </p>
          </div>

          {/* Verification Details Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Recorded Check-In</span>
              <span className="text-sm font-black text-emerald-700 font-mono">{checkInTimestamp} hrs</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Active Shift Window</span>
              <span className="text-xs font-bold text-slate-900 font-mono">{authenticatedStaff.shift}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Assigned Zone</span>
              <span className="text-xs font-bold text-blue-600">{authenticatedStaff.zoneName || 'Beverages'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Operational Dispatch</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{pendingTasks.length} tasks ready</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/staff')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>Enter Store Companion</span>
            <ArrowRight className="w-5 h-5 text-white/90" />
          </button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Store Edge Verified</span>
          </div>
          <span className="font-mono text-[10px]">{authenticatedStaff.employeeId}</span>
        </div>
      </div>
    )
  }

  // 2. Pre-Check-In View
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 justify-between p-6 select-none font-sans max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Top Header */}
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

        {/* Edge Connectivity & Geofence */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[10px] font-bold text-emerald-700">
          <MapPin className="w-3 h-3 text-emerald-600" />
          <span>In Store Geofence</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-4 space-y-5">
        {/* Worker Greeting */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Chennai Central • Store 01</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ready for your shift, {authenticatedStaff.name.split(' ')[0]}?
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Confirm your physical attendance to receive today's work assignments.
          </p>
        </div>

        {/* Live Digital Clock Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Store Master Clock</span>
          </div>

          {/* Time with Seconds */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-black text-slate-900 tracking-tight font-mono">
              {timeStr || '--:--'}
            </span>
            <span className="text-lg font-bold text-blue-600 font-mono">
              :{secondsStr || '00'}
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-500">{dateStr || '—'}</div>
        </div>

        {/* Shift & Assignment Details Card */}
        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-xs flex items-center justify-center">
                {authenticatedStaff.name.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 leading-tight block">{authenticatedStaff.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">{authenticatedStaff.role}</span>
              </div>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md font-mono">
              {authenticatedStaff.employeeId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Shift Timing</span>
              <span className="font-bold text-slate-900 font-mono mt-0.5 block">
                {authenticatedStaff.shift}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Zone</span>
              <span className="font-bold text-blue-600 font-mono mt-0.5 block">
                {authenticatedStaff.zoneName || 'Beverages'}
              </span>
            </div>
          </div>

          {/* Shift Break Guidance */}
          <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-semibold">Break Allowance:</span>
            </div>
            <span className="text-[10px] font-medium font-mono text-blue-800">1x 45m Lunch · 2x 15m Rest</span>
          </div>
        </div>

        {/* Check-In Action Button */}
        <button
          onClick={handleCheckIn}
          disabled={isCheckingIn}
          className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          {isCheckingIn ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Verifying Store Geofence & Check-In...</span>
            </span>
          ) : (
            <>
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>CONFIRM SHIFT CHECK-IN</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Status */}
      <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Punctuality Verified</span>
        </div>
        <span className="font-mono text-[10px]">On Time Check-In</span>
      </div>
    </div>
  )
}
