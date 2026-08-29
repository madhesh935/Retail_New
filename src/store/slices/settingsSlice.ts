import { StateCreator } from 'zustand'

export interface CameraRoi {
  x: number // percentage (0-1)
  y: number // percentage (0-1)
  width: number // percentage (0-1)
  height: number // percentage (0-1)
}

export interface SettingsSlice {
  ipCameraUrls: Record<string, string>
  cameraRois: Record<string, CameraRoi>
  /** Substring match for USB webcam label — default prefers DroidCam */
  preferredCameraLabel: string
  setIpCameraUrl: (laneCode: string, url: string) => void
  setCameraRoi: (laneCode: string, roi: CameraRoi) => void
  setPreferredCameraLabel: (label: string) => void
}

const DEFAULT_IP_CAMERA_URLS: Record<string, string> = { C1: '', C2: '', C3: '', C4: '' }
const DEFAULT_CAMERA_ROIS: Record<string, CameraRoi> = {
  C1: { x: 0, y: 0, width: 1, height: 1 },
  C2: { x: 0, y: 0, width: 1, height: 1 },
  C3: { x: 0, y: 0, width: 1, height: 1 },
  C4: { x: 0, y: 0, width: 1, height: 1 },
}
const DEFAULT_PREFERRED_CAMERA_LABEL = 'DroidCam'

const CAMERA_SETTINGS_KEY = 'retail-edge-camera-settings'

function loadCameraSettings(): {
  ipCameraUrls: Record<string, string>
  cameraRois: Record<string, CameraRoi>
  preferredCameraLabel: string
} {
  if (typeof window === 'undefined') {
    return {
      ipCameraUrls: DEFAULT_IP_CAMERA_URLS,
      cameraRois: DEFAULT_CAMERA_ROIS,
      preferredCameraLabel: DEFAULT_PREFERRED_CAMERA_LABEL,
    }
  }
  try {
    const raw = window.localStorage.getItem(CAMERA_SETTINGS_KEY)
    if (!raw) throw new Error('no saved camera settings')
    const parsed = JSON.parse(raw)
    return {
      ipCameraUrls: { ...DEFAULT_IP_CAMERA_URLS, ...(parsed.ipCameraUrls || {}) },
      cameraRois: { ...DEFAULT_CAMERA_ROIS, ...(parsed.cameraRois || {}) },
      preferredCameraLabel: parsed.preferredCameraLabel || DEFAULT_PREFERRED_CAMERA_LABEL,
    }
  } catch {
    return {
      ipCameraUrls: DEFAULT_IP_CAMERA_URLS,
      cameraRois: DEFAULT_CAMERA_ROIS,
      preferredCameraLabel: DEFAULT_PREFERRED_CAMERA_LABEL,
    }
  }
}

function saveCameraSettings(settings: {
  ipCameraUrls: Record<string, string>
  cameraRois: Record<string, CameraRoi>
  preferredCameraLabel: string
}) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CAMERA_SETTINGS_KEY, JSON.stringify(settings))
}

const savedCameraSettings = loadCameraSettings()

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set, get) => ({
  ipCameraUrls: savedCameraSettings.ipCameraUrls,
  cameraRois: savedCameraSettings.cameraRois,
  preferredCameraLabel: savedCameraSettings.preferredCameraLabel,
  setIpCameraUrl: (laneCode, url) => {
    set((state) => ({
      ipCameraUrls: { ...state.ipCameraUrls, [laneCode]: url },
    }))
    const state = get()
    saveCameraSettings({
      ipCameraUrls: state.ipCameraUrls,
      cameraRois: state.cameraRois,
      preferredCameraLabel: state.preferredCameraLabel,
    })
  },
  setCameraRoi: (laneCode, roi) => {
    set((state) => ({
      cameraRois: { ...state.cameraRois, [laneCode]: roi },
    }))
    const state = get()
    saveCameraSettings({
      ipCameraUrls: state.ipCameraUrls,
      cameraRois: state.cameraRois,
      preferredCameraLabel: state.preferredCameraLabel,
    })
  },
  setPreferredCameraLabel: (preferredCameraLabel) => {
    set({ preferredCameraLabel })
    const state = get()
    saveCameraSettings({
      ipCameraUrls: state.ipCameraUrls,
      cameraRois: state.cameraRois,
      preferredCameraLabel,
    })
  },
})
