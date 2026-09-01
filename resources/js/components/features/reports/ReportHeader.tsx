import { usePage } from '@inertiajs/react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import reports from '@/routes/reports';

export function buildExportUrl(baseUrl: string): string {
    const params = new URLSearchParams(window.location.search);
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
}

interface ReportHeaderProps {
    isAdmin?: boolean;
    onExportControl?: () => void;
}

export function ReportHeader({ isAdmin, onExportControl }: ReportHeaderProps) {
    const totalLogs = (usePage().props as { logs?: { total?: number; data?: unknown[] } })?.logs;
    const recordCount = totalLogs?.total
        ? totalLogs.total
        : totalLogs?.data
            ? totalLogs.data.length
            : null;

    return (
        <div className="flex items-center justify-between gap-3">
            <h1 className="flex items-center gap-2 text-base font-semibold">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                Laporan transaksi
                {typeof recordCount === 'number' ? (
                    <Badge variant="secondary" className="ml-1 text-[11px] font-semibold">
                        {recordCount} record
                    </Badge>
                ) : null}
            </h1>

            {isAdmin && onExportControl && (
                <div className="flex gap-2">
                    <Button
                        onClick={onExportControl}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <FileSpreadsheet className="size-4 shrink-0 text-emerald-600" />
                        Export Control
                    </Button>
                </div>
            )}
        </div>
    );
}
