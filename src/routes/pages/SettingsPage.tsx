import React, { useEffect, useState } from 'react'
import { Settings, Save, Camera, Link as LinkIcon, Radio, Smartphone } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { listVideoInputDevices } from '@/lib/preferredCamera'

export const SettingsPage: React.FC = () => {
  const ipCameraUrls = useAppStore((s) => s.ipCameraUrls)
  const setIpCameraUrl = useAppStore((s) => s.setIpCameraUrl)
  const preferredCameraLabel = useAppStore((s) => s.preferredCameraLabel)
  const setPreferredCameraLabel = useAppStore((s) => s.setPreferredCameraLabel)

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceError, setDeviceError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const counters = [
    { code: 'C1', name: 'Counter C1 (Assisted)' },
    { code: 'C2', name: 'Counter C2 (Assisted)' },
    { code: 'C3', name: 'Counter C3 (Closed)' },
    { code: 'C4', name: 'Counter C4 (Self Checkout)' },
  ]

  const refreshDevices = async () => {
    setRefreshing(true)
    setDeviceError(null)
    try {
      const list = await listVideoInputDevices()
      setDevices(list)
      if (!list.length) {
        setDeviceError('No cameras found. Open DroidCam on phone + PC, then allow browser camera access.')
      }
    } catch (e) {
      setDeviceError(e instanceof Error ? e.message : 'Could not list cameras')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    refreshDevices()
  }, [])

  const handleChange = (code: string, value: string) => {
    setIpCameraUrl(code, value)
  }

  return (
    <div className="space-y-4 select-none font-sans">
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
        {/* DroidCam / USB webcam */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-5 w-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Live Webcam / DroidCam
            </h2>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Connect DroidCam (USB or Wi‑Fi client on PC). It shows up as a webcam — we auto-pick any
            device whose name contains the label below (default <strong>DroidCam</strong>).
          </p>

          <div className="space-y-1.5 mb-4">
            <label className="text-xs font-semibold text-slate-700">Preferred camera name</label>
            <input
              type="text"
              value={preferredCameraLabel}
              onChange={(e) => setPreferredCameraLabel(e.target.value)}
              placeholder="DroidCam"
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 font-mono"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Detected cameras
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={refreshDevices}
                disabled={refreshing}
                className="h-7"
              >
                {refreshing ? 'Scanning…' : 'Refresh'}
              </Button>
            </div>
            {deviceError && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                {deviceError}
              </p>
            )}
            {devices.length > 0 && (
              <ul className="space-y-1.5">
                {devices.map((d) => {
                  const isPreferred = d.label
                    .toLowerCase()
                    .includes((preferredCameraLabel || 'DroidCam').toLowerCase())
                  return (
                    <li key={d.deviceId}>
                      <button
                        type="button"
                        onClick={() => setPreferredCameraLabel(d.label || preferredCameraLabel)}
                        className={`w-full text-left text-[11px] px-2.5 py-2 rounded-md border cursor-pointer transition-colors ${
                          isPreferred
                            ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-sky-200'
                        }`}
                      >
                        <span className="font-mono">{d.label || 'Unnamed camera'}</span>
                        {isPreferred && (
                          <span className="ml-2 text-[10px] text-emerald-700 font-bold">ACTIVE</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            Wi‑Fi DroidCam tip: phone IP stream is usually{' '}
            <code className="text-sky-700 bg-sky-50 px-1 rounded">http://PHONE_IP:4747/video</code>
            — paste that into a counter URL on the right if you prefer HTTP MJPEG over USB webcam.
          </p>
        </div>

        {/* IP Camera URLs */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              IP Camera Stream URLs
            </h2>
          </div>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Optional MJPEG/HTTP URLs per checkout lane. Leave blank to use the preferred webcam
            (DroidCam). Example:{' '}
            <span className="text-emerald-700 ml-1 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded font-mono font-semibold">
              http://192.168.1.5:4747/video
            </span>
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
                    placeholder="Leave blank for DroidCam webcam"
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
            <Button className="bg-sky-600 hover:bg-sky-700 text-white shadow-2xs font-semibold">
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
