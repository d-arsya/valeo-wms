import { Head, Link } from '@inertiajs/react';
import { BackButton } from '@/components/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Package2 } from 'lucide-react';
import { getBinLabel } from '@/components/features/spareparts/spareparts-utils';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import categories from '@/routes/categories';
import spareparts from '@/routes/spareparts';
import type { Category, Sparepart } from '@/types';

interface Props {
    category: Category & { spareparts: Sparepart[] };
}

export default function Show({ category }: Props) {
    return (
        <>
            <Head title={`Category: ${category.name}`} />

            <div className="space-y-6 p-4 md:p-6">
                <BackButton fallback={categories.index().url} label="Back to categories" variant="ghost" />

                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Layers className="size-5 text-muted-foreground" />
                        <h1 className="text-2xl font-semibold">{category.name}</h1>
                    </div>
                </div>

                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 bg-muted/20">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Package2 className="size-4 text-muted-foreground" />
                            Spareparts ({category.spareparts.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {category.spareparts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-muted-foreground border-b border-border/60">
                                        <tr>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                                                Material Number
                                            </th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                                                Part Name
                                            </th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                                                Brand
                                            </th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                                                Location
                                            </th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                                                Stock
                                            </th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {category.spareparts.map((sparepart) => (
                                            <tr
                                                key={sparepart.id}
                                                className="border-b border-border/60 transition-colors hover:bg-muted/20"
                                            >
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={spareparts.show(sparepart.material_number).url}
                                                        className="font-semibold text-foreground hover:text-primary"
                                                    >
                                                        {sparepart.material_number}
                                                    </Link>
                                                </td>
                                                <td className="px-5 py-4 text-foreground">{sparepart.part_name}</td>
                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {sparepart.brand?.name ?? '-'}
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {getBinLabel(sparepart)}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <Badge variant="secondary">{sparepart.actual_stock} units</Badge>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StockStatusBadge status={sparepart.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                                <p className="text-base font-semibold text-foreground">
                                    No spareparts yet
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Spareparts with this category will appear here.
                                </p>
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
        { title: 'Categories', href: categories.index() },
        { title: 'Detail Category' },
    ],
};
