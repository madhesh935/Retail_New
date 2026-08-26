import React from 'react'
import { Settings, Save, Camera, Link as LinkIcon, Radio } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

export const SettingsPage: React.FC = () => {
  const ipCameraUrls = useAppStore((s) => s.ipCameraUrls)
  const setIpCameraUrl = useAppStore((s) => s.setIpCameraUrl)

  const counters = [
    { code: 'C1', name: 'Counter C1 (Assisted)' },
    { code: 'C2', name: 'Counter C2 (Assisted)' },
    { code: 'C3', name: 'Counter C3 (Closed)' },
    { code: 'C4', name: 'Counter C4 (Self Checkout)' },
  ]

  const handleChange = (code: string, value: string) => {
    setIpCameraUrl(code, value)
  }

  return (
    <div className="space-y-4 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Settings className="h-4 w-4 text-cyan-400" />
              <span>System Settings</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-medium">
              Edge Configuration
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              IP Camera Stream URLs
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 font-mono leading-relaxed">
            Configure the MJPEG/HTTP video stream URLs for your IP camera application.
            Leave blank to fall back to the default local webcam. Example: 
            <span className="text-emerald-400 ml-1 bg-emerald-950/40 px-1 py-0.5 rounded">http://192.168.1.5:8080/video</span>
          </p>

          <div className="space-y-5">
            {counters.map((counter) => (
              <div key={counter.code} className="space-y-1.5 font-mono">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>{counter.name} Stream URL</span>
                  <span className="text-[10px] text-slate-500">{counter.code}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={ipCameraUrls[counter.code] || ''}
                    onChange={(e) => handleChange(counter.code, e.target.value)}
                    placeholder={`e.g. http://192.168.1.10${counter.code.replace('C', '')}:8080/video`}
                    className="block w-full pl-9 pr-3 py-2 bg-[#090D14] border border-[#1E293B] rounded-md text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  />
                  {ipCameraUrls[counter.code] && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-[#1E293B] flex justify-end">
            <Button
              className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20"
              onClick={() => {
                // Settings are auto-saved in Zustand memory, but we could add toast here
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
