import { Head, useForm } from '@inertiajs/react';
import { FileText, Download, Filter, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import reports from '@/routes/reports';

interface ReportsProps {
    filters: {
        from?: string;
        to?: string;
        type?: string;
        search?: string;
    };
}

export default function ReportsIndex({ filters }: ReportsProps) {
    const { data, setData, get, processing } = useForm({
        from: filters.from || '',
        to: filters.to || '',
        type: filters.type || 'all',
        search: filters.search || '',
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        get(reports.index().url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        // Redirect to the export route with current filters
        window.open(reports.export({ query: data as any }).url, '_blank');
    };

    return (
        <>
            <Head title="Laporan Transaksi" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Laporan Transaksi</h1>
                    <p className="text-muted-foreground">
                        Filter dan ekspor riwayat transaksi stok (IN/OUT) ke dalam format PDF.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Filter Sidebar */}
                    <Card className="md:col-span-4 lg:col-span-3 h-fit border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filter Laporan
                            </CardTitle>
                            <CardDescription>Sesuaikan kriteria laporan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleFilter} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="from">Dari Tanggal</Label>
                                    <Input 
                                        id="from" 
                                        type="date" 
                                        value={data.from}
                                        onChange={e => setData('from', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="to">Sampai Tanggal</Label>
                                    <Input 
                                        id="to" 
                                        type="date" 
                                        value={data.to}
                                        onChange={e => setData('to', e.target.value)}
                                    />
                                </div>
                                <Separator className="my-2" />
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Tipe Transaksi</Label>
                                    <Select 
                                        value={data.type} 
                                        onValueChange={value => setData('type', value)}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Pilih tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Tipe</SelectItem>
                                            <SelectItem value="IN">Stock IN</SelectItem>
                                            <SelectItem value="OUT">Stock OUT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="search">Control ID / Material #</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="search"
                                            placeholder="Cari ID atau No..."
                                            className="pl-9"
                                            value={data.search}
                                            onChange={e => setData('search', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="mt-2 w-full" disabled={processing}>
                                    Terapkan Filter
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Report Summary & Export Actions */}
                    <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
                        <Card className="border-border/60 shadow-sm overflow-hidden bg-primary/5 border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Ekspor PDF</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Unduh laporan sesuai filter yang diterapkan di samping.
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="lg" onClick={handleExport} className="w-full md:w-auto h-12 px-8 text-lg font-bold">
                                        <Download className="mr-2 h-5 w-5" />
                                        Download PDF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instruction / Preview Placeholder */}
                        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-xl border-border/60 bg-muted/20 text-center">
                            <div className="p-4 bg-muted rounded-full mb-4">
                                <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h4 className="text-lg font-semibold mb-1">Siap untuk diekspor</h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Silakan pilih rentang tanggal dan tipe transaksi yang ingin Anda laporkan, lalu klik tombol download di atas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Define the layout with breadcrumbs
ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '#' },
    ],
};
