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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="h-4 w-4 text-sky-600" />
              <span>System Settings</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
              Edge Configuration
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              IP Camera Stream URLs
            </h2>
          </div>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Configure the MJPEG/HTTP video stream URLs for your IP camera application.
            Leave blank to fall back to the default local webcam. Example: 
            <span className="text-emerald-700 ml-1 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded font-mono font-semibold">http://192.168.1.5:8080/video</span>
          </p>

          <div className="space-y-5">
            {counters.map((counter) => (
              <div key={counter.code} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>{counter.name} Stream URL</span>
                  <span className="text-[10px] text-slate-400 font-mono">{counter.code}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={ipCameraUrls[counter.code] || ''}
                    onChange={(e) => handleChange(counter.code, e.target.value)}
                    placeholder={`e.g. http://192.168.1.10${counter.code.replace('C', '')}:8080/video`}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors shadow-2xs font-mono"
                  />
                  {ipCameraUrls[counter.code] && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
            <Button
              className="bg-sky-600 hover:bg-sky-700 text-white shadow-2xs font-semibold"
              onClick={() => {
                // Settings are auto-saved in Zustand memory
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
