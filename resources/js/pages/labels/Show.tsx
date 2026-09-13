import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrintableLabel } from '@/components/features/labels/PrintableLabel';
import spareparts from '@/routes/spareparts';
import type { Sparepart } from '@/types';

interface LabelShowProps {
    sparepart: Sparepart;
    qrCodeSvg: string;
}

export default function LabelShow({ sparepart, qrCodeSvg }: LabelShowProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Label - ${sparepart.material_number}`} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
                {/* Header Actions (Hidden in Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={spareparts.show(sparepart.material_number).url}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Cetak Label QR</h1>
                            <p className="text-sm text-muted-foreground">
                                Cetak label ini untuk ditempelkan pada fisik bin/rak (70x26mm).
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak
                        </Button>
                    </div>
                </div>

                {/* Print Preview Container */}
                <div className="flex items-center justify-center bg-muted/30 p-8 rounded-xl border print:p-0 print:border-none print:bg-transparent">
                    {/* The Actual Label Card */}
                    <PrintableLabel sparepart={sparepart} qrCodeSvg={qrCodeSvg} />
                </div>

                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                        @page { size: 70mm 26mm; margin: 0mm; }
                        body { background: white; margin: 0; padding: 0; }
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
