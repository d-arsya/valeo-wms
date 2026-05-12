import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Printer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparepart } from '@/types';
import spareparts from '@/routes/spareparts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LabelShowProps {
    sparepart: Sparepart;
    qrCodeSvg: string;
}

export default function LabelShow({ sparepart, qrCodeSvg }: LabelShowProps) {
    const { post, processing } = useForm();

    const handlePrint = () => {
        if (!sparepart.qr_code_path) {
            toast.error('Generate QR Code terlebih dahulu sebelum mencetak.');
            return;
        }
        window.print();
    };

    const handleGenerateQR = () => {
        post(spareparts.qr.generate(sparepart.id).url, {
            preserveScroll: true,
            onSuccess: () => toast.success('QR Code berhasil di-generate!'),
        });
    };

    const location = sparepart.bin && sparepart.bin.rack 
        ? `${sparepart.bin.rack.code} - ${sparepart.bin.code}`
        : 'Unknown Location';

    return (
        <>
            <Head title={`Label - ${sparepart.material_number}`} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
                {/* Header Actions (Hidden in Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={spareparts.show(sparepart.id).url}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Cetak Label QR</h1>
                            <p className="text-sm text-muted-foreground">
                                Cetak label ini untuk ditempelkan pada fisik bin/rak.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleGenerateQR} 
                            disabled={processing}
                        >
                            <RefreshCw className={cn("mr-2 h-4 w-4", processing && "animate-spin")} />
                            {sparepart.qr_code_path ? 'Regenerate QR' : 'Generate QR'}
                        </Button>
                        <Button onClick={handlePrint} disabled={!sparepart.qr_code_path}>
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak
                        </Button>
                    </div>
                </div>

                {/* Print Preview Container */}
                <div className="flex items-center justify-center bg-muted/30 p-8 rounded-xl border print:p-0 print:border-none print:bg-transparent">
                    {/* The Actual Label Card */}
                    <Card className="w-full max-w-[400px] border-2 border-dashed border-border print:border-solid print:border-black print:shadow-none bg-white">
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                            {/* QR Code Container */}
                            <div className="w-48 h-48 flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden border">
                                {sparepart.qr_code_path ? (
                                    <img 
                                        src={`/storage/${sparepart.qr_code_path}`} 
                                        alt="QR Code"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div 
                                        className="w-full h-full p-4 [&>svg]:w-full [&>svg]:h-full opacity-50 grayscale"
                                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }} 
                                    />
                                )}
                            </div>
                            
                            {!sparepart.qr_code_path && (
                                <p className="text-[10px] text-destructive font-medium animate-pulse print:hidden">
                                    QR Code belum tersimpan. Klik "Generate QR" di atas.
                                </p>
                            )}
                            
                            {/* Textual Information */}
                            <div className="space-y-2 w-full pt-4 border-t border-dashed print:border-solid print:border-black">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black">Material Number</p>
                                    <p className="font-mono text-lg font-bold print:text-black">{sparepart.material_number}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-left pt-2">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black">Location</p>
                                        <p className="font-semibold text-sm truncate print:text-black">{location}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black">Brand</p>
                                        <p className="font-semibold text-sm truncate print:text-black">{sparepart.brand?.name || '-'}</p>
                                    </div>
                                </div>
                                
                                <div className="text-left pt-1">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black">Specification</p>
                                    <p className="text-xs line-clamp-2 print:text-black">{sparepart.specification || '-'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                        @page { size: auto; margin: 0mm; }
                        body { background: white; }
                        #app-sidebar { display: none !important; }
                        header { display: none !important; }
                        main { padding: 0 !important; margin: 0 !important; }
                    }
                `}} />
            </div>
        </>
    );
}

LabelShow.layout = {
    breadcrumbs: [
        {
            title: 'Spareparts',
            href: spareparts.index().url,
        },
        {
            title: 'Print Label',
            href: '#',
        },
    ],
};
