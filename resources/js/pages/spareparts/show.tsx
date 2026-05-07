import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Edit3, MapPin, Package, Printer, QrCode, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, getBinLabel } from '@/components/features/spareparts/spareparts-utils';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import spareparts from '@/routes/spareparts';
import { form as stockInForm } from '@/routes/stock/in';
import { form as stockOutForm } from '@/routes/stock/out';
import type { ActivityLog, Sparepart } from '@/types';
import type { User } from '@/types/auth';

type SparepartDetail = Sparepart & {
    activityLogs: Array<ActivityLog & { user?: User | null }>;
};

interface Props {
    sparepart: SparepartDetail;
}

function renderActivityBadge(type: ActivityLog['type']) {
    return type === 'IN' ? (
        <Badge variant="secondary">IN</Badge>
    ) : (
        <Badge variant="destructive">OUT</Badge>
    );
}

export default function Show({ sparepart }: Props) {
    const activityLogs = sparepart.activityLogs ?? [];

    function handleDelete() {
        if (!window.confirm(`Hapus sparepart ${sparepart.material_number}?`)) {
            return;
        }

        router.delete(spareparts.destroy(sparepart.id), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={sparepart.material_number} />

            <div className="space-y-6 p-4 md:p-6">
                <Button variant="ghost" asChild className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
                    <Link href={spareparts.index()}>
                        <ArrowLeft className="size-4" />
                        Kembali ke daftar
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">

                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight">{sparepart.material_number}</h1>
                                <StockStatusBadge status={sparepart.status} />
                            </div>
                            <p className="text-sm text-muted-foreground">{sparepart.part_name}</p>
                            <p className="max-w-3xl text-sm text-muted-foreground">{sparepart.specification}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="secondary">
                            <Link href={stockOutForm(sparepart.id)}>
                                Stock OUT
                            </Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href={stockInForm(sparepart.id)}>
                                Stock IN
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={spareparts.label(sparepart.id)}>
                                <QrCode className="size-4" />
                                Generate QR
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={spareparts.label(sparepart.id, { query: { print: '1' } })} target="_blank" rel="noreferrer">
                                <Printer className="size-4" />
                                Print Label
                            </Link>
                        </Button>
                        <Button asChild >
                            <Link href={spareparts.edit(sparepart.id)}>
                                <Edit3 className="size-4" />
                                Edit sparepart
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="size-4" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
                    <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Package className="size-4 text-muted-foreground" />
                                Detail master data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 py-6 md:grid-cols-2">
                            <DetailItem label="Brand" value={sparepart.brand?.name ?? '-'} />
                            <DetailItem label="Category" value={sparepart.category?.name ?? '-'} />
                            <DetailItem label="Location" value={getBinLabel(sparepart)} />
                            <DetailItem label="Rack / Bin" value={`${sparepart.bin?.rack?.code ?? '-'} / ${sparepart.bin?.code ?? '-'}`} />
                            <DetailItem label="Safety stock" value={String(sparepart.safety_stock)} />
                            <DetailItem label="Actual stock" value={String(sparepart.actual_stock)} emphasize />
                            <DetailItem label="Last PO" value={sparepart.last_po_number ?? '-'} />
                            <DetailItem label="Last supplier" value={sparepart.last_supplier ?? '-'} />
                            <DetailItem label="Last GR date" value={formatDate(sparepart.last_gr_date)} />
                            <DetailItem label="Price per unit" value={formatCurrency(sparepart.price_per_unit)} />
                            <DetailItem label="QR Code" value={sparepart.qr_code_path ?? '-'} />
                            <DetailItem label="Dibuat" value={formatDate(sparepart.created_at)} />
                        </CardContent>
                    </Card>

                    <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="size-4 text-muted-foreground" />
                                Ringkasan stok
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 py-6">
                            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                <p className="text-sm text-muted-foreground">Status otomatis dihitung dari actual stock dan safety stock.</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <AlertTriangle className="size-5 text-amber-500" />
                                    <StockStatusBadge status={sparepart.status} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-border/60 p-4">
                                    <p className="text-sm text-muted-foreground">Actual stock</p>
                                    <p className="mt-1 text-2xl font-semibold tabular-nums">{sparepart.actual_stock}</p>
                                </div>
                                <div className="rounded-xl border border-border/60 p-4">
                                    <p className="text-sm text-muted-foreground">Safety stock</p>
                                    <p className="mt-1 text-2xl font-semibold tabular-nums">{sparepart.safety_stock}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                                Lokasi fisik: {getBinLabel(sparepart)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/60">
                        <CardTitle className="text-base">Riwayat aktivitas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {activityLogs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-sm">
                                    <thead className="bg-muted/30 text-left text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Control ID</th>
                                            <th className="px-6 py-4 font-medium">Type</th>
                                            <th className="px-6 py-4 font-medium">Qty</th>
                                            <th className="px-6 py-4 font-medium">User</th>
                                            <th className="px-6 py-4 font-medium">Performed at</th>
                                            <th className="px-6 py-4 font-medium">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityLogs.map((log, index) => (
                                            <tr key={log.id} className={index % 2 === 1 ? 'bg-muted/10' : ''}>
                                                <td className="px-6 py-4 align-top font-medium">{log.control_id}</td>
                                                <td className="px-6 py-4 align-top">{renderActivityBadge(log.type)}</td>
                                                <td className="px-6 py-4 align-top tabular-nums">{log.quantity}</td>
                                                <td className="px-6 py-4 align-top">{log.user?.name ?? '-'}</td>
                                                <td className="px-6 py-4 align-top">{formatDateTime(log.performed_at)}</td>
                                                <td className="px-6 py-4 align-top">{log.remarks ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                                Belum ada riwayat transaksi untuk sparepart ini.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function DetailItem({
    label,
    value,
    emphasize = false,
}: DetailItemProps) {
    return (
        <div className="rounded-xl border border-border/60 p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={emphasize ? 'mt-1 text-lg font-semibold tabular-nums' : 'mt-1 text-sm font-medium'}>
                {value}
            </p>
        </div>
    );
}

interface DetailItemProps {
    label: string;
    value: string;
    emphasize?: boolean;
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Spareparts',
            href: spareparts.index(),
        },
        {
            title: 'Detail sparepart',
            href: spareparts.index(),
        },
    ],
};
