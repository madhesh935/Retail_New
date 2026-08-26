import React, { useState } from 'react'
import {
  Users,
  Search,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CANONICAL_STAFF,
  StaffMember,
} from './staffData'

interface StaffStatusTableProps {
  onSelectStaff?: (staff: StaffMember) => void
  selectedStaffId?: string | null
}

export const StaffStatusTable: React.FC<StaffStatusTableProps> = ({
  onSelectStaff,
  selectedStaffId,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'ON_BREAK'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const availableCount = CANONICAL_STAFF.filter((s) => s.status === 'AVAILABLE').length
  const busyCount = CANONICAL_STAFF.filter((s) => s.status === 'BUSY').length
  const breakCount = CANONICAL_STAFF.filter((s) => s.status === 'ON_BREAK').length

  const filteredStaff = CANONICAL_STAFF.filter((staff) => {
    const matchesStatus =
      filterStatus === 'ALL' || staff.status === filterStatus
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.currentZone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[400px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-slate-300">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Staff Availability
            </h3>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center rounded-lg bg-[#090D14] p-1 border border-[#1E293B]">
            {[
              { key: 'ALL', label: `All (${CANONICAL_STAFF.length})` },
              { key: 'AVAILABLE', label: `Available (${availableCount})` },
              { key: 'BUSY', label: `Busy (${busyCount})` },
              { key: 'ON_BREAK', label: `Break (${breakCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key as any)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer',
                  filterStatus === tab.key
                    ? 'bg-[#1E293B] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-40">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090D14] border border-[#1E293B] rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto my-2 flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-[11px] text-slate-400 font-medium">
              <th className="py-2.5 px-3">Staff</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Current Zone</th>
              <th className="py-2.5 px-3">Active Task</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B] text-xs">
            {filteredStaff.map((staff) => {
              const isSelected = selectedStaffId === staff.id
              const isAvailable = staff.status === 'AVAILABLE'
              const isOnBreak = staff.status === 'ON_BREAK'

              return (
                <tr
                  key={staff.id}
                  onClick={() => onSelectStaff && onSelectStaff(staff)}
                  className={cn(
                    'hover:bg-[#131D31] transition-colors cursor-pointer',
                    isSelected && 'bg-[#131D31]'
                  )}
                >
                  {/* Staff ID & Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 text-[11px] font-semibold">
                        {staff.code}
                      </span>
                      <span className="font-semibold text-white text-xs">
                        {staff.name}
                      </span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                    {staff.role}
                  </td>

                  {/* Current Zone */}
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                    {staff.currentZone}
                  </td>

                  {/* Active Task */}
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-[200px] truncate">
                    {staff.currentTask}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase',
                        isAvailable
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : isOnBreak
                          ? 'bg-[#1E293B] text-slate-400'
                          : 'bg-[#1E293B] text-slate-300'
                      )}
                    >
                      {isAvailable ? 'Available' : isOnBreak ? 'On Break' : 'Busy'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onSelectStaff) onSelectStaff(staff)
                      }}
                      className="inline-flex items-center gap-0.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
        <span>Click employee row to view profile, skills, and shift history</span>
        <span className="text-emerald-400 font-medium">● Operational View Active</span>
      </div>
    </div>
  )
}
