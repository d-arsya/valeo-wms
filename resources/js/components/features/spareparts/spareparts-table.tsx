import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import {
    formatCurrency,
    formatDate,
    getBinLabel,
} from '@/components/features/spareparts/spareparts-utils';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import spareparts from '@/routes/spareparts';
import { form as stockInForm } from '@/routes/stock/in';
import { form as stockOutForm } from '@/routes/stock/out';
import type { Sparepart } from '@/types';

interface Props {
    rows: Sparepart[];
}

export function SparepartsTable({ rows }: Props) {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';
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
    }, [rows]);

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
                className="overflow-x-auto scrollbar-none"
            >
                <table ref={tableRef} className="min-w-300 w-full border-collapse text-sm">
                    <thead className="bg-muted/40 text-left text-muted-foreground">
                        <tr>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Material</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Part</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Specification</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Location</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Brand</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Category</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Stock</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Safety</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Rank</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Status</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">PO Number</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Supplier</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">GR Date</th>
                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">Price</th>
                            <th className="sticky right-0 z-40 w-44 min-w-44 max-w-44 bg-background px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap shadow-[-10px_0_14px_-12px_rgba(0,0,0,0.32)] before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border/60 before:content-['']">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((sparepart, index) => {
                            const isAttention = sparepart.status !== 'OK';
                            const rowBorderTone =
                                sparepart.status === 'NG'
                                    ? 'border-l-4 border-l-destructive'
                                    : sparepart.status === 'ATTENTION'
                                        ? 'border-l-4 border-l-amber-500'
                                        : 'border-l-4 border-l-emerald-600';
                            const statusDotTone =
                                sparepart.status === 'NG'
                                    ? 'bg-rose-500'
                                    : sparepart.status === 'ATTENTION'
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500';

                            return (
                                <tr
                                    key={sparepart.id}
                                    className={cn(
                                        'border-t border-border/60 transition-colors hover:bg-muted/20',
                                        index % 2 === 1 && 'bg-muted/6',
                                        rowBorderTone,
                                    )}
                                >
                                    <td className="px-5 py-4 align-top">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn('inline-block size-2 rounded-full', statusDotTone)}
                                                    aria-hidden="true"
                                                />
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={spareparts.show(sparepart.material_number)}
                                                            className="font-semibold leading-tight text-foreground transition-colors hover:text-primary line-clamp-2 wrap-break-word"
                                                        >
                                                            {sparepart.material_number}
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">{sparepart.material_number}</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <div className="space-y-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="line-clamp-2 wrap-break-word font-medium leading-tight text-foreground">
                                                        {sparepart.part_name}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">{sparepart.part_name}</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <div className="space-y-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="line-clamp-2 wrap-break-word text-xs leading-relaxed text-muted-foreground">
                                                        {sparepart.specification}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">{sparepart.specification}</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <div className="space-y-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="line-clamp-2 wrap-break-word font-medium leading-tight">
                                                        {getBinLabel(sparepart)}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">{getBinLabel(sparepart)}</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <div className="space-y-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="line-clamp-2 wrap-break-word font-medium leading-tight">
                                                        {sparepart.brand?.name ?? '-'}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">{sparepart.brand?.name ?? '-'}</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <div className="space-y-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="line-clamp-2 wrap-break-word font-medium leading-tight">
                                                        {sparepart.category?.name ?? '-'}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">{sparepart.category?.name ?? '-'}</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <div>
                                            <p
                                                className={cn(
                                                    'font-semibold tabular-nums leading-tight',
                                                    isAttention &&
                                                    'text-amber-600 dark:text-amber-400',
                                                )}
                                            >
                                                {sparepart.actual_stock}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <div>
                                            <p className="font-semibold tabular-nums leading-tight">
                                                {sparepart.safety_stock}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <div>
                                            <p className="font-semibold tabular-nums leading-tight">
                                                {sparepart.rank}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <StockStatusBadge status={sparepart.status} />
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="line-clamp-2 wrap-break-word font-medium leading-tight">{sparepart.last_po_number ?? '-'}</p>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">{sparepart.last_po_number ?? '-'}</TooltipContent>
                                        </Tooltip>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="line-clamp-2 wrap-break-word text-sm text-muted-foreground">{sparepart.last_supplier ?? '-'}</p>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">{sparepart.last_supplier ?? '-'}</TooltipContent>
                                        </Tooltip>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="line-clamp-2 wrap-break-word text-sm text-muted-foreground">{sparepart.last_gr_date ? formatDate(sparepart.last_gr_date) : '-'}</p>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">{sparepart.last_gr_date ? formatDate(sparepart.last_gr_date) : '-'}</TooltipContent>
                                        </Tooltip>
                                    </td>
                                    <td className="px-5 py-4 align-top">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="line-clamp-2 wrap-break-word text-sm text-muted-foreground">{sparepart.price_per_unit ? formatCurrency(sparepart.price_per_unit) : '-'}</p>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">{sparepart.price_per_unit ? formatCurrency(sparepart.price_per_unit) : '-'}</TooltipContent>
                                        </Tooltip>
                                    </td>
                                    <td className="sticky right-0 z-30 w-44 min-w-44 max-w-44 bg-background px-4 py-4 align-middle shadow-[-10px_0_14px_-12px_rgba(0,0,0,0.22)] before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border/60 before:content-['']">
                                        <div className="flex h-full w-full flex-nowrap items-center justify-center gap-1.5">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8 border-border/80 bg-background"
                                                        aria-label="Stock out"
                                                    >
                                                        <Link
                                                            href={stockOutForm(sparepart.id, { query: { return_to: spareparts.index().url } })}
                                                        >
                                                            <ArrowDownRight className="size-3.5" />
                                                            <span className="sr-only">Stock out</span>
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Stock out</TooltipContent>
                                            </Tooltip>
                                            {isAdmin && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-8 border-border/80 bg-background"
                                                            aria-label="Stock in"
                                                        >
                                                            <Link
                                                                href={stockInForm(sparepart.id, { query: { return_to: spareparts.index().url } })}
                                                            >
                                                                <ArrowUpRight className="size-3.5" />
                                                                <span className="sr-only">Stock in</span>
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">Stock in</TooltipContent>
                                                </Tooltip>
                                            )}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        className="size-8"
                                                        aria-label="View detail"
                                                    >
                                                        <Link
                                                            href={spareparts.show(sparepart.material_number)}
                                                        >
                                                            <Eye className="size-3.5" />
                                                            <span className="sr-only">View detail</span>
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">View detail</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
