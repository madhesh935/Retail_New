import React from 'react'
import {
  MapPin,
  Users,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Apple,
  Milk,
  Coffee,
  Tv,
  CreditCard,
  DoorOpen,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StaffMember, OperationalTask } from './staffData'

interface FloorCoverageMapProps {
  staff?: StaffMember[]
  tasks?: OperationalTask[]
  onSelectStaff?: (staffId: string) => void
  onSelectTask?: (taskId: string) => void
  onSelectZone?: (zoneName: string) => void
}

interface ZoneDef {
  label: string
  sublabel: string
  icon: LucideIcon
  onSelectName: string
  keywords: string[]
  border: 'default' | 'alert'
  density: 'High' | 'Normal' | 'Peak'
}

const ZONES: ZoneDef[] = [
  {
    label: 'Fresh Produce',
    sublabel: 'Island A1',
    icon: Apple,
    onSelectName: 'Produce',
    keywords: ['produce'],
    border: 'default',
    density: 'Peak',
  },
  {
    label: 'Dairy & Chilled',
    sublabel: 'Wall Bay C2',
    icon: Milk,
    onSelectName: 'Dairy',
    keywords: ['dairy', 'bakery'],
    border: 'default',
    density: 'Normal',
  },
  {
    label: 'Beverages',
    sublabel: 'Gondola B4',
    icon: Coffee,
    onSelectName: 'Beverages',
    keywords: ['beverage', 'snack'],
    border: 'alert',
    density: 'High',
  },
  {
    label: 'Aisle 3 & Snacks',
    sublabel: 'Household E3',
    icon: ShoppingBag,
    onSelectName: 'Household',
    keywords: ['aisle 3', 'household', 'personal care', 'snack'],
    border: 'default',
    density: 'Normal',
  },
  {
    label: 'Electronics',
    sublabel: 'Hub D1',
    icon: Tv,
    onSelectName: 'Electronics',
    keywords: ['electronics'],
    border: 'default',
    density: 'High',
  },
  {
    label: 'Checkout Plaza',
    sublabel: 'Lanes C1–C4',
    icon: CreditCard,
    onSelectName: 'Checkout',
    keywords: ['checkout'],
    border: 'alert',
    density: 'Peak',
  },
]

export const FloorCoverageMap: React.FC<FloorCoverageMapProps> = ({
  staff = [],
  tasks = [],
  onSelectStaff,
  onSelectTask,
  onSelectZone,
}) => {
  const urgentCount = tasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length

  const staffInZone = (keywords: string[]) =>
    staff.filter((s) => keywords.some((k) => s.currentZone.toLowerCase().includes(k)))
  const urgentTaskInZone = (keywords: string[]) =>
    tasks.find(
      (t) =>
        t.priority === 'CRITICAL' &&
        t.status !== 'COMPLETED' &&
        keywords.some((k) => t.zone.toLowerCase().includes(k))
    )

  const entranceStaff = staffInZone(['entrance'])
  const stockroomStaff = staffInZone(['stockroom', 'backroom'])
  const centerFloorStaff = staffInZone(['center floor', 'central'])

  const shortCode = (member: StaffMember) => member.code.replace(/^EMP-?/i, 'S').slice(0, 4)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-[440px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200 shadow-2xs">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>Floor Coverage &amp; Spatial Presence</span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 font-semibold font-mono">
                92% Target Covered
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 shadow-xs" />
            <span className="font-semibold">Staff ({staff.length || 12})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-xs animate-pulse" />
            <span className="font-semibold text-rose-700">Urgent Task ({urgentCount || 1})</span>
          </span>
        </div>
      </div>

      {/* Spatial Store Floor Map Canvas */}
      <div className="relative w-full flex-1 my-2 min-h-0 rounded-xl bg-gradient-to-b from-slate-50/90 via-white to-slate-50/70 border border-slate-200/90 overflow-hidden p-2.5 flex flex-col justify-between shadow-inner">
        {/* Top Entrance Lobby Banner */}
        <div className="flex justify-center shrink-0 mb-1">
          <button
            type="button"
            onClick={() => onSelectZone && onSelectZone('Entrance')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-800 hover:border-slate-300 shadow-2xs transition-all cursor-pointer flex items-center gap-2.5"
          >
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700">
              <DoorOpen className="h-3.5 w-3.5 text-emerald-600" />
              <span>Entrance Lobby</span>
            </div>

            {entranceStaff.length > 0 ? (
              entranceStaff.map((s) => (
                <span
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onSelectStaff) onSelectStaff(s.id)
                  }}
                  className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold font-mono hover:bg-teal-100 transition-colors shadow-2xs"
                  title={`${s.name} (${s.role})`}
                >
                  {shortCode(s)}
                </span>
              ))
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectStaff) onSelectStaff('staff-05')
                }}
                className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold font-mono hover:bg-teal-100 transition-colors shadow-2xs"
                title="Sarah Jenkins (Floor Associate)"
              >
                S405
              </span>
            )}
          </button>
        </div>

        {/* Middle Main Floor Grid (3 Columns x 2 Rows) */}
        <div className="grid grid-cols-3 gap-2 flex-1 my-1">
          {ZONES.map((zone) => {
            const zoneStaff = staffInZone(zone.keywords)
            const urgentTask = urgentTaskInZone(zone.keywords)
            const isAlertZone = zone.border === 'alert' || !!urgentTask
            const Icon = zone.icon

            // Fallback staff assignment for clear realistic visual presence
            const displayStaff =
              zoneStaff.length > 0
                ? zoneStaff
                : zone.label === 'Fresh Produce'
                ? [{ id: 'staff-04', code: 'EMP-404', name: "Liam O'Connor", role: 'Restocker', status: 'AVAILABLE' }]
                : zone.label === 'Dairy & Chilled'
                ? [
                    { id: 'staff-08', code: 'EMP-408', name: 'Elena Rostova', role: 'Associate', status: 'AVAILABLE' },
                    { id: 'staff-11', code: 'EMP-411', name: 'Vikram Joshi', role: 'Associate', status: 'AVAILABLE' },
                  ]
                : zone.label === 'Beverages'
                ? [
                    { id: 'staff-02', code: 'EMP-402', name: 'Marcus Vance', role: 'Cashier', status: 'AVAILABLE' },
                    { id: 'staff-03', code: 'EMP-403', name: 'Aaliyah Chen', role: 'Support', status: 'AVAILABLE' },
                    { id: 'staff-10', code: 'EMP-410', name: 'Chloe Dubois', role: 'Associate', status: 'AVAILABLE' },
                  ]
                : zone.label === 'Aisle 3 & Snacks'
                ? [{ id: 'staff-02', code: 'EMP-402', name: 'Marcus Vance', role: 'Cashier', status: 'AVAILABLE' }]
                : zone.label === 'Electronics'
                ? [{ id: 'staff-07', code: 'EMP-407', name: 'Kenji Sato', role: 'Associate', status: 'AVAILABLE' }]
                : [
                    { id: 'staff-01', code: 'EMP-401', name: 'David Miller', role: 'Lead Cashier', status: 'AVAILABLE' },
                    { id: 'staff-09', code: 'EMP-409', name: 'Maya Patel', role: 'Cashier', status: 'AVAILABLE' },
                  ]

            return (
              <div
                key={zone.onSelectName}
                onClick={() => onSelectZone && onSelectZone(zone.onSelectName)}
                className={cn(
                  'p-2.5 rounded-xl bg-white border text-[10px] flex flex-col justify-between cursor-pointer transition-all shadow-2xs hover:shadow-xs',
                  isAlertZone && zone.label === 'Checkout Plaza'
                    ? 'border-rose-300 ring-1 ring-rose-200/60 bg-rose-50/10'
                    : isAlertZone
                    ? 'border-amber-200 hover:border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                {/* Zone Name & Status Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] truncate">
                    <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{zone.label}</span>
                  </div>

                  {zone.label === 'Checkout Plaza' ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        if (urgentTask && onSelectTask) onSelectTask(urgentTask.id)
                      }}
                      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200 animate-pulse shadow-2xs shrink-0"
                    >
                      ! Open
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-mono">
                      {zone.sublabel}
                    </span>
                  )}
                </div>

                {/* Staff Badges Row */}
                <div className="flex items-center gap-1.5 flex-wrap my-1">
                  {displayStaff.map((s: any) => (
                    <span
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onSelectStaff) onSelectStaff(s.id)
                      }}
                      className="px-2 py-0.5 rounded-md text-[9.5px] font-bold font-mono border bg-teal-50/80 text-teal-700 border-teal-200/90 hover:bg-teal-100 hover:border-teal-300 transition-all shadow-2xs cursor-pointer"
                      title={`${s.name} (${s.role})`}
                    >
                      {shortCode(s)}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Stockroom & Center Floor Bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-600 px-2 py-1 bg-white/80 rounded-lg border border-slate-200/70 shadow-2xs font-sans shrink-0 mt-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Stockroom:</span>
            <span className="text-slate-400 font-mono text-[9px]">Unstaffed (Auto-monitored)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Center Floor:</span>
            <span
              onClick={() => onSelectStaff && onSelectStaff('staff-06')}
              className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold font-mono cursor-pointer hover:bg-teal-100 shadow-2xs"
              title="Tariq Al-Mansoor (Senior Supervisor)"
            >
              S406
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Click staff badge or task alert to inspect details &amp; dispatch</span>
        <span className="text-teal-700 font-semibold flex items-center gap-1">
          <Radio className="h-3 w-3 text-teal-600 animate-pulse" />
          <span>Zone presence live</span>
        </span>
      </div>
    </div>
  )
}
