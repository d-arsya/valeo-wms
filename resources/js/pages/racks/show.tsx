import { Head, Link } from '@inertiajs/react';
import { Box, ChevronDown, ChevronRight, Package2, Warehouse } from 'lucide-react';
import { useState } from 'react';
import { BackButton } from '@/components/back-button';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import racks from '@/routes/racks';
import spareparts from '@/routes/spareparts';
import type { Bin, Rack, Sparepart } from '@/types';

interface BinWithSpareparts extends Bin {
    spareparts_count: number;
    spareparts: Sparepart[];
}

interface Props {
    rack: Rack & { bins: BinWithSpareparts[] };
}

export default function Show({ rack }: Props) {
    const totalSpareparts = rack.bins.reduce((sum, b) => sum + b.spareparts_count, 0);

    const statusCounts = rack.bins
        .flatMap((b) => b.spareparts)
        .reduce(
            (acc, s) => {
                if (s.status === 'OK') acc.ok++;
                else if (s.status === 'ATTENTION') acc.attention++;
                else acc.ng++;
                return acc;
            },
            { ok: 0, attention: 0, ng: 0 },
        );

    const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

    const toggle    = (id: number) => setCollapsed((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const expandAll = () => setCollapsed(new Set());
    const collapseAll = () => setCollapsed(new Set(rack.bins.map((b) => b.id)));

    return (
        <>
            <Head title={`Rack: ${rack.code}`} />

            <div className="space-y-5 p-4 md:p-6">
                <BackButton fallback={racks.index().url} label="Back to racks" variant="ghost" />

                {/* ── Header Stats ─────────────────────────────────── */}
                <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <Warehouse className="size-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Rack {rack.code}</h1>
                                <p className="text-xs text-muted-foreground">
                                    {rack.bins.length} bin &middot; {totalSpareparts} sparepart
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/30">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">OK</span>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{statusCounts.ok}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 dark:border-amber-800 dark:bg-amber-950/30">
                                <span className="size-2 rounded-full bg-amber-500" />
                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Attention</span>
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{statusCounts.attention}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 dark:border-rose-800 dark:bg-rose-950/30">
                                <span className="size-2 rounded-full bg-rose-500" />
                                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">NG</span>
                                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{statusCounts.ng}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Tabel Utama ───────────────────────────────────── */}
                {rack.bins.length === 0 ? (
                    <Card className="border-border/70 shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <Package2 className="size-9 text-muted-foreground/40" />
                            <p className="text-base font-semibold">Belum ada bin</p>
                            <p className="text-sm text-muted-foreground">Tambahkan bin ke rack ini untuk menyimpan sparepart.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden border-border/70 shadow-sm">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5">
                            <span className="text-xs text-muted-foreground">
                                {rack.bins.length} bin &middot; {totalSpareparts} sparepart
                            </span>
                            <div className="flex gap-3">
                                <button type="button" onClick={expandAll}
                                    className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                    Expand semua
                                </button>
                                <span className="text-muted-foreground/30">|</span>
                                <button type="button" onClick={collapseAll}
                                    className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                    Collapse semua
                                </button>
                            </div>
                        </div>

                        {/* SATU tabel — header kolom cukup sekali */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                {/* Header kolom — hanya muncul satu kali */}
                                <thead>
                                    <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                                        {/* Kolom bin label (kiri, lebar tetap) */}
                                        <th className="w-36 min-w-36 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                            Bin
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                            Material Number
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                            Part Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                            Brand
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border/50">
                                    {rack.bins.map((bin) => {
                                        const isCollapsed = collapsed.has(bin.id);
                                        const hasItems    = bin.spareparts.length > 0;

                                        return (
                                            <>
                                                {/* ── Row pemisah bin (clickable) ── */}
                                                <tr
                                                    key={`bin-${bin.id}`}
                                                    onClick={() => toggle(bin.id)}
                                                    className="cursor-pointer select-none border-t-2 border-border/40 bg-muted/25 transition-colors hover:bg-muted/40"
                                                >
                                                    {/* Sel bin label + chevron */}
                                                    <td className="px-4 py-2.5" colSpan={7}>
                                                        <div className="flex items-center gap-2">
                                                            {isCollapsed
                                                                ? <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                                                                : <ChevronDown  className="size-3.5 shrink-0 text-muted-foreground" />
                                                            }
                                                            <Box className="size-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {bin.code}
                                                            </span>
                                                            <Badge
                                                                variant={hasItems ? 'secondary' : 'outline'}
                                                                className="text-[10px]"
                                                            >
                                                                {bin.spareparts_count} item
                                                            </Badge>
                                                            {/* Alert dots */}
                                                            {hasItems && (
                                                                <div className="ml-2 flex items-center gap-1">
                                                                    {bin.spareparts.some((s) => s.status === 'NG') && (
                                                                        <span className="size-1.5 rounded-full bg-rose-500" />
                                                                    )}
                                                                    {bin.spareparts.some((s) => s.status === 'ATTENTION') && (
                                                                        <span className="size-1.5 rounded-full bg-amber-500" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* ── Rows sparepart (hanya kalau expanded) ── */}
                                                {!isCollapsed && (
                                                    hasItems ? (
                                                        bin.spareparts.map((sp, i) => (
                                                            <tr
                                                                key={sp.id}
                                                                className={cn(
                                                                    'transition-colors hover:bg-muted/20',
                                                                    i % 2 === 0 ? 'bg-background' : 'bg-muted/5',
                                                                    sp.status === 'NG'        && 'border-l-2 border-l-rose-500',
                                                                    sp.status === 'ATTENTION' && 'border-l-2 border-l-amber-400',
                                                                )}
                                                            >
                                                                {/* Kolom Bin kosong pada baris sparepart — supaya kolom tetap sejajar */}
                                                                <td className="px-4 py-3" />

                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <Link
                                                                        href={spareparts.show(sp.material_number).url}
                                                                        className="font-mono text-sm font-bold text-primary hover:underline"
                                                                    >
                                                                        {sp.material_number}
                                                                    </Link>
                                                                </td>
                                                                <td className="px-4 py-3 font-medium text-foreground">
                                                                    {sp.part_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                                    {sp.brand?.name ?? '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                                    {sp.category?.name ?? '-'}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
                                                                        {sp.actual_stock} unit
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <StockStatusBadge status={sp.status} />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr key={`empty-${bin.id}`}>
                                                            <td colSpan={7} className="px-4 py-2.5 text-xs text-muted-foreground/70 italic">
                                                                Bin kosong
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Racks', href: racks.index() },
        { title: 'Detail Rack' },
    ],
};
