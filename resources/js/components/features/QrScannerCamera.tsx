import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QrScannerCameraProps {
  onScan: (decodedText: string) => void
  qrbox?: number
  facingMode?: 'environment' | 'user'
}

export default function QrScannerCamera({ onScan, qrbox = 250, facingMode = 'environment' }: QrScannerCameraProps) {
  const elementId = 'html5qr-scanner'
  const html5Ref = useRef<Html5Qrcode | null>(null)
  const isRunningRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(elementId)
        html5Ref.current = html5QrCode
          let started = false

          try {
            const html5QrCode = new Html5Qrcode(elementId)
            html5Ref.current = html5QrCode

            const config = { fps: 10, qrbox }

            // start() returns a Promise<void>; mark `started` when it resolves
            await html5QrCode.start({ facingMode }, config, (decodedText: string) => {
              if (!mounted) return
              onScan(decodedText)
            }, () => {
              // ignore per-frame scan errors
            })

            started = true
          } catch (err) {
            if (mounted) {
              const errorMessage = err instanceof Error ? err.message : String(err)
              setError(errorMessage || 'Error initializing scanner')
              // eslint-disable-next-line no-console
              console.error('QrScannerCamera error:', err)
            }
          }

          if (mounted) {
            isRunningRef.current = started
          }

    return () => {
      mounted = false
      if (!html5Ref.current || !isRunningRef.current) return

      html5Ref.current
        .stop()
        .then(() => {
          isRunningRef.current = false
          html5Ref.current?.clear()
        })
        .catch(() => {
          // ignore stop errors
          isRunningRef.current = false
        })
    }
  }, [onScan, qrbox, facingMode])

  if (error) {
    return (
      <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800 font-semibold">Camera Access Error</p>
        <p className="text-xs text-yellow-600 mt-1">{error}</p>
        <p className="text-xs text-yellow-600 mt-2">Make sure to allow camera permissions in your browser settings.</p>
      </div>
    )
  }

  return <div id={elementId} className="w-full" />
}
