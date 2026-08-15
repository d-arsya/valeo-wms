import { usePage } from '@inertiajs/react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import reports from '@/routes/reports';

export function ReportHeader() {
    const buildExportUrl = (baseUrl: string): string => {
        const params = new URLSearchParams(window.location.search);

        return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    };

    const handleExportPdf = () => {
        window.location.href = buildExportUrl(reports.export().url);
    };

    const handleExportExcel = () => {
        const excelRoute = (reports as any)?.['export-excel']
            ? (reports as any)['export-excel']().url
            : '/reports/export/excel';
        window.location.href = buildExportUrl(excelRoute);
    };

    const totalLogs = (usePage().props as { logs?: { total?: number; data?: unknown[] } })?.logs;
    const recordCount = totalLogs?.total
        ? totalLogs.total
        : totalLogs?.data
            ? totalLogs.data.length
            : null;

    return (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
                <h1 className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    Laporan transaksi
                    {typeof recordCount === 'number' ? (
                        <Badge variant="secondary" className="ml-1 text-[11px] font-semibold">
                            {recordCount} record
                        </Badge>
                    ) : null}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Monitor aktivitas stock IN dan stock OUT dengan detail.
                </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:w-auto">
                <Button
                    onClick={handleExportExcel}
                    className="w-full gap-2 shadow-sm sm:w-auto"
                    variant="outline"
                >
                    <FileSpreadsheet className="size-4 shrink-0" />
                    Export Excel
                </Button>
                <Button onClick={handleExportPdf} className="w-full gap-2 shadow-sm sm:w-auto">
                    <Download className="size-4 shrink-0" />
                    Export PDF
                </Button>
            </div>
        </div>
    );
}
