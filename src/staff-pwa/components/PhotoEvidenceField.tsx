import React, { useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  captureFrameFromVideo,
  openLiveCameraStream,
  readImageAsDataUrl,
  stopLiveCameraStream,
} from '@/staff-pwa/lib/photoEvidence'

interface PhotoEvidenceFieldProps {
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  attachedLabel?: string
  className?: string
}

export const PhotoEvidenceField: React.FC<PhotoEvidenceFieldProps> = ({
  value,
  onChange,
  label = 'Attach Photo Evidence',
  attachedLabel = 'Photo Attached',
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopCamera = () => {
    stopLiveCameraStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraReady(false)
    setCameraOpen(false)
  }

  useEffect(() => {
    if (!cameraOpen) return

    let cancelled = false
    setIsLoading(true)
    setError(null)
    setCameraReady(false)

    void openLiveCameraStream()
      .then((stream) => {
        if (cancelled) {
          stopLiveCameraStream(stream)
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.onloadedmetadata = () => {
          void video.play().then(() => {
            if (!cancelled) setCameraReady(true)
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not open camera. Allow permission or choose from gallery.')
          setCameraOpen(false)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      stopLiveCameraStream(streamRef.current)
      streamRef.current = null
    }
  }, [cameraOpen])

  useEffect(() => {
    if (value) stopCamera()
  }, [value])

  useEffect(() => () => stopLiveCameraStream(streamRef.current), [])

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const dataUrl = await readImageAsDataUrl(file)
      onChange(dataUrl)
    } catch {
      setError('Could not read photo. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCapture = () => {
    const video = videoRef.current
    if (!video || !cameraReady) {
      setError('Camera is still starting. Wait a moment and try again.')
      return
    }

    try {
      const dataUrl = captureFrameFromVideo(video)
      onChange(dataUrl)
      stopCamera()
    } catch {
      setError('Could not capture photo. Try again.')
    }
  }

  if (value) {
    return (
      <div className={className}>
        <div className="relative overflow-hidden rounded-xl border border-emerald-300 bg-emerald-50/40">
          <img src={value} alt="Evidence" className="max-h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white transition-colors hover:bg-slate-900"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="border-t border-emerald-200 px-3 py-2 text-[11px] font-semibold text-emerald-800">
            {attachedLabel}
          </div>
        </div>
      </div>
    )
  }

  if (cameraOpen) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-950">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="aspect-[4/3] max-h-40 w-full object-cover"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={stopCamera}
            className="rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={!cameraReady || isLoading}
            className="rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Capture Photo
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            stopCamera()
            inputRef.current?.click()
          }}
          className="w-full text-[11px] font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
        >
          Upload from gallery instead
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        {error && (
          <p className="text-[11px] font-medium text-rose-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          disabled={isLoading}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-xl border border-dashed px-2 py-2.5 text-[11px] font-semibold transition-all',
            'cursor-pointer border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100'
          )}
        >
          <Camera className="h-4 w-4 shrink-0" />
          <span>Open Live Camera</span>
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-xl border border-dashed px-2 py-2.5 text-[11px] font-semibold transition-all',
            'cursor-pointer border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4 shrink-0" />
          )}
          <span>{label}</span>
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
