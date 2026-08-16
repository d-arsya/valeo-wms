import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    FileText,
    Loader2,
    Package2,
    Printer,
    Search,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/pagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { getBinLocationLabel } from '@/components/features/spareparts/spareparts-utils';
import qrRoutes from '@/routes/qr';
import type { PaginatedResponse, Sparepart } from '@/types';

interface PrintPageProps {
    spareparts: PaginatedResponse<Sparepart>;
    search: string;
}

/** Jumlah label per halaman PDF — harus sinkron dengan CHUNK_SIZE di controller */
const LABELS_PER_PAGE = 14;
/** Batas maksimum pilihan per cetak */
const MAX_SELECTED = 60;

// ---------------------------------------------------------------------------
// Fetch preview HTML dari server
// ---------------------------------------------------------------------------
async function fetchPreviewHtml(
    actionUrl: string,
    selectedIds: Set<number>,
): Promise<string> {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    const body = new FormData();
    body.append('_token', meta?.content ?? '');
    body.append('mode', 'selected');
    Array.from(selectedIds).forEach((id) => body.append('ids[]', String(id)));

    const res = await fetch(actionUrl, {
        method: 'POST',
        body,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'text/html',
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const match = text.match(/<title>(.*?)<\/title>/i);
        throw new Error(match?.[1] ?? `Server error ${res.status}`);
    }
    return res.text();
}

// ---------------------------------------------------------------------------
// Submit native form untuk trigger PDF download
// ---------------------------------------------------------------------------
function submitDownloadForm(
    actionUrl: string,
    selectedIds: Set<number>,
    onDone?: () => void,
) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.style.display = 'none';
    form.enctype = 'multipart/form-data';
    form.target = '_self';

    const addInput = (name: string, value: string) => {
        const el = document.createElement('input');
        el.name = name;
        el.value = value;
        form.appendChild(el);
    };

    addInput('_token', meta?.content ?? '');
    addInput('mode', 'selected');
    Array.from(selectedIds).forEach((id) => addInput('ids[]', String(id)));

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
        try { document.body.removeChild(form); } catch { /* noop */ }
        onDone?.();
    }, 3500);
}

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------
export default function Print({ spareparts, search }: PrintPageProps) {
    const isMobile = useIsMobile();

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchValue, setSearchValue] = useState(search);

    const [previewOpen, setPreviewOpen]     = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [downloading, setDownloading]     = useState(false);
    const blobUrlRef = useRef<string | null>(null);

    const pageIds = useMemo(() => spareparts.data.map((s) => s.id), [spareparts.data]);
    const pageTotal     = spareparts.data.length;
    const allSelected   = pageTotal > 0 && pageIds.every((id) => selectedIds.has(id));
    const someSelected  = pageIds.some((id) => selectedIds.has(id));
    const selectedCount = selectedIds.size;
    const estimatedPages = Math.ceil(selectedCount / LABELS_PER_PAGE);
    const canSubmit = selectedCount > 0;

    // Flash messages
    const flash = (usePage().props as { flash?: { type?: string; message?: string } })?.flash;
    useEffect(() => {
        if (!flash?.message) return;
        const fn = flash.type === 'error' ? toast.error
                 : flash.type === 'warning' ? toast.warning
                 : toast.success;
        fn(flash.message, { duration: 6000 });
    }, [flash]);

    // Cleanup blob URL saat unmount
    useEffect(() => () => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    }, []);

    // ── Selection ──────────────────────────────────────────────────────────
    const toggleSingle = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                if (next.size >= MAX_SELECTED) {
                    toast.warning(`Maksimal ${MAX_SELECTED} item per cetak.`);
                    return prev;
                }
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };

    const togglePageAll = (checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                pageIds.forEach((id) => next.add(id));
                if (next.size > MAX_SELECTED) {
                    toast.warning(`Max ${MAX_SELECTED} item. Hanya ${MAX_SELECTED} pertama yang ditambahkan.`);
                    return new Set(Array.from(next).slice(0, MAX_SELECTED));
                }
            } else {
                pageIds.forEach((id) => next.delete(id));
            }
            return next;
        });
    };

    const resetSelection = () => setSelectedIds(new Set());

    // ── Search ─────────────────────────────────────────────────────────────
    const submitSearch = (e?: FormEvent) => {
        e?.preventDefault();
        const params: Record<string, string> = {};
        if (searchValue.trim()) params.search = searchValue.trim();
        router.get(qrRoutes.print().url, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // ── Buka modal preview ─────────────────────────────────────────────────
    const handleOpenPreview = useCallback(async () => {
        if (!canSubmit) {
            toast.error('Pilih minimal 1 sparepart terlebih dahulu.');
            return;
        }

        setPreviewOpen(true);
        setPreviewLoading(true);

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
            setPreviewBlobUrl(null);
        }

        try {
            const html = await fetchPreviewHtml(qrRoutes.print.preview().url, selectedIds);
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;
            setPreviewBlobUrl(url);
        } catch (err) {
            setPreviewOpen(false);
            toast.error(
                err instanceof Error ? err.message : 'Gagal memuat preview. Coba lagi.',
                { duration: 8000 },
            );
        } finally {
            setPreviewLoading(false);
        }
    }, [canSubmit, selectedIds]);

    // ── Tutup modal ────────────────────────────────────────────────────────
    const handleClosePreview = () => {
        setPreviewOpen(false);
        setTimeout(() => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
                setPreviewBlobUrl(null);
            }
        }, 400);
    };

    // ── Konfirmasi download ────────────────────────────────────────────────
    const handleConfirmDownload = useCallback(() => {
        setDownloading(true);
        submitDownloadForm(qrRoutes.print.generate().url, selectedIds, () => {
            setDownloading(false);
            setPreviewOpen(false);
            toast.success('PDF berhasil di-generate dan sedang diunduh.');
        });
    }, [selectedIds]);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <Head title="Cetak QR Code" />

            <div className="space-y-5 p-3 sm:p-4 md:p-6 pb-[max(6rem,calc(6rem+env(safe-area-inset-bottom)))]">

                {/* Header */}
                <div>
                    <h1 className="flex items-center gap-2 text-base font-semibold text-foreground">
                        <Printer className="size-4 text-muted-foreground shrink-0" />
                        Cetak QR Code
                        {selectedCount > 0 && (
                            <Badge variant="secondary" className="ml-1 text-[11px]">
                                {selectedCount} terpilih
                            </Badge>
                        )}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pilih sparepart, preview label, lalu download PDF. Scan QR diarahkan ke halaman Stock Out.
                    </p>
                </div>

                {/* Action Panel */}
                <Card className="border border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Pencarian &amp; Pilihan
                            </CardTitle>
                            <div className="flex items-center gap-3">
                                {selectedCount > 0 && (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <FileText className="size-3.5 shrink-0" />
                                        <strong className="text-foreground">{selectedCount}</strong> item
                                        · ~<strong className="text-foreground">{estimatedPages}</strong> hal.
                                    </span>
                                )}
                                <Button
                                    type="button"
                                    disabled={!canSubmit}
                                    onClick={handleOpenPreview}
                                    className="h-10 gap-2"
                                >
                                    <Download className="size-4 shrink-0" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-5">
                        {/* Search */}
                        <form onSubmit={submitSearch} className="flex flex-col gap-3 lg:flex-row lg:items-end">
                            <div className="flex-1 space-y-1.5">
                                <Label htmlFor="search" className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Pencarian
                                </Label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Cari material number atau part name…"
                                        className="h-10 pl-9"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="h-10 flex-1 sm:flex-none sm:min-w-24">
                                    Cari
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 flex-1 sm:flex-none sm:min-w-24"
                                    disabled={!searchValue}
                                    onClick={() => {
                                        setSearchValue('');
                                        router.get(qrRoutes.print().url, {}, {
                                            preserveState: true,
                                            preserveScroll: true,
                                            replace: true,
                                        });
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>

                        {/* Status bar */}
                        {selectedCount > 0 ? (
                            <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                    <span>
                                        <strong>{selectedCount}</strong> item dipilih
                                        — estimasi <strong>{estimatedPages}</strong> halaman A4
                                        ({LABELS_PER_PAGE} label/hal.)
                                    </span>
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetSelection}
                                    className="h-8 text-xs"
                                >
                                    Bersihkan pilihan
                                </Button>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Centang sparepart di bawah untuk dipilih. Maksimal {MAX_SELECTED} item per cetak.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Daftar Sparepart */}
                <Card className="border border-border/70 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        {spareparts.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                                <Package2 className="size-9 text-muted-foreground/60" />
                                <p className="text-base font-semibold">Tidak ada sparepart</p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Coba ubah pencarian untuk melihat data lainnya.
                                </p>
                            </div>
                        ) : isMobile ? (
                            <div className="p-3 space-y-2">
                                {spareparts.data.map((s) => (
                                    <label
                                        key={s.id}
                                        className={
                                            'flex gap-3 cursor-pointer rounded-xl border bg-card p-4 transition-colors ' +
                                            (selectedIds.has(s.id)
                                                ? 'border-primary/40 bg-primary/5'
                                                : 'border-border/60')
                                        }
                                    >
                                        <Checkbox
                                            checked={selectedIds.has(s.id)}
                                            onCheckedChange={(c) => toggleSingle(s.id, Boolean(c))}
                                            className="mt-0.5 size-5 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="break-all font-mono text-sm font-bold text-primary">
                                                    {s.material_number}
                                                </span>
                                                {s.rank && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        Rank {s.rank}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="line-clamp-2 text-sm font-medium">{s.part_name}</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                                                {s.brand?.name && <span>{s.brand.name}</span>}
                                                {s.category?.name && <span>{s.category.name}</span>}
                                                {s.bin && <span className="font-mono">📍 {getBinLocationLabel(s.bin)}</span>}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                                            <th className="w-12 px-4 py-3">
                                                <Checkbox
                                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                                    onCheckedChange={(c) => togglePageAll(Boolean(c))}
                                                    aria-label="Pilih semua di halaman ini"
                                                />
                                            </th>
                                            {['Material Number', 'Part Name', 'Rank', 'Brand', 'Category', 'Lokasi'].map((h) => (
                                                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {spareparts.data.map((s, i) => (
                                            <tr
                                                key={s.id}
                                                className={
                                                    'cursor-pointer transition-colors hover:bg-muted/25 ' +
                                                    (selectedIds.has(s.id) ? 'bg-primary/5' : i % 2 === 1 ? 'bg-muted/5' : '')
                                                }
                                                onClick={() => toggleSingle(s.id, !selectedIds.has(s.id))}
                                            >
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedIds.has(s.id)}
                                                        onCheckedChange={(c) => toggleSingle(s.id, Boolean(c))}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-mono text-sm font-bold text-primary break-all">
                                                    {s.material_number}
                                                </td>
                                                <td className="px-4 py-3 font-medium">{s.part_name}</td>
                                                <td className="px-4 py-3">
                                                    {s.rank
                                                        ? <Badge variant="outline" className="text-[10px]">{s.rank}</Badge>
                                                        : <span className="text-xs text-muted-foreground">-</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{s.brand?.name ?? '-'}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{s.category?.name ?? '-'}</td>
                                                <td className="px-4 py-3 font-mono text-xs">
                                                    {s.bin ? getBinLocationLabel(s.bin) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Pagination meta={spareparts} />
            </div>

            {/* Preview Modal */}
            <Dialog open={previewOpen} onOpenChange={(open) => { if (!open) handleClosePreview(); }}>
                <DialogContent className="flex h-[92dvh] max-h-[92dvh] w-full max-w-5xl flex-col gap-0 p-0 overflow-hidden">
                    <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <FileText className="size-4 text-muted-foreground" />
                            Preview Label QR Code
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {selectedCount} sparepart · estimasi {estimatedPages} halaman A4
                            — Pastikan tampilan sudah sesuai sebelum download PDF.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative min-h-0 flex-1 bg-muted/20">
                        {previewLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <Loader2 className="size-8 animate-spin" />
                                <p className="text-sm">Memuat preview…</p>
                            </div>
                        ) : previewBlobUrl ? (
                            <iframe
                                src={previewBlobUrl}
                                className="size-full border-0"
                                title="Preview Label QR Code"
                                sandbox="allow-same-origin"
                            />
                        ) : null}
                    </div>

                    <DialogFooter className="shrink-0 border-t border-border/60 bg-background px-5 py-3 sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClosePreview}
                            disabled={downloading}
                            className="gap-2"
                        >
                            <X className="size-4" />
                            Tutup
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmDownload}
                            disabled={downloading || previewLoading}
                            className="gap-2"
                        >
                            {downloading ? (
                                <><Loader2 className="size-4 animate-spin" />Mengunduh PDF…</>
                            ) : (
                                <><Download className="size-4" />Konfirmasi &amp; Download PDF</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Print.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cetak QR Code', href: '/qr-codes/print' },
    ],
};
