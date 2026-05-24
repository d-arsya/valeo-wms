import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import reports from '@/routes/reports';

export function ReportHeader() {
    const handleExport = () => {
        const params = new URLSearchParams(window.location.search);
        window.location.href = reports.export().url + '?' + params.toString();
    };

    return (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
                <h1 className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="size-4 text-muted-foreground" />
                    Laporan transaksi
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Monitor aktivitas stock IN dan stock OUT dengan detail.
                </p>
            </div>

            <Button onClick={handleExport} className="w-full gap-2 shadow-sm lg:w-auto">
                <Download className="size-4" />
                Export PDF
            </Button>
        </div>
    );
}
