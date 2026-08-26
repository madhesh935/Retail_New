export interface FootfallForecastPoint {
  timeSlot: string
  forecastCount: number
  lowerBound: number
  upperBound: number
  historicalAverage: number
}

export interface QueueCongestionForecast {
  targetTime: string
  predictedQueueCount: number
  predictedWaitTimeSeconds: number
  recommendedOpenLanes: number
  confidence: number
}

export interface StockoutForecast {
  sku: string
  productName: string
  zoneName: string
  predictedDepletionTime: string
  timeRemainingMinutes: number
  recommendedRestockUnits: number
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface PredictionsPayload {
  storeId: string
  generatedAt: string
  modelName: string
  footfallForecast: FootfallForecastPoint[]
  queueCongestionForecast: QueueCongestionForecast[]
  stockoutForecast: StockoutForecast[]
  staffingDemandForecast: {
    hour: string
    recommendedCashiers: number
    recommendedFloorStaff: number
  }[]
}
