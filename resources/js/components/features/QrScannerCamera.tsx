import React, { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QrScannerCameraProps {
  onScan: (decodedText: string) => void
  qrbox?: number
  facingMode?: 'environment' | 'user'
}

export default function QrScannerCamera({ onScan, qrbox = 250, facingMode = 'environment' }: QrScannerCameraProps) {
  const elementId = 'html5qr-scanner'
  const html5Ref = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    let mounted = true
    const html5QrCode = new Html5Qrcode(elementId)
    html5Ref.current = html5QrCode

    const config = { fps: 10, qrbox }

    html5QrCode
      .start({ facingMode }, config, (decodedText) => {
        if (!mounted) return
        onScan(decodedText)
      }, () => {
        // ignore per-frame scan errors
      })
      .catch((err) => {
        // Log startup errors (camera permission, no device, etc.)
        // Keep console.info to aid debugging on mobile devices.
        // eslint-disable-next-line no-console
        console.info('Html5Qrcode start failed', err)
      })

    return () => {
      mounted = false
      if (!html5Ref.current) return
      html5Ref.current
        .stop()
        .then(() => html5Ref.current?.clear())
        .catch(() => {
          /* ignore stop errors */
        })
    }
  }, [onScan, qrbox, facingMode])

  return <div id={elementId} className="w-full" />
}
