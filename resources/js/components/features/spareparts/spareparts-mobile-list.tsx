import { Link, usePage } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Eye, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getBinLabel } from '@/components/features/spareparts/spareparts-utils';
import spareparts from '@/routes/spareparts';
import { form as stockInForm } from '@/routes/stock/in';
import { form as stockOutForm } from '@/routes/stock/out';
import type { Sparepart } from '@/types';

// Dot warna status
const statusDot: Record<string, string> = {
    OK:        'bg-emerald-500',
    ATTENTION: 'bg-amber-500',
    NG:        'bg-rose-500',
};

const statusLabel: Record<string, string> = {
    OK:        'OK',
    ATTENTION: 'Attention',
    NG:        'NG',
};

const statusBg: Record<string, string> = {
    OK:        'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40',
    ATTENTION: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40',
    NG:        'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40',
};

interface Props {
    rows: Sparepart[];
}

export function SparepartsMobileList({ rows }: Props) {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';

    if (rows.length === 0) return null;

    return (
        <div className="divide-y divide-border/50">
            {rows.map((sp) => {
                const location = getBinLabel(sp);
                const dot      = statusDot[sp.status] ?? 'bg-muted-foreground';
                const badge    = statusBg[sp.status] ?? '';
                const label    = statusLabel[sp.status] ?? sp.status;
                const isNgOrAttention = sp.status !== 'OK';

                return (
                    <div
                        key={sp.id}
                        className={cn(
                            'relative flex flex-col gap-2.5 px-4 py-4',
                            // Border kiri berwarna untuk status tidak OK
                            sp.status === 'NG'        && 'border-l-2 border-l-rose-500',
                            sp.status === 'ATTENTION' && 'border-l-2 border-l-amber-500',
                        )}
                    >
                        {/* ── Baris 1: material number + status badge ── */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={cn('size-2 shrink-0 rounded-full', dot)} />
                                <Link
                                    href={spareparts.show(sp.material_number).url}
                                    className="font-mono text-sm font-bold text-primary"
                                >
                                    {sp.material_number}
                                </Link>
                                {sp.rank && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                        {sp.rank}
                                    </Badge>
                                )}
                            </div>
                            <span className={cn(
                                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                badge,
                            )}>
                                {label}
                            </span>
                        </div>

                        {/* ── Baris 2: part name ── */}
                        <p className="text-sm font-medium text-foreground leading-snug">
                            {sp.part_name}
                        </p>

                        {/* ── Baris 3: meta info ── */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {sp.brand?.name && (
                                <span className="font-medium text-foreground/70">{sp.brand.name}</span>
                            )}
                            {sp.category?.name && (
                                <span>{sp.category.name}</span>
                            )}
                            {sp.bin && (
                                <span className="flex items-center gap-1 font-mono">
                                    <MapPin className="size-3 shrink-0" />
                                    {location}
                                </span>
                            )}
                        </div>

                        {/* ── Baris 4: stock + actions ── */}
                        <div className="flex items-center justify-between gap-2">
                            {/* Stock */}
                            <div className="flex items-baseline gap-1">
                                <span className={cn(
                                    'text-lg font-bold tabular-nums leading-none',
                                    isNgOrAttention && 'text-amber-600 dark:text-amber-400',
                                )}>
                                    {sp.actual_stock}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    / {sp.safety_stock} safety
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1.5">
                                {/* Stock Out — semua user */}
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 px-3 text-xs"
                                >
                                    <Link href={stockOutForm(sp.id, {
                                        query: { return_to: spareparts.index().url },
                                    })}>
                                        <ArrowDownRight className="size-3.5" />
                                        Out
                                    </Link>
                                </Button>

                                {/* Stock In — admin only */}
                                {isAdmin && (
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1.5 px-3 text-xs"
                                    >
                                        <Link href={stockInForm(sp.id, {
                                            query: { return_to: spareparts.index().url },
                                        })}>
                                            <ArrowUpRight className="size-3.5" />
                                            In
                                        </Link>
                                    </Button>
                                )}

                                {/* Detail */}
                                <Button
                                    asChild
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    aria-label="Lihat detail"
                                >
                                    <Link href={spareparts.show(sp.material_number).url}>
                                        <Eye className="size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
