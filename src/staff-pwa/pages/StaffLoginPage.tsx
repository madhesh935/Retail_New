import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { realStoreApi } from '@/services/api/realStoreApi'
import { mapStaffMember } from '@/services/api/mappers'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Clock,
  KeyRound,
  User,
} from 'lucide-react'

export const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { loginStaff, staffMembers, setStaffPayload, fetchStoreData, authenticatedStaff, attendanceState } = useAppStore()

  const [employeeId, setEmployeeId] = useState('EMP-403')
  const [pin, setPin] = useState('1234')
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (staffMembers.length === 0) {
      realStoreApi
        .getStaffMembers()
        .then((members) => {
          const mapped = members.map(mapStaffMember)
          setStaffPayload({
            totalStaffOnShift: mapped.filter((m) => m.status !== 'OFF_DUTY').length,
            availableStaffCount: mapped.filter((m) => m.status === 'ON_DUTY_AVAILABLE').length,
            busyStaffCount: mapped.filter((m) => m.status === 'ON_DUTY_BUSY').length,
            breakStaffCount: mapped.filter((m) => m.status === 'ON_BREAK').length,
            activeTasksCount: 0,
            staffMembers: mapped,
            pendingTasks: [],
            recommendedReallocations: [],
          })
        })
        .catch(console.warn)
    }
  }, [staffMembers.length, setStaffPayload])

  useEffect(() => {
    if (!authenticatedStaff) return
    navigate(attendanceState.status === 'NOT_CHECKED_IN' ? '/staff/attendance' : '/staff', {
      replace: true,
    })
  }, [authenticatedStaff, attendanceState.status, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const cleanId = employeeId.trim().toUpperCase()
      if (!cleanId || !/^\d{4}$/.test(pin)) {
        setError('Please enter a valid Employee ID and 4-digit PIN.')
        return
      }
      if (pin !== '1234') {
        setError('Incorrect PIN. Use the store demo PIN 1234.')
        return
      }

      let members = staffMembers
      if (members.length === 0) {
        const raw = await realStoreApi.getStaffMembers()
        members = raw.map(mapStaffMember)
      }

      const worker =
        members.find((m) => m.employeeId.toUpperCase() === cleanId) ||
        members.find((m) => m.id.toUpperCase() === cleanId) ||
        members.find((m) => m.employeeId.toUpperCase().endsWith(cleanId.replace(/^S0?/, ''))) ||
        members.find((m) => m.name.toLowerCase().includes(cleanId.toLowerCase()))

      if (!worker) {
        setError('Employee ID not found in store roster. Try EMP-403 (Madhesh).')
        return
      }

      loginStaff({
        id: worker.id,
        name: worker.name,
        employeeId: worker.employeeId,
        role: worker.role,
        storeId: 'STORE-01',
        storeName: 'Chennai Central',
        shift: `${worker.shiftStartTime} - ${worker.shiftEndTime}`,
        zoneName: worker.currentZoneName || 'Store Floor',
      })
      void fetchStoreData()
      navigate('/staff/attendance')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 space-y-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            Staff Companion
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in</h1>
          <p className="text-sm text-slate-500">
            Sign in as Madhesh with employee ID EMP-403 and demo PIN 1234.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Employee ID</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="EMP-403"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">PIN</span>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 text-sm disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Continue to shift'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <Clock className="h-3.5 w-3.5" />
          Shift window loads from the live staff roster after sign-in.
        </div>
      </div>
    </div>
  )
}
