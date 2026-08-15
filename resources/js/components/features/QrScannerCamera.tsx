import { Html5Qrcode } from 'html5-qrcode';
import { AlertCircle, Camera } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QrScannerCameraProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (errorMessage: string) => void;
}

export function QrScannerCamera({ onScanSuccess, onScanFailure }: QrScannerCameraProps) {
    const scannerRegionId = 'html5qr-code-full-region';
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let scanner: Html5Qrcode | null = null;
        let isComponentMounted = true;

        const startScanner = async () => {
            try {
                // First, check if any cameras are available
                const devices = await Html5Qrcode.getCameras();

                if (!devices || devices.length === 0) {
                    throw new Error('Tidak ada kamera yang terdeteksi di perangkat Anda.');
                }

                if (!isComponentMounted) {
                    return;
                }

                scanner = new Html5Qrcode(scannerRegionId);
                scannerRef.current = scanner;

                // Dynamic qrbox based on container width
                const containerWidth = containerRef.current?.clientWidth || 300;
                const qrSize = Math.min(Math.max(containerWidth - 40, 200), 350);

                const config = {
                    fps: 10,
                    qrbox: { width: qrSize, height: qrSize },
                    aspectRatio: 1.0,
                };

                // Determine best camera (prefer back camera if available, otherwise fallback to first)
                let cameraId = devices[0].id;

                for (const device of devices) {
                    if (
                        device.label.toLowerCase().includes('back') ||
                        device.label.toLowerCase().includes('environment')
                    ) {
                        cameraId = device.id;
                        break;
                    }
                }

                // Request camera using the specific ID
                await scanner.start(
                    cameraId,
                    config,
                    (text) => {
                        if (scannerRef.current) {
                            scannerRef.current.pause(true);
                        }

                        onScanSuccess(text);
                    },
                    (errorMessage) => {
                        if (onScanFailure) {
                            onScanFailure(errorMessage);
                        }
                    },
                );
            } catch (err: any) {
                if (isComponentMounted) {
                    setError(
                        err?.message ||
                            'Gagal mengakses kamera. Pastikan Anda memiliki kamera dan telah memberikan izin akses.',
                    );
                }
            }
        };

        startScanner();

        return () => {
            isComponentMounted = false;

            if (scanner && scanner.isScanning) {
                scanner
                    .stop()
                    .then(() => {
                        scanner?.clear();
                    })
                    .catch(console.error);
            } else if (scanner) {
                scanner.clear();
            }
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div ref={containerRef} className="w-full flex flex-col gap-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="bg-card text-card-foreground border rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 md:p-4 flex items-center justify-between border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-medium text-sm">Arahkan kamera ke QR Code</h3>
                    </div>
                </div>
                <div
                    id={scannerRegionId}
                    className="w-full [&>div]:border-0 [&>div]:w-full [&>div]:h-auto"
                />
            </div>
        </div>
    );
}
