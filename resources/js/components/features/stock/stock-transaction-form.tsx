import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { getBinLabel } from '@/components/features/spareparts/spareparts-utils';
import { ActivityLogTable } from '@/components/features/stock/activity-log-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityLog, Sparepart } from '@/types';
import type { User } from '@/types/auth';

interface Props {
    title: string;
    sparepart: Sparepart;
    cancelHref: string;
    submitLabel: string;
    processing: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    activityLogs?: Array<ActivityLog & { user?: User | null }>;
    children: ReactNode;
}

export function StockTransactionForm({
    title,
    sparepart,
    cancelHref,
    submitLabel,
    processing,
    onSubmit,
    activityLogs = [],
    children,
}: Props) {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <Button variant="ghost" asChild className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
                <Link href={cancelHref}>
                    <ArrowLeft className="size-4" />
                    Kembali
                </Link>
            </Button>

            <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
                <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/60 py-4">
                        <div>
                            <CardTitle className="text-base">{title}</CardTitle>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {sparepart.part_name} &middot; {getBinLabel(sparepart)}
                                &nbsp;&middot;&nbsp; Stok: <strong className="text-foreground">{sparepart.actual_stock}</strong>
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-5">
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

                    <CardContent className="flex justify-end gap-2 border-t border-border/60 py-4">
                        <Button variant="outline" asChild>
                            <Link href={cancelHref}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {submitLabel}
                        </Button>
                    </CardContent>
                </Card>
            </form>

            {activityLogs.length > 0 && (
                <div className="max-w-2xl">
                    <ActivityLogTable activityLogs={activityLogs} />
                </div>
            )}
        </div>
    );
}
