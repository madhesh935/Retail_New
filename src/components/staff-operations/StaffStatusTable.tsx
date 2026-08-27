import React, { useState } from 'react'
import {
  Users,
  Search,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  StaffMember,
} from './staffData'

interface StaffStatusTableProps {
  staff: StaffMember[]
  onSelectStaff?: (staff: StaffMember) => void
  selectedStaffId?: string | null
}

export const StaffStatusTable: React.FC<StaffStatusTableProps> = ({
  staff,
  onSelectStaff,
  selectedStaffId,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'ON_BREAK'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const availableCount = staff.filter((s) => s.status === 'AVAILABLE').length
  const busyCount = staff.filter((s) => s.status === 'BUSY').length
  const breakCount = staff.filter((s) => s.status === 'ON_BREAK').length

  const filteredStaff = staff.filter((member) => {
    const matchesStatus =
      filterStatus === 'ALL' || member.status === filterStatus
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.currentZone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[400px] font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Staff Availability
            </h3>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200">
            {[
              { key: 'ALL', label: `All (${staff.length})` },
              { key: 'AVAILABLE', label: `Available (${availableCount})` },
              { key: 'BUSY', label: `Busy (${busyCount})` },
              { key: 'ON_BREAK', label: `Break (${breakCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key as any)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer',
                  filterStatus === tab.key
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-40">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto my-2 flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-medium">
              <th className="py-2.5 px-3">Staff</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Current Zone</th>
              <th className="py-2.5 px-3">Active Task</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredStaff.map((staff) => {
              const isSelected = selectedStaffId === staff.id
              const isAvailable = staff.status === 'AVAILABLE'
              const isOnBreak = staff.status === 'ON_BREAK'

              return (
                <tr
                  key={staff.id}
                  onClick={() => onSelectStaff && onSelectStaff(staff)}
                  className={cn(
                    'hover:bg-slate-50 transition-colors cursor-pointer',
                    isSelected && 'bg-sky-50/50'
                  )}
                >
                  {/* Staff ID & Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sky-700 text-[11px] font-bold">
                        {staff.code}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {staff.name}
                      </span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {staff.role}
                  </td>

                  {/* Current Zone */}
                  <td className="py-2.5 px-3 text-slate-700 font-medium text-[11px]">
                    {staff.currentZone}
                  </td>

                  {/* Active Task */}
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[200px] truncate">
                    {staff.currentTask}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isOnBreak
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
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
                      className="inline-flex items-center gap-0.5 text-[11px] text-sky-700 hover:text-sky-800 font-semibold cursor-pointer"
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
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Click employee row to view profile, skills, and shift history</span>
        <span className="text-emerald-700 font-semibold">● Operational View Active</span>
      </div>
    </div>
  )
}
