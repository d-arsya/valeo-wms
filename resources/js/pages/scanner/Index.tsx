import { Head, router } from '@inertiajs/react';
import React, { useState, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { QrScannerCamera } from '@/components/features/QrScannerCamera';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { show as sparepartsShow } from '@/routes/spareparts';
import { index as scannerIndex } from '@/routes/scanner';

export default function ScannerIndex() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScanSuccess = useCallback(async (decodedText: string) => {
        if (isProcessing) return;

        setIsProcessing(true);
        setError(null);

        // Simply redirect to the spareparts index with the search query
        // This is more robust as it uses the existing search logic
        router.visit(sparepartsShow({ sparepart: decodedText }).url);
    }, [isProcessing]);

    return (
        <>
            <Head title="QR Scanner" />
            <div className="flex h-full flex-1 flex-col p-0 md:p-4">
                <div className="w-full flex-1 flex flex-col">
                    <div className="p-4 md:p-6 text-center space-y-2">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Scanner Gudang</h2>
                        <p className="text-muted-foreground text-sm">
                            Pindai QR Code pada bin untuk melihat detail barang.
                        </p>
                    </div>

                    {isProcessing ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-8 md:py-12 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-base font-medium">Mencari data barang...</p>
                        </div>
                    ) : (
                        <div className="flex-1">
                            <QrScannerCamera
                                onScanSuccess={handleScanSuccess}
                                onScanFailure={() => { }}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-4">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Gagal memproses</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ScannerIndex.layout = (page: any) => (
    <AppLayout breadcrumbs={[{ title: 'QR Scanner', href: scannerIndex().url }]}>
        {page}
    </AppLayout>
);
