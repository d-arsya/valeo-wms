import { usePage } from '@inertiajs/react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="flex items-center gap-2 text-base font-semibold">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <span>Laporan transaksi</span>
                {typeof recordCount === 'number' ? (
                    <Badge variant="secondary" className="ml-1 text-[11px] font-semibold">
                        {recordCount} record
                    </Badge>
                ) : null}
            </h1>

            {isAdmin && onExportControl && (
                <div className="flex w-full sm:w-auto">
                    <Button
                        type="button"
                        onClick={onExportControl}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto gap-2 shadow-xs"
                    >
                        <FileSpreadsheet className="size-4 shrink-0 text-emerald-600" />
                        Export Control
                    </Button>
                </div>
            )}
        </div>
    );
}
