import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    FileText,
    Loader2,
    MapPin,
    Package2,
    Printer,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { SortableHeader, type SortDir } from '@/components/ui/sortable-header';
import { Pagination } from '@/components/pagination';
import type { FilterValues } from '@/components/features/spareparts/spareparts-filters';
import { SparepartFilters } from '@/components/features/spareparts/spareparts-filters';
import { useIsMobile } from '@/hooks/use-mobile';
import { getBinLocationLabel } from '@/components/features/spareparts/spareparts-utils';
import qrRoutes from '@/routes/qr';
import type { Brand, Category, PaginatedResponse, Sparepart } from '@/types';

interface PrintPageProps {
    spareparts: PaginatedResponse<Sparepart>;
    search: string;
    sort: string;
    dir: SortDir;
    filters: { brand_id?: string; category_id?: string; rank?: string; status?: string };
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    ranks: string[];
    statuses: string[];
}

const LABELS_PER_PAGE = 14;
const MAX_SELECTED    = 60;

// ---------------------------------------------------------------------------
async function fetchPreviewHtml(actionUrl: string, selectedIds: Set<number>): Promise<string> {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    const body = new FormData();
    body.append('_token', meta?.content ?? '');
    body.append('mode', 'selected');
    Array.from(selectedIds).forEach((id) => body.append('ids[]', String(id)));
    const res = await fetch(actionUrl, {
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

function submitDownloadForm(actionUrl: string, selectedIds: Set<number>, onDone?: () => void) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    const form = document.createElement('form');
    form.method = 'POST'; form.action = actionUrl;
    form.style.display = 'none'; form.enctype = 'multipart/form-data'; form.target = '_self';
    const add = (name: string, value: string) => {
        const el = document.createElement('input'); el.name = name; el.value = value; form.appendChild(el);
    };
    add('_token', meta?.content ?? ''); add('mode', 'selected');
    Array.from(selectedIds).forEach((id) => add('ids[]', String(id)));
    document.body.appendChild(form); form.submit();
    setTimeout(() => { try { document.body.removeChild(form); } catch { /**/ } onDone?.(); }, 3500);
}

function buildQuery(values: FilterValues, sort: string, dir: SortDir) {
    return {
        ...(values.search ? { search: values.search.trim() } : {}),
        ...(values.brandId    && values.brandId    !== 'all' ? { brand_id:    values.brandId    } : {}),
        ...(values.categoryId && values.categoryId !== 'all' ? { category_id: values.categoryId } : {}),
        ...(values.rank       && values.rank       !== 'all' ? { rank:        values.rank       } : {}),
        ...(values.status     && values.status     !== 'all' ? { status:      values.status     } : {}),
        ...(sort !== 'created_at' ? { sort } : {}),
        ...(dir  !== 'desc'       ? { dir  } : {}),
    };
}

// ---------------------------------------------------------------------------
export default function Print({ spareparts, search, sort, dir, filters, brands, categories, ranks, statuses }: PrintPageProps) {
    const isMobile = useIsMobile();

    const [selectedIds, setSelectedIds]       = useState<Set<number>>(new Set());
    const [previewOpen, setPreviewOpen]       = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [downloading, setDownloading]       = useState(false);
    const blobUrlRef = useRef<string | null>(null);

    // Filter state — sama persis dengan spareparts/index.tsx
    const [filterValues, setFilterValues] = useState<FilterValues>({
        search:     search                ?? '',
        brandId:    filters.brand_id      ?? 'all',
        categoryId: filters.category_id   ?? 'all',
        rank:       filters.rank          ?? 'all',
        status:     filters.status        ?? 'all',
    });

    const hasFilters = Boolean(
        filterValues.search ||
        filterValues.brandId    !== 'all' ||
        filterValues.categoryId !== 'all' ||
        filterValues.rank       !== 'all' ||
        filterValues.status     !== 'all',
    );

    const pageIds      = useMemo(() => spareparts.data.map((s) => s.id), [spareparts.data]);
    const pageTotal    = spareparts.data.length;
    const allSelected  = pageTotal > 0 && pageIds.every((id) => selectedIds.has(id));
    const someSelected = pageIds.some((id) => selectedIds.has(id));
    const selectedCount  = selectedIds.size;
    const estimatedPages = Math.ceil(selectedCount / LABELS_PER_PAGE);
    const canSubmit = selectedCount > 0;

    const flash = (usePage().props as { flash?: { type?: string; message?: string } })?.flash;
    useEffect(() => {
        if (!flash?.message) return;
        const fn = flash.type === 'error' ? toast.error : flash.type === 'warning' ? toast.warning : toast.success;
        fn(flash.message, { duration: 6000 });
    }, [flash]);

    useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

    // ── Selection ──────────────────────────────────────────────────────────
    const toggleSingle = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                if (next.size >= MAX_SELECTED) { toast.warning(`Maksimal ${MAX_SELECTED} item per cetak.`); return prev; }
                next.add(id);
            } else { next.delete(id); }
            return next;
        });
    };

    const togglePageAll = (checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                pageIds.forEach((id) => next.add(id));
                if (next.size > MAX_SELECTED) {
                    toast.warning(`Max ${MAX_SELECTED} item.`);
                    return new Set(Array.from(next).slice(0, MAX_SELECTED));
                }
            } else { pageIds.forEach((id) => next.delete(id)); }
            return next;
        });
    };

    const resetSelection = () => setSelectedIds(new Set());

    // ── Filter handlers — sama persis dengan spareparts/index.tsx ──────────
    const handleFilterChange = (field: keyof FilterValues, value: string) => {
        setFilterValues((prev) => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        router.get(qrRoutes.print().url, buildQuery(filterValues, sort, dir), {
            preserveScroll: true, replace: true,
        });
    };

    const resetFilters = () => {
        setFilterValues({ search: '', brandId: 'all', categoryId: 'all', rank: 'all', status: 'all' });
        router.get(qrRoutes.print().url, {}, { preserveScroll: true, replace: true });
    };

    // ── Sort ───────────────────────────────────────────────────────────────
    const handleSort = useCallback((column: string, newDir: SortDir) => {
        router.get(qrRoutes.print().url, buildQuery(filterValues, column, newDir), {
            preserveScroll: true, replace: true,
        });
    }, [filterValues]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Preview modal ──────────────────────────────────────────────────────
    const handleOpenPreview = useCallback(async () => {
        if (!canSubmit) { toast.error('Pilih minimal 1 sparepart terlebih dahulu.'); return; }
        setPreviewOpen(true); setPreviewLoading(true);
        if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; setPreviewBlobUrl(null); }
        try {
            const html = await fetchPreviewHtml(qrRoutes.print.preview().url, selectedIds);
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url; setPreviewBlobUrl(url);
        } catch (err) {
            setPreviewOpen(false);
            toast.error(err instanceof Error ? err.message : 'Gagal memuat preview.', { duration: 8000 });
        } finally { setPreviewLoading(false); }
    }, [canSubmit, selectedIds]);

    const handleClosePreview = () => {
        setPreviewOpen(false);
        setTimeout(() => {
            if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; setPreviewBlobUrl(null); }
        }, 400);
    };

    const handleConfirmDownload = useCallback(() => {
        setDownloading(true);
        submitDownloadForm(qrRoutes.print.generate().url, selectedIds, () => {
            setDownloading(false); setPreviewOpen(false);
            toast.success('PDF berhasil di-generate dan sedang diunduh.');
        });
    }, [selectedIds]);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <Head title="Cetak QR Code" />

            <div className="space-y-6 p-3 sm:p-4 md:p-6 pb-[max(7rem,calc(7rem+env(safe-area-inset-bottom)))]">

                {/* ── Card utama: header + filter + list ── */}
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">

                    {/* Header — sama strukturnya dengan spareparts/index */}
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Printer className="size-4 text-muted-foreground shrink-0" />
                                Cetak QR Code
                                {selectedCount > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-[11px]">
                                        {selectedCount} terpilih
                                    </Badge>
                                )}
                            </CardTitle>
                            {!isMobile && (
                                <Button type="button" disabled={!canSubmit} onClick={handleOpenPreview} className="hidden gap-2 shadow-sm lg:flex">
                                    <Download className="size-4 shrink-0" />
                                    Download PDF
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    {/* Filter — pakai SparepartFilters yang sama */}
                    <CardContent className="border-b border-border/60 bg-background p-4 md:p-6">
                        <SparepartFilters
                            values={filterValues}
                            onChange={handleFilterChange}
                            brands={brands}
                            categories={categories}
                            ranks={ranks}
                            statuses={statuses}
                            onApply={applyFilters}
                            onReset={resetFilters}
                            hasFilters={hasFilters}
                            sort={sort}
                            dir={dir}
                            onSortChange={handleSort}
                        />
                    </CardContent>

                    {/* Status bar pilihan */}
                    {selectedCount > 0 && (
                        <CardContent className="border-b border-border/60 bg-primary/5 py-2.5 px-4">
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-xs">
                                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                                    <strong>{selectedCount}</strong> item dipilih
                                </span>
                                <Button type="button" variant="ghost" size="sm" onClick={resetSelection} className="h-7 text-xs px-2">
                                    Bersihkan
                                </Button>
                            </div>
                        </CardContent>
                    )}

                    {/* List sparepart */}
                    <CardContent className="p-0">
                        {spareparts.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                                <Package2 className="size-9 text-muted-foreground/60" />
                                <p className="text-base font-semibold">Tidak ada sparepart</p>
                                <p className="text-sm text-muted-foreground">Coba ubah pencarian atau filter.</p>
                                {hasFilters && (
                                    <Button variant="outline" size="sm" onClick={resetFilters}>Reset filter</Button>
                                )}
                            </div>
                        ) : isMobile ? (
                            /* Mobile — card list */
                            <div className="divide-y divide-border/50">
                                {/* Baris pilih semua halaman ini — konsisten dengan desktop */}
                                <div className="flex items-center gap-3 bg-muted/30 px-4 py-2.5">
                                    <Checkbox
                                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                        onCheckedChange={(c) => togglePageAll(Boolean(c))}
                                        className="size-5 shrink-0"
                                        aria-label="Pilih semua di halaman ini"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        Pilih semua di halaman ini
                                    </span>
                                </div>                                {spareparts.data.map((s) => {
                                    const selected = selectedIds.has(s.id);
                                    return (
                                        <label key={s.id}
                                            className={[
                                                'flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors',
                                                selected ? 'bg-primary/5' : 'hover:bg-muted/20',
                                            ].join(' ')}
                                        >
                                            <Checkbox
                                                checked={selected}
                                                onCheckedChange={(c) => toggleSingle(s.id, Boolean(c))}
                                                className="mt-0.5 size-5 shrink-0"
                                            />
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-bold text-primary">{s.material_number}</span>
                                                    {s.rank && <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{s.rank}</Badge>}
                                                </div>
                                                <p className="text-sm font-medium leading-snug text-foreground">{s.part_name}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                    {s.brand?.name && <span>{s.brand.name}</span>}
                                                    {s.category?.name && (<><span className="opacity-40">·</span><span>{s.category.name}</span></>)}
                                                    {s.bin && (
                                                        <><span className="opacity-40">·</span>
                                                        <span className="flex items-center gap-1 font-mono">
                                                            <MapPin className="size-3 shrink-0" />{getBinLocationLabel(s.bin)}
                                                        </span></>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Desktop — tabel */
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
                                            <SortableHeader column="material_number" currentSort={sort} currentDir={dir} onSort={handleSort} className="text-left">Material Number</SortableHeader>
                                            <SortableHeader column="part_name" currentSort={sort} currentDir={dir} onSort={handleSort} className="text-left">Part Name</SortableHeader>
                                            <SortableHeader column="rank" currentSort={sort} currentDir={dir} onSort={handleSort} className="text-left">Rank</SortableHeader>
                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Brand</th>
                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Category</th>
                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Lokasi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {spareparts.data.map((s, i) => (
                                            <tr key={s.id}
                                                className={'cursor-pointer transition-colors hover:bg-muted/25 ' + (selectedIds.has(s.id) ? 'bg-primary/5' : i % 2 === 1 ? 'bg-muted/5' : '')}
                                                onClick={() => toggleSingle(s.id, !selectedIds.has(s.id))}
                                            >
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox checked={selectedIds.has(s.id)} onCheckedChange={(c) => toggleSingle(s.id, Boolean(c))} />
                                                </td>
                                                <td className="break-all px-4 py-3 font-mono text-sm font-bold text-primary">{s.material_number}</td>
                                                <td className="px-4 py-3 font-medium">{s.part_name}</td>
                                                <td className="px-4 py-3">
                                                    {s.rank ? <Badge variant="outline" className="text-[10px]">{s.rank}</Badge> : <span className="text-xs text-muted-foreground">-</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{s.brand?.name ?? '-'}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{s.category?.name ?? '-'}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{s.bin ? getBinLocationLabel(s.bin) : '-'}</td>
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

            {/* Sticky Download Button — mobile only */}
            {isMobile && canSubmit && (
                <div className="fixed bottom-16 left-0 right-0 z-40 px-4 md:hidden"
                    style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
                    <Button type="button" onClick={handleOpenPreview} className="h-12 w-full gap-2 shadow-lg" size="lg">
                        <Download className="size-5 shrink-0" />
                        Download PDF · {selectedCount} item
                    </Button>
                </div>
            )}

            {/* Preview Modal */}
            <Dialog open={previewOpen} onOpenChange={(open) => { if (!open) handleClosePreview(); }}>
                <DialogContent className="flex h-[92dvh] max-h-[92dvh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0">
                    <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <FileText className="size-4 text-muted-foreground" />
                            Preview Label QR Code
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {selectedCount} sparepart · estimasi {estimatedPages} halaman A4
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative min-h-0 flex-1 bg-muted/20">
                        {previewLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <Loader2 className="size-8 animate-spin" />
                                <p className="text-sm">Memuat preview…</p>
                            </div>
                        ) : previewBlobUrl ? (
                            <iframe src={previewBlobUrl} className="size-full border-0" title="Preview Label QR Code" sandbox="allow-same-origin" />
                        ) : null}
                    </div>

                    <DialogFooter className="shrink-0 border-t border-border/60 bg-background px-5 py-3 sm:justify-between">
                        <Button type="button" variant="outline" onClick={handleClosePreview} disabled={downloading} className="gap-2">
                            <X className="size-4" />Tutup
                        </Button>
                        <Button type="button" onClick={handleConfirmDownload} disabled={downloading || previewLoading} className="gap-2">
                            {downloading
                                ? <><Loader2 className="size-4 animate-spin" />Mengunduh…</>
                                : <><Download className="size-4" />Konfirmasi &amp; Download PDF</>
                            }
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
