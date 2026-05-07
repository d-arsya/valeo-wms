import { Link } from '@inertiajs/react';
import { ArrowLeft, Building2, MapPin, Package, ShieldAlert } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { getBinLabel } from '@/components/features/spareparts/spareparts-utils';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import { ActivityLogTable } from '@/components/features/stock/activity-log-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Sparepart } from '@/types';
import type { ActivityLog } from '@/types';
import type { User } from '@/types/auth';

interface Props {
    title: string;
    description: string;
    sparepart: Sparepart;
    cancelHref: string;
    submitLabel: string;
    processing: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    footerNote: string;
    activityLogs?: Array<ActivityLog & { user?: User | null }>;
    children: ReactNode;
}

export function StockTransactionForm({
    title,
    description,
    sparepart,
    cancelHref,
    submitLabel,
    processing,
    onSubmit,
    footerNote,
    activityLogs = [],
    children,
}: Props) {
    return (
        <>
            <div className="space-y-6 p-4 md:p-6">
                <Button variant="ghost" asChild className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
                    <Link href={cancelHref}>
                        <ArrowLeft className="size-4" />
                        Kembali ke detail
                    </Link>
                </Button>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.8fr)]">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                            <CardHeader className="border-b border-border/60">
                                <CardTitle className="text-lg">{title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-6">
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current stock</p>
                                            <p className="mt-1 text-2xl font-semibold tabular-nums">{sparepart.actual_stock}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Safety stock</p>
                                            <p className="mt-1 text-2xl font-semibold tabular-nums">{sparepart.safety_stock}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lokasi</p>
                                            <p className="mt-1 text-sm font-semibold">{getBinLabel(sparepart)}</p>
                                        </div>
                                    </div>
                                </div>

                                {children}
                            </CardContent>

                            <CardContent className="flex flex-col gap-3 border-t border-border/60 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">{footerNote}</p>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button variant="outline" asChild>
                                        <Link href={cancelHref}>Batal</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {submitLabel}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>

                    <div className="space-y-6">
                        <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                            <CardHeader className="border-b border-border/60">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="size-4 text-muted-foreground" />
                                    Ringkasan sparepart
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-5 py-6">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Material Number</p>
                                    <p className="mt-1 text-lg font-semibold">{sparepart.material_number}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{sparepart.part_name}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <StockStatusBadge status={sparepart.status} />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Status stok</p>
                                        <p className="text-xs text-muted-foreground">Dihitung otomatis dari actual stock dan safety stock.</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SummaryItem icon={<MapPin className="size-4" />} label="Location" value={getBinLabel(sparepart)} />
                                    <SummaryItem icon={<Building2 className="size-4" />} label="Rack / Bin" value={`${sparepart.bin?.rack?.code ?? '-'} / ${sparepart.bin?.code ?? '-'}`} />
                                    <SummaryItem icon={<ShieldAlert className="size-4" />} label="Actual Stock" value={String(sparepart.actual_stock)} />
                                    <SummaryItem icon={<ShieldAlert className="size-4" />} label="Safety Stock" value={String(sparepart.safety_stock)} />
                                </div>

                                <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                                    {sparepart.brand?.name ?? '-'} · {sparepart.category?.name ?? '-'}
                                </div>
                            </CardContent>
                        </Card>

                        {activityLogs.length > 0 && <ActivityLogTable activityLogs={activityLogs} />}
                    </div>
                </div>
            </div>
        </>
    );
}

interface SummaryItemProps {
    icon: ReactNode;
    label: string;
    value: string;
}

function SummaryItem({ icon, label, value }: SummaryItemProps) {
    return (
        <div className="rounded-xl border border-border/60 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {icon}
                {label}
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}
