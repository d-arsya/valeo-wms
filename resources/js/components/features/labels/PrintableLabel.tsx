import { Card, CardContent } from '@/components/ui/card';
import type { Sparepart } from '@/types';

interface PrintableLabelProps {
    sparepart: Sparepart;
    qrCodeSvg: string;
}

export function PrintableLabel({ sparepart, qrCodeSvg }: PrintableLabelProps) {
    const location = sparepart.bin && sparepart.bin.rack
        ? `${sparepart.bin.rack.code} - ${sparepart.bin.code}`
        : 'Lokasi Tidak Diketahui';

    return (
        <Card
            className="w-[70mm] h-[26mm] min-w-[70mm] max-w-[70mm] min-h-[26mm] max-h-[26mm] border-2 border-dashed border-border print:border-solid print:border-black print:shadow-none bg-white overflow-hidden box-border shadow-none"
            style={{ width: '70mm', height: '26mm' }}
        >
            <CardContent className="p-1 flex flex-col items-center justify-between text-center h-full space-y-0.5 box-border">
                {/* QR Code Container */}
                <div className="w-[10mm] h-[10mm] flex items-center justify-center bg-muted/20 rounded overflow-hidden border shrink-0">
                    <div
                        className="w-full h-full p-0.5 [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                    />
                </div>

                {/* Textual Information */}
                <div className="w-full border-t border-dashed print:border-solid print:border-black pt-0.5 space-y-0.5">
                    <div>
                        <p className="text-[5px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black leading-none">
                            Material Number
                        </p>
                        <p className="font-mono text-[8px] font-bold print:text-black leading-tight truncate">
                            {sparepart.material_number}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-left">
                        <div className="overflow-hidden">
                            <p className="text-[5px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black leading-none">
                                Location
                            </p>
                            <p className="font-semibold text-[6px] truncate print:text-black leading-tight">
                                {location}
                            </p>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[5px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black leading-none">
                                Brand
                            </p>
                            <p className="font-semibold text-[6px] truncate print:text-black leading-tight">
                                {sparepart.brand?.name || '-'}
                            </p>
                        </div>
                    </div>

                    <div className="text-left overflow-hidden">
                        <p className="text-[5px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black leading-none">
                            Specification
                        </p>
                        <p className="text-[6px] truncate print:text-black leading-tight">
                            {sparepart.specification || '-'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
