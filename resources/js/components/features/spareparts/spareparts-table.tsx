import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
    formatCurrency,
    formatDate,
    getBinLabel,
} from '@/components/features/spareparts/spareparts-utils';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import spareparts from '@/routes/spareparts';
import { form as stockInForm } from '@/routes/stock/in';
import { form as stockOutForm } from '@/routes/stock/out';
import type { Sparepart } from '@/types';

interface Props {
    rows: Sparepart[];
}

export function SparepartsTable({ rows }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-300 w-full border-collapse text-sm">
                <thead className="bg-muted/30 text-left text-muted-foreground">
                    <tr>
                        <th className="px-5 py-4 font-medium">Material</th>
                        <th className="px-5 py-4 font-medium">Part</th>
                        <th className="px-5 py-4 font-medium">Location</th>
                        <th className="px-5 py-4 font-medium">Brand</th>
                        <th className="px-5 py-4 font-medium">Stock</th>
                        <th className="px-5 py-4 font-medium">Safety</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 font-medium">Last PO</th>
                        <th className="px-5 py-4 font-medium text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((sparepart, index) => {
                        const isAttention = sparepart.status !== 'OK';

                        return (
                            <tr
                                key={sparepart.id}
                                className={cn(
                                    'border-t border-border/60 transition-colors hover:bg-muted/25',
                                    isAttention && 'bg-amber-500/5',
                                    index % 2 === 1 && 'bg-muted/10',
                                )}
                            >
                                <td className="px-5 py-4 align-middle">
                                    <div className="space-y-1">
                                        <Link
                                            href={spareparts.show(sparepart.id)}
                                            className="font-semibold text-foreground transition-colors hover:text-primary"
                                        >
                                            {sparepart.material_number}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            Created {formatDate(sparepart.created_at)}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                    <div className="space-y-1">
                                        <p className="font-medium text-foreground">
                                            {sparepart.part_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {sparepart.specification}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {getBinLabel(sparepart)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {sparepart.bin?.rack?.code ?? '-'} /{' '}
                                            {sparepart.bin?.code ?? '-'}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {sparepart.brand?.name ?? '-'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {sparepart.category?.name ?? '-'}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                    <div className="space-y-1">
                                        <p
                                            className={cn(
                                                'font-semibold tabular-nums',
                                                isAttention &&
                                                'text-amber-600 dark:text-amber-400',
                                            )}
                                        >
                                            {sparepart.actual_stock}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Current actual stock
                                        </p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                    <div className="space-y-1">
                                        <p className="font-semibold tabular-nums">
                                            {sparepart.safety_stock}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Minimum threshold
                                        </p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                    <StockStatusBadge status={sparepart.status} />
                                </td>
                                <td className="px-5 py-4 align-middle">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {sparepart.last_po_number ?? '-'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {sparepart.last_supplier ?? '-'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            GR {formatDate(sparepart.last_gr_date)} -{' '}
                                            {formatCurrency(
                                                sparepart.price_per_unit,
                                            )}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Button asChild variant="secondary" size="sm" className="h-8 px-3">
                                            <Link
                                                href={stockOutForm(sparepart.id, { query: { return_to: spareparts.index().url } })}
                                            >
                                                OUT
                                                <ArrowDownRight className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="secondary" size="sm" className="h-8 px-3">
                                            <Link
                                                href={stockInForm(sparepart.id, { query: { return_to: spareparts.index().url } })}
                                            >
                                                IN
                                                <ArrowUpRight className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm" className="h-8 px-3">
                                            <Link
                                                href={spareparts.show(sparepart.material_number)}
                                            >
                                                Detail
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
