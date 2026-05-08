import React from 'react'
import { Head, router } from '@inertiajs/react'
import QrScannerCamera from '@/components/features/QrScannerCamera'

function deriveTargetFromScan(text: string) {
  // If scanner encoded a full URL with /spareparts/{id}
  const urlMatch = text.match(/\/spareparts\/(\d+)/)
  if (urlMatch) return `/spareparts/${urlMatch[1]}`

  // Try parse JSON payload { id: ... }
  try {
    const parsed = JSON.parse(text)
    if (parsed && (parsed.id || parsed.material_number)) {
      return `/spareparts/${parsed.id ?? parsed.material_number}`
    }
  } catch (e) {
    // not json
  }

  // If the payload is numeric, assume it's an id
  const numeric = text.match(/\d+/)
  if (numeric) return `/spareparts/${numeric[0]}`

  // Fallback: pass raw content as query param
  return `/spareparts/${encodeURIComponent(text)}`
}

export default function ScannerIndex() {
  const handleScan = (decodedText: string) => {
    const target = deriveTargetFromScan(decodedText)
    router.visit(target)
  }

  return (
    <>
      <Head title="QR Scanner" />
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-2">QR Scanner</h1>
        <p className="mb-4 text-sm text-muted-foreground">Point your camera to the QR code — you'll be redirected automatically.</p>
        <div className="max-w-md">
          <QrScannerCamera onScan={handleScan} />
        </div>
      </div>
    </>
  )
}
