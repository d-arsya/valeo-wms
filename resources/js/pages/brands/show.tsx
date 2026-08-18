import { Head, Link } from '@inertiajs/react';
import { MapPin, Package2, Tag } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { getBinLabel } from '@/components/features/spareparts/spareparts-utils';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import brands from '@/routes/brands';
import spareparts from '@/routes/spareparts';
import type { Brand, Sparepart } from '@/types';

interface Props {
    brand: Brand & { spareparts: Sparepart[] };
}

export default function Show({ brand }: Props) {
    const isMobile = useIsMobile();

    const statusCounts = brand.spareparts.reduce(
        (acc, s) => {
            if (s.status === 'OK') acc.ok++;
            else if (s.status === 'ATTENTION') acc.attention++;
            else acc.ng++;
            return acc;
        },
        { ok: 0, attention: 0, ng: 0 },
    );

    return (
        <>
            <Head title={`Brand: ${brand.name}`} />

            <div className="space-y-5 p-4 md:p-6">
                <BackButton fallback={brands.index().url} label="Back to brands" variant="ghost" />

                {/* Header */}
                <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <Tag className="size-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">{brand.name}</h1>
                                <p className="text-xs text-muted-foreground">
                                    {brand.spareparts.length} sparepart
                                </p>
                            </div>
                        </div>
                        {brand.spareparts.length > 0 && (
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
                        )}
                    </div>
                </div>

                {/* Sparepart list */}
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 py-3.5">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <Package2 className="size-4 text-muted-foreground" />
                            Spareparts ({brand.spareparts.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {brand.spareparts.length === 0 ? (
                            <div className="flex min-h-60 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                                <Package2 className="size-8 text-muted-foreground/40" />
                                <p className="text-base font-semibold">Belum ada sparepart</p>
                                <p className="text-sm text-muted-foreground">
                                    Sparepart dengan brand ini akan muncul di sini.
                                </p>
                            </div>
                        ) : isMobile ? (
                            /* Mobile — card list */
                            <div className="divide-y divide-border/50">
                                {brand.spareparts.map((sp) => (
                                    <Link
                                        key={sp.id}
                                        href={spareparts.show(sp.material_number).url}
                                        className={cn(
                                            'flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20',
                                            sp.status === 'NG'        && 'border-l-2 border-l-rose-500',
                                            sp.status === 'ATTENTION' && 'border-l-2 border-l-amber-400',
                                        )}
                                    >
                                        <div className="min-w-0 flex-1 space-y-0.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-sm font-bold text-primary">
                                                    {sp.material_number}
                                                </span>
                                                <StockStatusBadge status={sp.status} />
                                            </div>
                                            <p className="text-sm font-medium text-foreground leading-snug">
                                                {sp.part_name}
                                            </p>
                                            <div className="flex flex-wrap items-center justify-between gap-x-3 pt-0.5">
                                                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                                                    {sp.category?.name && <span>{sp.category.name}</span>}
                                                    {sp.bin && (
                                                        <><span className="opacity-40">·</span>
                                                        <span className="flex items-center gap-1 font-mono">
                                                            <MapPin className="size-3 shrink-0" />
                                                            {getBinLabel(sp)}
                                                        </span></>
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    'shrink-0 text-xs font-bold tabular-nums',
                                                    sp.status === 'NG'        ? 'text-rose-600 dark:text-rose-400'
                                                    : sp.status === 'ATTENTION' ? 'text-amber-600 dark:text-amber-400'
                                                    : 'text-foreground',
                                                )}>
                                                    {sp.actual_stock}
                                                    <span className="font-normal text-muted-foreground"> / {sp.safety_stock} saf</span>
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            /* Desktop — tabel */
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-sm">
                                    <thead className="border-b border-border/60 bg-muted/40 text-left text-muted-foreground">
                                        <tr>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">Material Number</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">Part Name</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">Category</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">Location</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">Stock</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {brand.spareparts.map((sp, i) => (
                                            <tr key={sp.id}
                                                className={cn(
                                                    'border-b border-border/60 transition-colors hover:bg-muted/20',
                                                    i % 2 === 1 && 'bg-muted/5',
                                                )}>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <Link href={spareparts.show(sp.material_number).url}
                                                        className="font-mono font-bold text-primary hover:underline">
                                                        {sp.material_number}
                                                    </Link>
                                                </td>
                                                <td className="px-5 py-4 font-medium text-foreground">{sp.part_name}</td>
                                                <td className="px-5 py-4 text-muted-foreground">{sp.category?.name ?? '-'}</td>
                                                <td className="px-5 py-4 text-muted-foreground">{getBinLabel(sp)}</td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <Badge variant="secondary">{sp.actual_stock} unit</Badge>
                                                </td>
                                                <td className="px-5 py-4"><StockStatusBadge status={sp.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Brands', href: brands.index() },
        { title: 'Detail Brand' },
    ],
};
