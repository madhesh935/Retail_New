/**
 * Opens a live MediaStream, preferring DroidCam (USB) when available.
 *
 * DroidCam over USB appears as a normal webcam ("DroidCam Source 3", etc.).
 * Override with VITE_CAMERA_LABEL or pass preferredLabel.
 */
export async function openPreferredCameraStream(options?: {
  preferredLabel?: string
}): Promise<{ stream: MediaStream; deviceLabel: string; deviceId: string | null }> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera API not available in this browser')
  }

  const preferred =
    (options?.preferredLabel ||
      (typeof import.meta !== 'undefined' &&
        (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_CAMERA_LABEL) ||
      'DroidCam'
    ).trim()

  // Permission + labels: enumerateDevices only returns names after a grant
  const probe = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  })
  probe.getTracks().forEach((t) => t.stop())

  const devices = await navigator.mediaDevices.enumerateDevices()
  const cameras = devices.filter((d) => d.kind === 'videoinput')

  const lower = preferred.toLowerCase()
  const match =
    cameras.find((d) => d.label.toLowerCase().includes(lower)) ||
    cameras.find((d) => /droidcam|iriun|epoccam|obs virtual|virtual camera|android|iphone/i.test(d.label)) ||
    cameras[0]

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: match?.deviceId
      ? {
          deviceId: { exact: match.deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
  })

  return {
    stream,
    deviceLabel: match?.label || 'Default camera',
    deviceId: match?.deviceId || null,
  }
}

export async function listVideoInputDevices(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return []
  try {
    // Ensure labels are populated
    const probe = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    probe.getTracks().forEach((t) => t.stop())
  } catch {
    // ignore — may still list devices without labels
  }
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter((d) => d.kind === 'videoinput')
}

export function stopMediaStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((t) => t.stop())
}
