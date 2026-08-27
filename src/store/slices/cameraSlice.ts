import { StateCreator } from 'zustand'
import { CameraFeed, CameraAnalyticsSummary } from '@/types'

const EMPTY_CAMERA_SUMMARY: CameraAnalyticsSummary = {
  totalCameras: 0,
  onlineCameras: 0,
  degradedCameras: 0,
  offlineCameras: 0,
  averageInferenceLatencyMs: 0,
  averageFps: 0,
  totalDetectionsLastMinute: 0,
}

export interface CameraSlice {
  cameras: CameraFeed[]
  cameraSummary: CameraAnalyticsSummary
  selectedCameraId: string | null
  isLoadingCameras: boolean

  setCameras: (cameras: CameraFeed[]) => void
  setSelectedCameraId: (id: string | null) => void
  updateCameraFps: (cameraId: string, fps: number, latencyMs: number) => void
  updateCameraStatus: (cameraId: string, status: CameraFeed['status']) => void
  setLoadingCameras: (loading: boolean) => void
}

export const createCameraSlice: StateCreator<CameraSlice, [], [], CameraSlice> = (set) => ({
  cameras: [],
  cameraSummary: EMPTY_CAMERA_SUMMARY,
  selectedCameraId: null,
  isLoadingCameras: false,

  setCameras: (cameras) => {
    const online = cameras.filter((c) => c.status === 'ONLINE').length
    const degraded = cameras.filter((c) => c.status === 'DEGRADED').length
    const offline = cameras.filter((c) => c.status === 'OFFLINE').length
    const avgLatency = cameras.reduce((acc, c) => acc + c.inferenceLatencyMs, 0) / (cameras.length || 1)
    const avgFps = cameras.reduce((acc, c) => acc + c.fps, 0) / (cameras.length || 1)

    set({
      cameras,
      cameraSummary: {
        totalCameras: cameras.length,
        onlineCameras: online,
        degradedCameras: degraded,
        offlineCameras: offline,
        averageInferenceLatencyMs: parseFloat(avgLatency.toFixed(1)),
        averageFps: parseFloat(avgFps.toFixed(1)),
        totalDetectionsLastMinute: cameras.reduce((acc, c) => acc + c.activeDetectionsCount, 0),
      },
    })
  },
  setSelectedCameraId: (selectedCameraId) => set({ selectedCameraId }),
  updateCameraFps: (cameraId, fps, latencyMs) =>
    set((state) => ({
      cameras: state.cameras.map((cam) =>
        cam.id === cameraId ? { ...cam, fps, inferenceLatencyMs: latencyMs } : cam
      ),
    })),
  updateCameraStatus: (cameraId, status) =>
    set((state) => ({
      cameras: state.cameras.map((cam) =>
        cam.id === cameraId ? { ...cam, status } : cam
      ),
    })),
  setLoadingCameras: (isLoadingCameras) => set({ isLoadingCameras }),
})
