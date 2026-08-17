import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ReportMobileList } from '@/components/features/reports/ReportMobileList';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { ActivityLog, PaginatedResponse } from '@/types';

interface ReportPreviewTableProps {
    logs: PaginatedResponse<ActivityLog>;
    onReset: () => void;
}

export function ReportPreviewTable({ logs, onReset }: ReportPreviewTableProps) {
    const isMobile = useIsMobile();

    // Mobile — card list
    if (isMobile) {
        return <ReportMobileList logs={logs} onReset={onReset} />;
    }

    // Desktop — tabel dengan sync scroll
    const topScrollRef = useRef<HTMLDivElement | null>(null);
    const topScrollSpacerRef = useRef<HTMLDivElement | null>(null);
    const tableScrollRef = useRef<HTMLDivElement | null>(null);
    const tableRef = useRef<HTMLTableElement | null>(null);
    const isSyncingScroll = useRef(false);

    const syncScroll = (source: 'top' | 'table') => {
        if (isSyncingScroll.current) {
            return;
        }

        const sourceEl = source === 'top' ? topScrollRef.current : tableScrollRef.current;
        const targetEl = source === 'top' ? tableScrollRef.current : topScrollRef.current;

        if (!sourceEl || !targetEl) {
            return;
        }

        isSyncingScroll.current = true;
        targetEl.scrollLeft = sourceEl.scrollLeft;

        requestAnimationFrame(() => {
            isSyncingScroll.current = false;
        });
    };

    useLayoutEffect(() => {
        const syncTopScrollbarWidth = () => {
            if (!topScrollSpacerRef.current || !tableRef.current) {
                return;
            }

            topScrollSpacerRef.current.style.width = `${tableRef.current.scrollWidth}px`;
        };

        syncTopScrollbarWidth();

        if (typeof ResizeObserver === 'undefined' || !tableRef.current) {
            return;
        }

        const resizeObserver = new ResizeObserver(() => {
            syncTopScrollbarWidth();
        });

        resizeObserver.observe(tableRef.current);
        window.addEventListener('resize', syncTopScrollbarWidth);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', syncTopScrollbarWidth);
        };
    }, [logs]);

    return (
        <div className="rounded-lg border border-border/70 bg-background">
                <div
                    ref={topScrollRef}
                    onScroll={() => syncScroll('top')}
                    className="overflow-x-scroll overflow-y-hidden border-b border-border/60 bg-transparent scrollbar-thin [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:opacity-60 hover:[&::-webkit-scrollbar-thumb]:bg-border/50"
                >
                    <div ref={topScrollSpacerRef} className="h-2" />
                </div>

                <div
                    ref={tableScrollRef}
                    onScroll={() => syncScroll('table')}
                    className="overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                    <table ref={tableRef} className="min-w-3xl w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/40 text-left text-muted-foreground">
                                <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Waktu Transaksi</th>
                                <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Control ID</th>
                                <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Material Number</th>
                                <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap text-center">Status</th>
                                <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap text-right">Kuantitas</th>
                                <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Operator</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length > 0 ? (
                                logs.data.map((log, index) => (
                                    <tr key={log.id} className={cn('border-t border-border/60 transition-colors hover:bg-muted/20', index % 2 === 1 && 'bg-muted/6')}>
                                        <td className="px-5 py-4 whitespace-nowrap align-top">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">
                                                    {format(parseISO(log.performed_at), "dd MMM yyyy", { locale: id })}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground font-mono">
                                                    {format(parseISO(log.performed_at), "HH:mm:ss")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="font-mono text-primary font-bold block line-clamp-2 wrap-break-word">{log.control_id}</span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">{log.control_id}</TooltipContent>
                                            </Tooltip>
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <div className="space-y-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div>
                                                            <span className="font-medium block line-clamp-2 wrap-break-word">{log.sparepart?.material_number || '-'}</span>
                                                            <span className="text-xs text-muted-foreground block line-clamp-2">{log.sparepart?.part_name || 'Sparepart Detail'}</span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">{log.sparepart ? `${log.sparepart.material_number} - ${log.sparepart.part_name}` : '-'}</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-top text-center">
                                            <Badge
                                                className={cn(
                                                    "px-3 py-1 font-extrabold text-[10px] rounded-full border-none shadow-sm",
                                                    log.type === 'IN'
                                                        ? "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/10"
                                                        : "bg-rose-500/10 text-rose-600 shadow-rose-500/10"
                                                )}
                                            >
                                                {log.type === 'IN' ? 'STOCK IN' : 'STOCK OUT'}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 align-top text-right">
                                            <span className={cn(
                                                "font-semibold tabular-nums leading-tight",
                                                log.type === 'IN' ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                                    {log.user?.name?.[0] || 'U'}
                                                </div>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="text-muted-foreground font-medium block line-clamp-2 max-w-24">{log.user?.name || '-'}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">{log.user?.name || '-'}</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex min-h-72 flex-col items-center justify-center gap-2">
                                            <Search className="size-8 text-muted-foreground/60" />
                                            <p className="text-base font-semibold text-foreground">Tidak ada data laporan</p>
                                            <p className="max-w-md text-sm text-muted-foreground">Coba ubah kata kunci pencarian atau hapus filter untuk melihat data lainnya.</p>
                                            <Button variant="outline" onClick={onReset}>
                                                Clear filters
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
        </div>
    );
}
