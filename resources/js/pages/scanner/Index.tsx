import { Head, router } from '@inertiajs/react';
import React, { useState, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { QrScannerCamera } from '@/components/features/QrScannerCamera';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { index as sparepartsIndex } from '@/routes/spareparts';
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
        router.visit(sparepartsIndex({ query: { search: decodedText } }).url);
    }, [isProcessing]);

    return (
        <>
            <Head title="QR Scanner" />
            <div className="flex h-full flex-1 flex-col p-4">
                <div className="max-w-md mx-auto w-full space-y-6 mt-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Scanner Gudang</h2>
                        <p className="text-muted-foreground text-sm">
                            Pindai QR Code pada bin untuk melihat detail barang.
                        </p>
                    </div>

                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium">Mencari data barang...</p>
                        </div>
                    ) : (
                        <QrScannerCamera 
                            onScanSuccess={handleScanSuccess} 
                            onScanFailure={() => {}} 
                        />
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Gagal memproses</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
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
