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
        <Card className="w-full max-w-100 border-2 border-dashed border-border print:border-solid print:border-black print:shadow-none bg-white">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                {/* QR Code Container */}
                <div className="w-48 h-48 flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden border">
                    <div
                        className="w-full h-full p-4 [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                    />
                </div>

                {/* Textual Information */}
                <div className="space-y-2 w-full pt-4 border-t border-dashed print:border-solid print:border-black">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black">
                            Material Number
                        </p>
                        <p className="font-mono text-lg font-bold print:text-black">
                            {sparepart.material_number}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left pt-2">
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black">
                                Location
                            </p>
                            <p className="font-semibold text-sm truncate print:text-black">
                                {location}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black">
                                Brand
                            </p>
                            <p className="font-semibold text-sm truncate print:text-black">
                                {sparepart.brand?.name || '-'}
                            </p>
                        </div>
                    </div>

                    <div className="text-left pt-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold print:text-black">
                            Specification
                        </p>
                        <p className="text-xs line-clamp-2 print:text-black">
                            {sparepart.specification || '-'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
