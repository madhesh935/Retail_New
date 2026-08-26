import { StateCreator } from 'zustand'
import { PredictionsPayload } from '@/types'
import { MOCK_PREDICTIONS } from '@/services/mock/mockData'

export interface PredictionSlice {
  predictions: PredictionsPayload
  isLoadingPredictions: boolean

  setPredictions: (predictions: PredictionsPayload) => void
  setLoadingPredictions: (loading: boolean) => void
}

export const createPredictionSlice: StateCreator<PredictionSlice, [], [], PredictionSlice> = (set) => ({
  predictions: MOCK_PREDICTIONS,
  isLoadingPredictions: false,

  setPredictions: (predictions) => set({ predictions }),
  setLoadingPredictions: (isLoadingPredictions) => set({ isLoadingPredictions }),
})
