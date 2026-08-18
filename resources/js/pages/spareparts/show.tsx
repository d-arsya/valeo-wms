import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    ArrowDownRight,
    ArrowUpRight,
    Download,
    Edit3,
    FileText,
    Loader2,
    MapPin,
    Package,
    Printer,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { BackButton } from '@/components/back-button';
import { StockStatusBadge } from '@/components/features/spareparts/stock-status-badge';
import {
    formatCurrency,
    formatDate,
    getBinLabel,
} from '@/components/features/spareparts/spareparts-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import qrRoutes from '@/routes/qr';
import spareparts from '@/routes/spareparts';
import { form as stockInForm } from '@/routes/stock/in';
import { form as stockOutForm } from '@/routes/stock/out';
import type { ActivityLog, Sparepart } from '@/types';
import type { User } from '@/types/auth';

type SparepartDetail = Sparepart & {
    // Laravel serializes relation as snake_case: activity_logs
    activity_logs: Array<ActivityLog & { user?: User | null }>;
};

interface Props {
    sparepart: SparepartDetail;
    qrCodeSvg: string;
}

// ---------------------------------------------------------------------------
// Helpers cetak QR — reuse logic dari qr-codes/print.tsx
// ---------------------------------------------------------------------------
async function fetchQrPreviewHtml(sparepartId: number): Promise<string> {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    const body = new FormData();
    body.append('_token', meta?.content ?? '');
    body.append('mode', 'selected');
    body.append('ids[]', String(sparepartId));

    const res = await fetch(qrRoutes.print.preview().url, {
        method: 'POST', body,
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'text/html' },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const match = text.match(/<title>(.*?)<\/title>/i);
        throw new Error(match?.[1] ?? `Server error ${res.status}`);
    }
    return res.text();
}

function downloadQrPdf(sparepartId: number, onDone?: () => void) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    const form = document.createElement('form');
    form.method = 'POST'; form.action = qrRoutes.print.generate().url;
    form.style.display = 'none'; form.enctype = 'multipart/form-data'; form.target = '_self';
    const add = (name: string, value: string) => {
        const el = document.createElement('input'); el.name = name; el.value = value; form.appendChild(el);
    };
    add('_token', meta?.content ?? ''); add('mode', 'selected'); add('ids[]', String(sparepartId));
    document.body.appendChild(form); form.submit();
    setTimeout(() => { try { document.body.removeChild(form); } catch { /**/ } onDone?.(); }, 3500);
}

// ---------------------------------------------------------------------------
export default function Show({ sparepart, qrCodeSvg }: Props) {
    const { auth } = usePage().props;
    const isAdmin      = auth.user?.role === 'admin';
    const activityLogs = sparepart.activity_logs ?? [];

    // QR print modal state
    const [qrOpen, setQrOpen]         = useState(false);
    const [qrLoading, setQrLoading]   = useState(false);
    const [qrBlobUrl, setQrBlobUrl]   = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const blobRef = useRef<string | null>(null);

    function handleDelete() {
        if (!window.confirm(`Hapus sparepart ${sparepart.material_number}?`)) return;
        router.delete(spareparts.destroy(sparepart.id), { preserveScroll: true });
    }

    // Buka modal preview QR
    const handlePrintQr = useCallback(async () => {
        setQrOpen(true); setQrLoading(true);
        if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; setQrBlobUrl(null); }
        try {
            const html = await fetchQrPreviewHtml(sparepart.id);
            const blob = new Blob([html], { type: 'text/html' });
            const url  = URL.createObjectURL(blob);
            blobRef.current = url; setQrBlobUrl(url);
        } catch (err) {
            setQrOpen(false);
            toast.error(err instanceof Error ? err.message : 'Gagal memuat preview QR.', { duration: 8000 });
        } finally { setQrLoading(false); }
    }, [sparepart.id]);

    const handleCloseQr = () => {
        setQrOpen(false);
        setTimeout(() => {
            if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; setQrBlobUrl(null); }
        }, 400);
    };

    const handleDownloadQr = useCallback(() => {
        setDownloading(true);
        downloadQrPdf(sparepart.id, () => {
            setDownloading(false); setQrOpen(false);
            toast.success('Label QR berhasil diunduh.');
        });
    }, [sparepart.id]);

    // Nilai progress bar stok
    const stockPct = sparepart.safety_stock > 0
        ? Math.min(100, Math.round((sparepart.actual_stock / sparepart.safety_stock) * 100))
        : 100;
    const stockColor = sparepart.status === 'NG' ? 'bg-rose-500'
        : sparepart.status === 'ATTENTION' ? 'bg-amber-500'
        : 'bg-emerald-500';

    const returnTo = spareparts.show(sparepart.material_number).url;

    return (
        <>
            <Head title={sparepart.material_number} />

            <div className="space-y-5 p-4 md:p-6">
                <BackButton
                    fallback={spareparts.index().url}
                    label="Kembali ke daftar"
                    variant="ghost"
                    className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                />

                    {/* ── Hero Card ──────────────────────────────────────────── */}
                <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                    {/* Top section: QR + identitas + actions */}
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5">
                        {/* QR Code — ukuran fixed, tidak boleh mengembang */}
                        <div className="shrink-0 self-start rounded-xl border border-border/60 bg-white p-2.5">
                            <div
                                className="size-[96px] overflow-hidden [&>svg]:size-full"
                                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                            />
                        </div>

                        {/* Identitas */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="font-mono text-lg font-bold tracking-tight text-foreground">
                                    {sparepart.material_number}
                                </h1>
                                <StockStatusBadge status={sparepart.status} />
                                {sparepart.rank && (
                                    <Badge variant="outline" className="text-xs">Rank {sparepart.rank}</Badge>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-foreground">{sparepart.part_name}</p>
                            {sparepart.specification && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{sparepart.specification}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                                {sparepart.brand?.name && <span>{sparepart.brand.name}</span>}
                                {sparepart.category?.name && (
                                    <><span className="opacity-40">·</span><span>{sparepart.category.name}</span></>
                                )}
                                {sparepart.bin && (
                                    <><span className="opacity-40">·</span>
                                    <span className="flex items-center gap-1 font-mono">
                                        <MapPin className="size-3" />{getBinLabel(sparepart)}
                                    </span></>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stock summary bar */}
                    <div className="border-t border-border/60 px-5 py-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Stok aktual</p>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className={cn(
                                        'text-3xl font-black tabular-nums leading-none',
                                        sparepart.status !== 'OK' && 'text-amber-600 dark:text-amber-400',
                                    )}>
                                        {sparepart.actual_stock}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        / {sparepart.safety_stock} safety
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-muted sm:w-48">
                                    <div
                                        className={cn('h-full rounded-full transition-all', stockColor)}
                                        style={{ width: `${stockPct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap justify-end gap-2">
                                <Button asChild size="sm" variant="outline" className="gap-1.5">
                                    <Link href={stockOutForm(sparepart.id, { query: { return_to: returnTo } })}>
                                        <ArrowDownRight className="size-3.5" />
                                        Stock Out
                                    </Link>
                                </Button>
                                {isAdmin && (
                                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                                        <Link href={stockInForm(sparepart.id, { query: { return_to: returnTo } })}>
                                            <ArrowUpRight className="size-3.5" />
                                            Stock In
                                        </Link>
                                    </Button>
                                )}
                                {/* Cetak QR */}
                                <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePrintQr}>
                                    <Printer className="size-3.5" />
                                    <span className="hidden sm:inline">Cetak QR</span>
                                </Button>
                                {isAdmin && (
                                    <>
                                        <Button asChild size="sm" className="gap-1.5">
                                            <Link href={spareparts.edit(sparepart.id)}>
                                                <Edit3 className="size-3.5" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </Link>
                                        </Button>
                                        <Button size="sm" variant="destructive" className="gap-1.5" onClick={handleDelete}>
                                            <Trash2 className="size-3.5" />
                                            <span className="hidden sm:inline">Hapus</span>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Detail + Activity ──────────────────────────────────── */}
                <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)]">

                    {/* Detail master data */}
                    <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/60 py-3.5">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Package className="size-4 text-muted-foreground" />
                                Informasi detail
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <dl className="divide-y divide-border/50">
                                {[
                                    { label: 'Brand',         value: sparepart.brand?.name ?? '-' },
                                    { label: 'Category',      value: sparepart.category?.name ?? '-' },
                                    { label: 'Rank',          value: sparepart.rank ?? '-' },
                                    { label: 'Rack / Bin',    value: `${sparepart.bin?.rack?.code ?? '-'} / ${sparepart.bin?.code ?? '-'}` },
                                    { label: 'Safety stock',  value: String(sparepart.safety_stock) },
                                    { label: 'Actual stock',  value: String(sparepart.actual_stock), bold: true },
                                    { label: 'Last PO',       value: sparepart.last_po_number ?? '-' },
                                    { label: 'Last supplier', value: sparepart.last_supplier ?? '-' },
                                    { label: 'Last GR date',  value: formatDate(sparepart.last_gr_date) },
                                    { label: 'Price / unit',  value: formatCurrency(sparepart.price_per_unit) },
                                    { label: 'Dibuat',        value: formatDate(sparepart.created_at) },
                                ].map(({ label, value, bold }) => (
                                    <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                                        <dt className="w-28 shrink-0 text-xs text-muted-foreground">{label}</dt>
                                        <dd className={cn(
                                            'min-w-0 break-words text-right text-sm',
                                            bold ? 'font-bold text-foreground' : 'font-medium text-foreground',
                                        )}>
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Activity log */}
                    <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/60 py-3.5">
                            <CardTitle className="text-sm font-semibold">Riwayat aktivitas</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activityLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                    <FileText className="size-7 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">Belum ada riwayat transaksi.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {activityLogs.map((log) => {
                                        const isIn = log.type === 'IN';
                                        return (
                                            <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                                                {/* Badge IN / OUT */}
                                                <div className={cn(
                                                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                                    isIn
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
                                                )}>
                                                    {isIn ? 'IN' : 'OUT'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <span className="font-mono text-xs text-muted-foreground">{log.control_id}</span>
                                                        <span className={cn(
                                                            'shrink-0 text-sm font-bold tabular-nums',
                                                            isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                                                        )}>
                                                            {isIn ? '+' : '-'}{log.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2 mt-0.5">
                                                        <span className="text-xs text-muted-foreground">{log.user?.name ?? '-'}</span>
                                                        <span className="text-[10px] text-muted-foreground/60">
                                                            {log.performed_at
                                                                ? format(parseISO(log.performed_at), 'd MMM yyyy, HH:mm', { locale: localeId })
                                                                : '-'
                                                            }
                                                        </span>
                                                    </div>
                                                    {log.remarks && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground/70 italic">{log.remarks}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Modal Preview QR ────────────────────────────────────────── */}
            <Dialog open={qrOpen} onOpenChange={(open) => { if (!open) handleCloseQr(); }}>
                <DialogContent className="flex h-[92dvh] max-h-[92dvh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0">
                    <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <Printer className="size-4 text-muted-foreground" />
                            Preview Label QR — {sparepart.material_number}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            1 label · 1 halaman A4
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative min-h-0 flex-1 bg-muted/20">
                        {qrLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <Loader2 className="size-8 animate-spin" />
                                <p className="text-sm">Memuat preview…</p>
                            </div>
                        ) : qrBlobUrl ? (
                            <iframe
                                src={qrBlobUrl}
                                className="size-full border-0"
                                title="Preview Label QR"
                                sandbox="allow-same-origin"
                            />
                        ) : null}
                    </div>

                    <DialogFooter className="shrink-0 border-t border-border/60 bg-background px-5 py-3 sm:justify-between">
                        <Button type="button" variant="outline" onClick={handleCloseQr} disabled={downloading} className="gap-2">
                            <X className="size-4" />Tutup
                        </Button>
                        <Button type="button" onClick={handleDownloadQr} disabled={downloading || qrLoading} className="gap-2">
                            {downloading
                                ? <><Loader2 className="size-4 animate-spin" />Mengunduh…</>
                                : <><Download className="size-4" />Download PDF</>
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Spareparts', href: spareparts.index() },
        { title: 'Detail sparepart' },
    ],
};
