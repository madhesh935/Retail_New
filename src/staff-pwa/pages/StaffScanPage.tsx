import React, { useState, useRef, useEffect } from 'react'
import {
  ScanBarcode,
  Search,
  MapPin,
  Tag,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Compass,
  Layers,
} from 'lucide-react'
import { QuickShelfCheckModal } from '../components/QuickShelfCheckModal'
import { PriceCheckModal } from '../components/PriceCheckModal'
import { useAppStore } from '@/store/useAppStore'

interface StaffScanPageProps {
  onOpenMap: (destination: string, zone?: string, shelf?: string) => void
  onOpenReportIssue?: () => void
}

type ScanType = 'PRODUCT' | 'SHELF' | 'LABEL' | 'LOCATION'

export const StaffScanPage: React.FC<StaffScanPageProps> = ({ onOpenMap, onOpenReportIssue }) => {
  const { shelfItems } = useAppStore()
  const [scanType, setScanType] = useState<ScanType>('PRODUCT')
  const [manualQuery, setManualQuery] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [activeResult, setActiveResult] = useState<'PRODUCT' | 'SHELF' | null>('PRODUCT')

  // Modals
  const [isShelfCheckOpen, setIsShelfCheckOpen] = useState(false)
  const [isPriceCheckOpen, setIsPriceCheckOpen] = useState(false)
  const [shelfObservation, setShelfObservation] = useState<string | null>(null)

  // Camera video ref and state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  // Start real camera stream with fallback
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null)
    try {
      // Stop current stream if running
      if (videoRef.current && videoRef.current.srcObject) {
        const curStream = videoRef.current.srcObject as MediaStream
        curStream.getTracks().forEach((t) => t.stop())
        videoRef.current.srcObject = null
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.')
      }

      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
          audio: false,
        })
      } catch {
        // Fallback: request any camera available
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch {
          // autoPlay handles play in most modern browsers
        }
        setCameraActive(true)
        setFacingMode(mode)
      }
    } catch (e: any) {
      console.warn('Camera stream notice:', e)
      setCameraActive(false)
      setCameraError(e.message || 'Camera permission denied or camera not found.')
    }
  }

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    startCamera(nextMode)
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  // Attempt auto-start on mount
  useEffect(() => {
    startCamera('environment')
    return () => {
      stopCamera()
    }
  }, [])

  const handleSimulateScan = (type: 'PRODUCT' | 'SHELF') => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setActiveResult(type)
    }, 350)
  }

  return (
    <div className="space-y-3.5 p-4 pb-28">
      {/* Top Selector: Scan Modes */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => {
              setScanType('PRODUCT')
              handleSimulateScan('PRODUCT')
            }}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-all ${
              scanType === 'PRODUCT' ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Product
          </button>
          <button
            type="button"
            onClick={() => {
              setScanType('SHELF')
              handleSimulateScan('SHELF')
            }}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-all ${
              scanType === 'SHELF' ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Shelf QR
          </button>
          <button
            type="button"
            onClick={() => {
              setScanType('LABEL')
              setIsPriceCheckOpen(true)
            }}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-all ${
              scanType === 'LABEL' ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Price Tag
          </button>
          <button
            type="button"
            onClick={() => {
              setScanType('LOCATION')
              onOpenMap('Stockroom Bay 3B', 'Stockroom', 'Bay 3B')
            }}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-all ${
              scanType === 'LOCATION' ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Location
          </button>
        </div>
      </div>

      {/* Camera Viewport Scanner Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-800">
          {/* Always-mounted video stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraActive ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          />

          {!cameraActive && (
            <div className="text-center p-4 space-y-2 z-10">
              <ScanBarcode className="w-9 h-9 text-blue-400 mx-auto animate-pulse" />
              <div className="text-xs font-bold text-slate-200">
                {cameraError ? 'Camera Unavailable' : 'Optical Scanner Ready'}
              </div>
              <p className="text-[10px] text-slate-400">
                {cameraError ? cameraError : 'Position barcode or shelf QR within target reticle'}
              </p>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white rounded-lg shadow-sm transition-all"
              >
                Enable Camera Feed
              </button>
            </div>
          )}

          {/* Scanner Controls Overlay */}
          {cameraActive && (
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-xs p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={toggleFacingMode}
                title="Switch Camera (Front/Rear)"
                className="px-2 py-1 text-[10px] font-bold text-white hover:text-blue-300 rounded-md transition-colors"
              >
                Flip
              </button>
              <button
                type="button"
                onClick={stopCamera}
                title="Turn Off Camera"
                className="px-2 py-1 text-[10px] font-bold text-rose-300 hover:text-rose-200 rounded-md transition-colors"
              >
                Off
              </button>
            </div>
          )}

          {/* Scanner Target Frame Reticle */}
          <div className="absolute inset-x-12 inset-y-6 pointer-events-none border-2 border-blue-400/80 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] z-10">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-3 border-l-3 border-blue-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-3 border-r-3 border-blue-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-3 border-l-3 border-blue-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-3 border-r-3 border-blue-400" />
            {/* Laser Line */}
            <div className={`absolute top-1/2 inset-x-0 h-0.5 ${isScanning ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-500/80 shadow-[0_0_8px_#f43f5e]'} animate-pulse`} />
          </div>
        </div>

        {/* Quick Sample Scan Chips */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Sample Barcodes</div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
            <button
              type="button"
              onClick={() => handleSimulateScan('PRODUCT')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-800 rounded-lg whitespace-nowrap border border-slate-200 transition-colors"
            >
              🥤 Cola Zero (B4)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScan('SHELF')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-800 rounded-lg whitespace-nowrap border border-slate-200 transition-colors"
            >
              📍 Shelf B4 QR
            </button>
            <button
              type="button"
              onClick={() => setIsPriceCheckOpen(true)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-800 rounded-lg whitespace-nowrap border border-slate-200 transition-colors"
            >
              🏷️ Price Check
            </button>
          </div>
        </div>
      </div>

      {/* Manual Search Fallback */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={manualQuery}
          onChange={(e) => setManualQuery(e.target.value)}
          placeholder="Manual SKU or Barcode entry (e.g. SKU-BEV-1029)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        />
      </div>

      {/* 1. PRODUCT SCAN RESULT */}
      {activeResult === 'PRODUCT' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] animate-in fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                  SKU-BEV-1029
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/70 uppercase">
                  Replenishment Needed
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">Sparkling Cola Zero 12-Pack</h3>
              <div className="text-xs text-slate-500 font-medium">Wave Beverages • 330ml Cans</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">POS Price</span>
              <span className="text-base font-bold text-slate-900 font-mono">₹64.00</span>
            </div>
          </div>

          {/* Location & Stock Grid */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Shelf</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">B4 (Aisle 4)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Shelf Stock</span>
              <span className="text-xs font-bold text-rose-600 font-mono mt-0.5 block">17% (8 units)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Backroom</span>
              <span className="text-xs font-bold text-emerald-700 font-mono mt-0.5 block">14 units</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenMap('Shelf B4 — Cold Beverages', 'Beverages', 'B4')}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Locate Shelf B4</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenMap('Backroom Bay 3B (Pallet 3)', 'Stockroom', 'Bay 3B')}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Locate Backroom</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPriceCheckOpen(true)}
              className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span>Verify Price</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenReportIssue && onOpenReportIssue()}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. SHELF SCAN RESULT */}
      {activeResult === 'SHELF' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] animate-in fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200/80 font-mono">
                  SHELF B4
                </span>
                <span className="text-[10px] font-medium text-slate-500">Beverages & Snacks</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">Cold Drinks & Cola Gondola</h3>
            </div>
            <span className="text-xs font-bold text-rose-600 font-mono">17% Availability</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">Total SKUs Monitored:</span>
              <span className="font-bold text-slate-900 font-mono">3 SKUs</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-amber-900">
              <span className="font-medium">Active Alert:</span>
              <span className="font-bold">Sparkling Cola Zero Low Stock</span>
            </div>
          </div>

          {shelfObservation && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Observation: {shelfObservation}</span>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsShelfCheckOpen(true)}
              className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs shadow-blue-500/20"
            >
              <span>Quick Shelf Check</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/90" />
            </button>
            <button
              type="button"
              onClick={() => onOpenMap('Shelf B4', 'Beverages', 'B4')}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Show on Map</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuickShelfCheckModal
        shelfCode="B4"
        shelfName="Shelf B4 — Cold Beverages"
        isOpen={isShelfCheckOpen}
        onClose={() => setIsShelfCheckOpen(false)}
        onSuccess={(obs) => setShelfObservation(obs)}
      />

      <PriceCheckModal
        isOpen={isPriceCheckOpen}
        onClose={() => setIsPriceCheckOpen(false)}
        productName="Sparkling Cola Zero 12-Pack"
        sku="SKU-BEV-1029"
        systemPrice={64}
        shelfTagPrice={64}
      />
    </div>
  )
}
