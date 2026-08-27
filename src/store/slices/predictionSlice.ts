import { StateCreator } from 'zustand'
import { PredictionsPayload } from '@/types'

const EMPTY_PREDICTIONS: PredictionsPayload = {
  storeId: 'store-01',
  generatedAt: '',
  modelName: 'live-store-derived',
  footfallForecast: [],
  queueCongestionForecast: [],
  stockoutForecast: [],
  staffingDemandForecast: [],
}

export interface PredictionSlice {
  predictions: PredictionsPayload
  isLoadingPredictions: boolean

  setPredictions: (predictions: PredictionsPayload) => void
  setLoadingPredictions: (loading: boolean) => void
}

export const createPredictionSlice: StateCreator<PredictionSlice, [], [], PredictionSlice> = (set) => ({
  predictions: EMPTY_PREDICTIONS,
  isLoadingPredictions: false,

  setPredictions: (predictions) => set({ predictions }),
  setLoadingPredictions: (isLoadingPredictions) => set({ isLoadingPredictions }),
})
