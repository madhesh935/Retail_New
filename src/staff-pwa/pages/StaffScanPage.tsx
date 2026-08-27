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
  CalendarClock,
  RotateCw,
  Trash2,
  Edit3,
  Sparkles,
} from 'lucide-react'
import { QuickShelfCheckModal } from '../components/QuickShelfCheckModal'
import { PriceCheckModal } from '../components/PriceCheckModal'
import { RecordWasteModal } from '../components/RecordWasteModal'
import { useAppStore } from '@/store/useAppStore'
import { formatExpiryTime, calculateHoursRemaining } from '@/services/expiry/expiryRiskEngine'
import { cn } from '@/lib/utils'

interface StaffScanPageProps {
  onOpenMap: (destination: string, zone?: string, shelf?: string) => void
  onOpenReportIssue?: () => void
}

type ScanType = 'PRODUCT' | 'EXPIRY_BATCH' | 'SHELF' | 'LABEL' | 'LOCATION'

export const StaffScanPage: React.FC<StaffScanPageProps> = ({ onOpenMap, onOpenReportIssue }) => {
  const {
    inventoryBatches,
    expiryRiskAssessments,
    createRotationTask,
    correctBatchExpiryAudit,
    authenticatedStaff,
  } = useAppStore()

  const [scanType, setScanType] = useState<ScanType>('EXPIRY_BATCH')
  const [manualQuery, setManualQuery] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [activeResult, setActiveResult] = useState<'PRODUCT' | 'EXPIRY_BATCH' | 'SHELF' | null>('EXPIRY_BATCH')

  // Modals
  const [isShelfCheckOpen, setIsShelfCheckOpen] = useState(false)
  const [isPriceCheckOpen, setIsPriceCheckOpen] = useState(false)
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false)
  const [shelfObservation, setShelfObservation] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // In-line Expiry Verification Audit State
  const [isVerifyingExpiry, setIsVerifyingExpiry] = useState(false)
  const [verifiedToast, setVerifiedToast] = useState<string | null>(null)

  // Camera video ref and state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  // Find sample batch (Milk 1L)
  const scannedBatch = inventoryBatches.find((b) => b.batchNumber === 'MILK-0827') || inventoryBatches[0]
  const batchAssessment = expiryRiskAssessments.find((a) => a.batchId === scannedBatch?.id)
  const hoursLeft = scannedBatch ? calculateHoursRemaining(scannedBatch.expiresAt) : 20

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null)
    try {
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
          // autoPlay handles play
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

  useEffect(() => {
    startCamera('environment')
    return () => {
      stopCamera()
    }
  }, [])

  const handleSimulateScan = (type: 'PRODUCT' | 'EXPIRY_BATCH' | 'SHELF') => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setActiveResult(type)
      setScanType(type)
    }, 350)
  }

  const handleRotateStock = () => {
    if (scannedBatch) {
      createRotationTask(scannedBatch.id)
      setToastMessage(`✓ Stock Rotation task dispatched for Shelf ${scannedBatch.shelfCode || 'C2'}!`)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleConfirmExpiryCorrect = () => {
    setVerifiedToast('✓ Worker Confirmed: Physical packaging date matches system record.')
    setTimeout(() => setVerifiedToast(null), 2500)
  }

  return (
    <div className="space-y-3.5 p-4 pb-28 select-none">
      {/* Top Selector: Scan Modes */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => handleSimulateScan('EXPIRY_BATCH')}
            className={cn(
              'py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-all cursor-pointer',
              scanType === 'EXPIRY_BATCH'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            Batch/Expiry
          </button>
          <button
            type="button"
            onClick={() => handleSimulateScan('PRODUCT')}
            className={cn(
              'py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-all cursor-pointer',
              scanType === 'PRODUCT'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            Product
          </button>
          <button
            type="button"
            onClick={() => handleSimulateScan('SHELF')}
            className={cn(
              'py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-all cursor-pointer',
              scanType === 'SHELF'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            Shelf QR
          </button>
          <button
            type="button"
            onClick={() => setIsPriceCheckOpen(true)}
            className="py-2 px-1 text-[11px] font-bold rounded-xl text-center text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            Price Tag
          </button>
        </div>
      </div>

      {/* Camera Viewport Scanner Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-800">
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
                {cameraError ? cameraError : 'Position GS1 barcode, batch code or shelf QR in frame'}
              </p>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Enable Camera Feed
              </button>
            </div>
          )}

          {cameraActive && (
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-xs p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="px-2 py-1 text-[10px] font-bold text-white hover:text-blue-300 rounded-md cursor-pointer"
              >
                Flip
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-2 py-1 text-[10px] font-bold text-rose-300 hover:text-rose-200 rounded-md cursor-pointer"
              >
                Off
              </button>
            </div>
          )}

          {/* Reticle & Laser */}
          <div className="absolute inset-x-12 inset-y-6 pointer-events-none border-2 border-blue-400/80 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] z-10">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-3 border-l-3 border-blue-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-3 border-r-3 border-blue-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-3 border-l-3 border-blue-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-3 border-r-3 border-blue-400" />
            <div
              className={`absolute top-1/2 inset-x-0 h-0.5 ${
                isScanning ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'
              } animate-pulse`}
            />
          </div>
        </div>

        {/* Quick Sample Scan Chips */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Sample Barcodes</div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
            <button
              type="button"
              onClick={() => handleSimulateScan('EXPIRY_BATCH')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[10px] font-bold text-amber-900 rounded-lg whitespace-nowrap border border-amber-200 transition-colors cursor-pointer"
            >
              🥛 Milk 1L (Batch MILK-0827)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScan('PRODUCT')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-800 rounded-lg whitespace-nowrap border border-slate-200 transition-colors cursor-pointer"
            >
              🥤 Cola Zero (B4)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScan('SHELF')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-800 rounded-lg whitespace-nowrap border border-slate-200 transition-colors cursor-pointer"
            >
              📍 Shelf B4 QR
            </button>
            <button
              type="button"
              onClick={() => setIsWasteModalOpen(true)}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-[10px] font-bold text-rose-900 rounded-lg whitespace-nowrap border border-rose-200 transition-colors cursor-pointer"
            >
              🗑️ Record Waste
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
          placeholder="Manual SKU or Batch entry (e.g. MILK-0827)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        />
      </div>

      {/* ======================================================= */}
      {/* 1. EXPIRY BATCH SCAN RESULT (Smart Expiry Scanner) */}
      {/* ======================================================= */}
      {activeResult === 'EXPIRY_BATCH' && scannedBatch && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] animate-in fade-in">
          {toastMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Product Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Batch {scannedBatch.batchNumber}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 uppercase">
                  Expiring Soon
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{scannedBatch.productName}</h3>
              <div className="text-xs text-slate-500 font-medium">
                {scannedBatch.category} · Shelf {scannedBatch.shelfCode || 'C2'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Expiry Window</span>
              <span className="text-sm font-bold font-mono text-amber-600">
                {formatExpiryTime(hoursLeft)}
              </span>
            </div>
          </div>

          {/* Batch Metrics Matrix */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Shelf Stock</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                {scannedBatch.shelfQuantity} units
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Backroom</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                {scannedBatch.backroomQuantity} units
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">At-Risk Qty</span>
              <span className="text-xs font-bold text-amber-600 font-mono mt-0.5 block">
                {batchAssessment?.atRiskQuantity || 8} units
              </span>
            </div>
          </div>

          {/* Expiry Verification Audit Box */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <CalendarClock className="w-4 h-4 text-blue-600" />
                <span>Physical Packaging Expiry Check</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-blue-900">
                {new Date(scannedBatch.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {verifiedToast ? (
              <div className="p-2 bg-emerald-100 text-emerald-900 font-bold rounded-lg text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{verifiedToast}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmExpiryCorrect}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
                >
                  ✓ Expiry Correct
                </button>
                <button
                  type="button"
                  onClick={() => setIsVerifyingExpiry(!isVerifyingExpiry)}
                  className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Incorrect Date
                </button>
              </div>
            )}
          </div>

          {/* 4 Dedicated Staff Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleRotateStock}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate Stock (FEFO)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPriceCheckOpen(true)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span>Apply Markdown</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWasteModalOpen(true)}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Record Waste</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenReportIssue && onOpenReportIssue()}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. STANDARD PRODUCT SCAN RESULT */}
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

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenMap('Shelf B4 — Cold Beverages', 'Beverages', 'B4')}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Locate Shelf B4</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenMap('Backroom Bay 3B (Pallet 3)', 'Stockroom', 'Bay 3B')}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Locate Backroom</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. SHELF SCAN RESULT */}
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

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsShelfCheckOpen(true)}
              className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs shadow-blue-500/20 cursor-pointer"
            >
              <span>Quick Shelf Check</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/90" />
            </button>
            <button
              type="button"
              onClick={() => onOpenMap('Shelf B4', 'Beverages', 'B4')}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
        productName="Fresh Whole Milk 1L"
        sku="SKU-DAIRY-101"
        systemPrice={64}
        shelfTagPrice={64}
      />

      <RecordWasteModal
        isOpen={isWasteModalOpen}
        onClose={() => setIsWasteModalOpen(false)}
        productName={scannedBatch?.productName || 'Fresh Whole Milk 1L'}
        productSku={scannedBatch?.productSku || 'SKU-DAIRY-101'}
        batchId={scannedBatch?.id}
        batchNumber={scannedBatch?.batchNumber || 'MILK-0827'}
        shelfCode={scannedBatch?.shelfCode || 'C2'}
        unitCost={scannedBatch?.unitCost || 42}
      />
    </div>
  )
}
