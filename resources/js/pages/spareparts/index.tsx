import { Head, Link } from '@inertiajs/react';
import { Plus, Search, Warehouse } from 'lucide-react';
import { SparepartsTable } from '@/components/features/spareparts/spareparts-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import spareparts from '@/routes/spareparts';
import type { PaginatedResponse, Sparepart } from '@/types';

type Props = {
    spareparts: PaginatedResponse<Sparepart>;
};

export default function Index({ spareparts: response }: Props) {
    const rows = response.data;
    const lowStockCount = rows.filter((item) => item.status !== 'OK').length;
    const totalActualStock = rows.reduce((sum, item) => sum + item.actual_stock, 0);

    return (
        <>
            <Head title="Spareparts" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <Heading
                            title="Sparepart Master"
                            description="Daftar barang WMS dengan status stok, lokasi bin, dan akses cepat ke detail data."
                        />
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="rounded-full">
                                {response.total} items
                            </Badge>
                            <Badge variant="outline" className="rounded-full">
                                {lowStockCount} attention items
                            </Badge>
                            <Badge variant="outline" className="rounded-full">
                                {totalActualStock} actual stock
                            </Badge>
                        </div>
                    </div>

                    <Button asChild className="w-full gap-2 lg:w-auto">
                        <Link href={spareparts.create()}>
                            <Plus className="size-4" />
                            Add sparepart
                        </Link>
                    </Button>
                </div>

                <Card className="gap-0 overflow-hidden">
                    <CardHeader className="border-b border-border/60 pb-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Warehouse className="size-4 text-muted-foreground" />
                                    Sparepart list
                                </CardTitle>
                                <CardDescription>
                                    Klik material number atau tombol detail untuk melihat data lengkap.
                                </CardDescription>
                            </div>

                            <div className="relative w-full max-w-sm">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search sparepart..."
                                    className="pl-9"
                                    aria-label="Search spareparts"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <SparepartsTable rows={rows} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Spareparts',
            href: spareparts.index(),
        },
    ],
};
