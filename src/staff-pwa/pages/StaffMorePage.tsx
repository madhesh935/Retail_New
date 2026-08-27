import React, { useState } from 'react'
import {
  User,
  CalendarClock,
  Megaphone,
  ShieldAlert,
  BookOpen,
  Settings,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Bell,
  Wifi,
  Volume2,
  Check,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { ShiftCheckoutConfirmSheet } from '../components/ShiftCheckoutConfirmSheet'

interface StaffMorePageProps {
  onOpenHandover: () => void
  onOpenReportIssue: () => void
  onOpenNotifications: () => void
}

export const StaffMorePage: React.FC<StaffMorePageProps> = ({
  onOpenHandover,
  onOpenReportIssue,
  onOpenNotifications,
}) => {
  const navigate = useNavigate()
  const {
    authenticatedStaff,
    attendanceState,
    operationalStatus,
    setOperationalStatus,
    storeAnnouncements,
    acknowledgeAnnouncement,
    checkOutShift,
    pendingTasks,
  } = useAppStore()

  const [activeSopModal, setActiveSopModal] = useState<string | null>(null)
  const [offlineMode, setOfflineMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false)

  const staffName = authenticatedStaff?.name || 'Madhesh'
  const employeeId = authenticatedStaff?.employeeId || 'EMP-404'
  const role = authenticatedStaff?.role || 'Inventory Restocker'
  const shift = authenticatedStaff?.shift || 'Shift B'
  const storeName = authenticatedStaff?.storeName || 'Chennai Central'

  const unfinishedTaskCount = (pendingTasks || []).filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'VERIFIED'
  ).length

  const handleCheckout = () => {
    setShowCheckoutConfirm(true)
  }

  const confirmCheckout = () => {
    setShowCheckoutConfirm(false)
    checkOutShift(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    navigate('/staff/login', { replace: true })
  }

  const SOPS = [
    {
      id: 'sop-spill',
      title: 'Spill & Liquid Hazard Cleanup',
      steps: [
        '1. Secure perimeter & place Yellow Caution Cone immediately.',
        '2. Absorb liquid thoroughly with spill pads & mop.',
        '3. Inspect floor surface for complete dryness.',
        '4. Remove cone and log task completion in app.',
      ],
    },
    {
      id: 'sop-restock',
      title: 'Shelf Restock & Planogram Facing',
      steps: [
        '1. Scan shelf QR code to verify target SKU & capacity.',
        '2. Retrieve stock boxes from indicated Backroom Bay.',
        '3. Place items front-facing with barcodes aligned.',
        '4. Pull front items flush with shelf edge.',
      ],
    },
    {
      id: 'sop-backroom',
      title: 'Backroom Item Retrieval for Shopper',
      steps: [
        '1. Verify SKU in Backroom storage rack indicated in Assist tab.',
        '2. Inspect product packaging for intact seal and expiry.',
        '3. Tap "Item Found" in Staff app to notify customer.',
        '4. Deliver to shopper in indicated aisle.',
      ],
    },
  ]

  return (
    <div className="space-y-3.5 p-4 pb-28">
      {/* 1. Worker Profile Card */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-base flex items-center justify-center shadow-xs">
            {staffName.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{staffName}</h2>
            <div className="text-xs text-slate-500 font-medium">{role}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded font-mono">
                {employeeId}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{storeName}</span>
            </div>
          </div>
        </div>

        {/* Operational Status Selector */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Operational Availability</span>
          <select
            value={operationalStatus}
            onChange={(e) => setOperationalStatus(e.target.value as any)}
            className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition-all shadow-2xs ${
              operationalStatus === 'AVAILABLE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : operationalStatus === 'BUSY'
                ? 'bg-blue-50 text-blue-800 border-blue-200/80'
                : 'bg-amber-50 text-amber-800 border-amber-200/80'
            }`}
          >
            <option value="AVAILABLE">● Available for Dispatch</option>
            <option value="BUSY">● Busy on Task</option>
            <option value="ON_BREAK">● On Break</option>
          </select>
        </div>
      </div>

      {/* 2. Primary Action Menu */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] divide-y divide-slate-100">
        {/* Shift Handover */}
        <button
          type="button"
          onClick={onOpenHandover}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CalendarClock className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Shift Handover</div>
              <div className="text-[11px] text-slate-500">Log handover notes for incoming shift</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Store Announcements */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Megaphone className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Store Announcements</div>
              <div className="text-[11px] text-slate-500">{storeAnnouncements.length} notices posted today</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Report Issue */}
        <button
          type="button"
          onClick={onOpenReportIssue}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Report Store Issue</div>
              <div className="text-[11px] text-slate-500">Log safety hazard, missing tag or defect</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 3. SOPs & Standard Procedures */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Store Operating Guides (SOP)</h3>
        </div>

        <div className="space-y-1.5">
          {SOPS.map((sop) => (
            <div key={sop.id} className="border border-slate-200/80 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveSopModal(activeSopModal === sop.id ? null : sop.id)}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 transition-colors text-left"
              >
                <span>{sop.title}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    activeSopModal === sop.id ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {activeSopModal === sop.id && (
                <div className="p-3 bg-white space-y-1.5 text-xs text-slate-700 border-t border-slate-200/80">
                  {sop.steps.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. App Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5 text-xs">
        <div className="flex items-center gap-2 px-1">
          <Settings className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preferences</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-900 block">Local Store Network</span>
                <span className="text-[10px] text-slate-500">Connected to Jetson Edge Gateway</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-600" />
              <div>
                <span className="font-bold text-slate-900 block">Audio & Haptic Alerts</span>
                <span className="text-[10px] text-slate-500">Chime on new urgent dispatch</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-slate-900 rounded"
            />
          </div>
        </div>
      </div>

      {/* 5. Check Out / Logout */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleCheckout}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200/80 flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Check Out of Shift & Logout</span>
        </button>
      </div>

      <ShiftCheckoutConfirmSheet
        isOpen={showCheckoutConfirm}
        staffName={staffName}
        unfinishedTaskCount={unfinishedTaskCount}
        onClose={() => setShowCheckoutConfirm(false)}
        onConfirm={confirmCheckout}
      />
    </div>
  )
}
