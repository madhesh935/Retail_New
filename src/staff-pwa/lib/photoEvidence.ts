export async function readImageAsDataUrl(
  file: File,
  maxWidth = 1280,
  quality = 0.72
): Promise<string> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve(resizeDataUrlFromImage(img, maxWidth, quality))
      }
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = objectUrl
    })
    return dataUrl
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function resizeDataUrlFromImage(
  img: HTMLImageElement | HTMLVideoElement,
  maxWidth: number,
  quality: number
): string {
  const sourceWidth =
    img instanceof HTMLVideoElement ? img.videoWidth : img.naturalWidth || img.width
  const sourceHeight =
    img instanceof HTMLVideoElement ? img.videoHeight : img.naturalHeight || img.height
  const scale = Math.min(1, maxWidth / Math.max(sourceWidth, 1))
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not process image')
  }
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

export function captureFrameFromVideo(
  video: HTMLVideoElement,
  maxWidth = 1280,
  quality = 0.72
): string {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error('Camera is not ready yet')
  }
  return resizeDataUrlFromImage(video, maxWidth, quality)
}

export async function openLiveCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera is not available in this browser')
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
    })
  }
}

export function stopLiveCameraStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop())
}
