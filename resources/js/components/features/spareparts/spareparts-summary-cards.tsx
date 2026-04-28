import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type Props = {
    total: number;
    lowStockCount: number;
    totalActualStock: number;
};

export function SparepartsSummaryCards({
    total,
    lowStockCount,
    totalActualStock,
}: Props) {
    const stats = [
        {
            title: 'Material coverage',
            value: `${total} spareparts`,
            description: 'Master data yang bisa dipakai untuk barcode dan scan bin.',
        },
        {
            title: 'At risk',
            value: `${lowStockCount} item`,
            description: 'Item dengan status ATTENTION atau NG.',
        },
        {
            title: 'Total actual stock',
            value: totalActualStock.toString(),
            description: 'Jumlah stok aktual pada data yang ditampilkan.',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
                <Card key={stat.title} className="gap-0">
                    <CardHeader className="pb-3">
                        <CardDescription>{stat.title}</CardDescription>
                        <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
