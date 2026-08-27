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

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  ipCameraUrls: {
    'C1': '',
    'C2': '',
    'C3': '',
    'C4': ''
  },
  cameraRois: {
    'C1': { x: 0, y: 0, width: 1, height: 1 },
    'C2': { x: 0, y: 0, width: 1, height: 1 },
    'C3': { x: 0, y: 0, width: 1, height: 1 },
    'C4': { x: 0, y: 0, width: 1, height: 1 },
  },
  preferredCameraLabel: 'DroidCam',
  setIpCameraUrl: (laneCode, url) =>
    set((state) => ({
      ipCameraUrls: { ...state.ipCameraUrls, [laneCode]: url },
    })),
  setCameraRoi: (laneCode, roi) =>
    set((state) => ({
      cameraRois: { ...state.cameraRois, [laneCode]: roi },
    })),
  setPreferredCameraLabel: (preferredCameraLabel) => set({ preferredCameraLabel }),
})
