import { Head, Link } from '@inertiajs/react';
import { BackButton } from '@/components/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Warehouse, Package2, Box } from 'lucide-react';
import racks from '@/routes/racks';
import spareparts from '@/routes/spareparts';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import type { Rack, Bin, Sparepart } from '@/types';

interface Props {
    rack: Rack & {
        bins: (Bin & {
            spareparts_count: number;
            spareparts: Sparepart[];
        })[];
    };
}

export default function Show({ rack }: Props) {
    const totalSpareparts = rack.bins.reduce((sum, bin) => sum + bin.spareparts_count, 0);

    return (
        <>
            <Head title={`Rack: ${rack.code}`} />

            <div className="space-y-6 p-4 md:p-6">
                <BackButton fallback={racks.index().url} label="Back to racks" variant="ghost" />

                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Warehouse className="size-5 text-muted-foreground" />
                        <h1 className="text-2xl font-semibold">{rack.code}</h1>
                        <Badge variant="outline">{rack.bins.length} bins</Badge>
                        <Badge variant="outline">{totalSpareparts} spareparts</Badge>
                    </div>
                </div>

                {rack.bins.length > 0 ? (
                    <div className="grid gap-6">
                        {rack.bins.map((bin) => (
                            <Card key={bin.id} className="gap-0 overflow-hidden border-border/70 shadow-sm">
                                <CardHeader className="border-b border-border/60 bg-muted/20">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Box className="size-4 text-muted-foreground" />
                                        Bin: {bin.code}
                                        <Badge variant="secondary">{bin.spareparts_count} spareparts</Badge>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="p-0">
                                    {bin.spareparts.length > 0 ? (
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
                                                            Category
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
                                                    {bin.spareparts.map((sparepart) => (
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
                                                                {sparepart.category?.name ?? '-'}
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
                                        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                                            No spareparts in this bin yet.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                        <CardHeader className="border-b border-border/60 bg-muted/20">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Package2 className="size-4 text-muted-foreground" />
                                Bins
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-12 text-center">
                            <p className="text-base font-semibold text-foreground">No bins added yet.</p>
                        </CardContent>
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
