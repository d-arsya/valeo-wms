import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import {
    formatCurrency,
    formatDate,
    getBinLabel,
} from '@/components/features/spareparts/spareparts-utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import spareparts from '@/routes/spareparts';
import type { Sparepart } from '@/types';

type Props = {
    rows: Sparepart[];
};

export function SparepartsTable({ rows }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-275 w-full border-collapse text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                    <tr>
                        <th className="px-6 py-4 font-medium">Material</th>
                        <th className="px-6 py-4 font-medium">Part</th>
                        <th className="px-6 py-4 font-medium">Location</th>
                        <th className="px-6 py-4 font-medium">Brand</th>
                        <th className="px-6 py-4 font-medium">Stock</th>
                        <th className="px-6 py-4 font-medium">Safety</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Last PO</th>
                        <th className="px-6 py-4 font-medium text-right">
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
                                    'border-t border-border/60 transition-colors hover:bg-muted/30',
                                    isAttention && 'bg-amber-500/4',
                                    index % 2 === 0 && 'bg-background',
                                )}
                            >
                                <td className="px-6 py-4 align-top">
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
                                <td className="px-6 py-4 align-top">
                                    <div className="space-y-1">
                                        <p className="font-medium text-foreground">
                                            {sparepart.part_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {sparepart.specification}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top">
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
                                <td className="px-6 py-4 align-top">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {sparepart.brand?.name ?? '-'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {sparepart.category?.name ?? '-'}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="space-y-1">
                                        <p
                                            className={cn(
                                                'font-semibold',
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
                                <td className="px-6 py-4 align-top">
                                    <div className="space-y-1">
                                        <p className="font-semibold">
                                            {sparepart.safety_stock}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Minimum threshold
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <StockStatusBadge status={sparepart.status} />
                                </td>
                                <td className="px-6 py-4 align-top">
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
                                <td className="px-6 py-4 align-top">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link
                                                href={spareparts.show(sparepart.id)}
                                            >
                                                Detail
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link
                                                href={spareparts.edit(sparepart.id)}
                                            >
                                                Edit
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
