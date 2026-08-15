import { Head, router, usePage } from '@inertiajs/react';
import { Download, Search, Printer, CheckCircle2, AlertTriangle, Package2, Eye } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/pagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { getBinLocationLabel } from '@/components/features/spareparts/spareparts-utils';
import qrRoutes from '@/routes/qr';
import type { PaginatedResponse, Sparepart } from '@/types';

type Mode = 'selected' | 'all';

interface PrintPageProps {
    spareparts: PaginatedResponse<Sparepart>;
    search: string;
}

const MAX_SELECTED = 200;

export default function Print({ spareparts, search }: PrintPageProps) {
    const isMobile = useIsMobile();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [mode, setMode] = useState<Mode>('selected');
    const [searchValue, setSearchValue] = useState(search);
    const [submitting, setSubmitting] = useState(false);
    const pageTotal = spareparts.data.length;
    const pageIds = useMemo(
        () => spareparts.data.map((s) => s.id),
        [spareparts.data],
    );
    const allCurrentSelected =
        pageTotal > 0 && pageIds.every((id) => selectedIds.has(id));
    const someCurrentSelected = pageIds.some((id) => selectedIds.has(id));

    const flash = (usePage().props as { flash?: { type?: string; message?: string } })
        ?.flash;
    useEffect(() => {
        if (!flash?.message) return;
        const toastFn =
            flash.type === 'error'
                ? toast.error
                : flash.type === 'warning'
                    ? toast.warning
                    : toast.success;
        toastFn(flash.message, { duration: 6000 });
    }, [flash]);

    const togglePageAll = (checked: boolean) => {
        const next = new Set(selectedIds);
        if (checked) {
            pageIds.forEach((id) => next.add(id));
            if (next.size > MAX_SELECTED) {
                toast.warning(
                    `Max ${MAX_SELECTED} items allowed for Selected mode. Only first ${MAX_SELECTED} were added.`,
                );
                const arr = Array.from(next).slice(0, MAX_SELECTED);
                setSelectedIds(new Set(arr));
                return;
            }
        } else {
            pageIds.forEach((id) => next.delete(id));
        }
        setSelectedIds(next);
    };

    const toggleSingle = (id: number, checked: boolean) => {
        const next = new Set(selectedIds);
        if (checked) {
            if (next.size >= MAX_SELECTED) {
                toast.warning(
                    `Maximum ${MAX_SELECTED} items can be selected per print. Remove some first or use "Print All" mode.`,
                );
                return;
            }
            next.add(id);
        } else {
            next.delete(id);
        }
        setSelectedIds(next);
    };

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

    const resetSelection = () => setSelectedIds(new Set());

    const submitFormByMode = useCallback(
        (actionUrl: string, openInNewTab = false) => {
            if (mode === 'selected' && selectedIds.size === 0) {
                toast.error('Pilih minimal 1 sparepart terlebih dahulu.');
                return;
            }

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = actionUrl;
            form.style.display = 'none';
            form.enctype = 'multipart/form-data';
            form.target = openInNewTab ? '_blank' : '_self';

            const csrfEl = document.createElement('input');
            csrfEl.name = '_token';
            const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            if (meta) csrfEl.value = meta.content;
            form.appendChild(csrfEl);

            const modeEl = document.createElement('input');
            modeEl.name = 'mode';
            modeEl.value = mode;
            form.appendChild(modeEl);

            if (mode === 'selected') {
                Array.from(selectedIds).forEach((id) => {
                    const inp = document.createElement('input');
                    inp.name = 'ids[]';
                    inp.value = String(id);
                    form.appendChild(inp);
                });
            }

            document.body.appendChild(form);
            if (!openInNewTab) {
                setSubmitting(true);
                setTimeout(() => {
                    try { document.body.removeChild(form); } catch {}
                    setSubmitting(false);
                }, 3000);
            } else {
                setTimeout(() => {
                    try { document.body.removeChild(form); } catch {}
                }, 500);
            }
            form.submit();
        },
        [mode, selectedIds],
    );

    const handleGenerate = useCallback(
        (event: FormEvent) => {
            event.preventDefault();
            submitFormByMode(qrRoutes.print.generate().url, false);
        },
        [submitFormByMode],
    );

    const handlePreview = useCallback(
        (event: FormEvent) => {
            event.preventDefault();
            submitFormByMode(qrRoutes.print.preview().url, true);
        },
        [submitFormByMode],
    );

    const selectedCount = selectedIds.size;
    const estimatedPages =
        mode === 'all'
            ? Math.ceil((spareparts.total ?? 0) / 6)
            : Math.ceil(selectedCount / 6);
    const disabledGenerate =
        submitting || (mode === 'selected' && selectedCount === 0);

    return (
        <>
            <Head title="Cetak QR Code Massal" />
            <div className="space-y-5 p-3 sm:p-4 md:p-6 pb-[max(6rem,calc(6rem+env(safe-area-inset-bottom)))]">
                {/* Header */}
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-base font-semibold text-foreground">
                            <Printer className="size-4 text-muted-foreground shrink-0" />
                            Cetak QR Code
                            {selectedCount > 0 && mode === 'selected' ? (
                                <Badge variant="secondary" className="ml-1 text-[11px]">
                                    {selectedCount} terpilih
                                </Badge>
                            ) : null}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pilih sparepart untuk cetak label QR code (6 per halaman A4). Scan QR akan langsung diarahkan ke halaman Stock Out.
                        </p>
                    </div>
                </div>

                {/* Action Panel + Mode + Search */}
                <Card className="border border-border/70 shadow-sm">
                    <CardHeader className="flex flex-col gap-3 border-b border-border/60 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-4">
                        <CardTitle className="text-sm font-semibold text-foreground">
                            Mode cetak &amp; Pencarian
                        </CardTitle>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end w-full">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:mr-auto">
                                {estimatedPages > 0 ? (
                                    <>
                                        <Package2 className="size-3.5 shrink-0" />
                                        <span>
                                            Estimasi <strong className="text-foreground">{estimatedPages}</strong> halaman
                                        </span>
                                    </>
                                ) : null}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePreview}
                                disabled={disabledGenerate}
                                className="h-11 w-full sm:h-10 sm:w-auto gap-2"
                            >
                                <Eye className="size-4 shrink-0" />
                                Preview HTML (Review)
                            </Button>
                            <Button
                                type="button"
                                onClick={handleGenerate}
                                disabled={disabledGenerate}
                                className="h-11 w-full sm:h-10 sm:w-auto gap-2"
                            >
                                <Download className="size-4 shrink-0" />
                                {submitting ? 'Generating PDF...' : 'Generate & Download PDF'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-5">
                        <form
                            onSubmit={submitSearch}
                            className="flex flex-col gap-3 lg:flex-row lg:items-end"
                        >
                            <div className="flex-1 space-y-1.5 w-full">
                                <Label htmlFor="search" className="uppercase text-xs tracking-wide text-muted-foreground sm:block">
                                    Pencarian
                                </Label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Cari material number atau part name..."
                                        className="h-11 pl-9 w-full sm:h-10"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pb-0 lg:pb-0 lg:flex lg:flex-row lg:items-end lg:gap-2">
                                <Button
                                    type="submit"
                                    className="h-11 col-span-1 sm:h-10 sm:min-w-24"
                                >
                                    Apply
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 col-span-1 sm:h-10 sm:min-w-24"
                                    onClick={() => {
                                        setSearchValue('');
                                        router.get(
                                            qrRoutes.print().url,
                                            {},
                                            { preserveState: true, preserveScroll: true, replace: true },
                                        );
                                    }}
                                    disabled={!searchValue}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>

                        <form id="print-qr-form" onSubmit={handleGenerate} className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setMode('selected')}
                                    className={
                                        'flex items-start gap-3 rounded-lg border text-left p-4 transition-all ' +
                                        (mode === 'selected'
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/40 hover:bg-primary/10'
                                            : 'border-border/70 bg-muted/15 hover:bg-muted/30')
                                    }
                                >
                                    <CheckCircle2
                                        className={
                                            'mt-0.5 size-4 shrink-0 ' +
                                            (mode === 'selected'
                                                ? 'text-primary'
                                                : 'text-muted-foreground')
                                        }
                                    />
                                    <div className="space-y-1 flex-1">
                                        <p className="text-sm font-semibold">
                                            Cetak pilihan saya{' '}
                                            <Badge
                                                variant={selectedCount > 0 ? 'default' : 'outline'}
                                                className="ml-1 text-[10px]"
                                            >
                                                {selectedCount}/{MAX_SELECTED}
                                            </Badge>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Pilih secara manual sparepart mana saja yang mau dicetak. Maksimal 200 item per cetak (34 halaman).
                                        </p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('all')}
                                    className={
                                        'flex items-start gap-3 rounded-lg border text-left p-4 transition-all ' +
                                        (mode === 'all'
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/40 hover:bg-primary/10'
                                            : 'border-border/70 bg-muted/15 hover:bg-muted/30')
                                    }
                                >
                                    <AlertTriangle
                                        className={
                                            'mt-0.5 size-4 shrink-0 ' +
                                            (mode === 'all'
                                                ? 'text-amber-500'
                                                : 'text-muted-foreground')
                                        }
                                    />
                                    <div className="space-y-1 flex-1">
                                        <p className="text-sm font-semibold">
                                            Cetak SEMUA sparepart
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Cetak seluruh sparepart yang sesuai filter. Total ~{spareparts.total ?? 0} item (max 500).
                                        </p>
                                    </div>
                                </button>
                            </div>

                            {/* Reset Selection Button (only if Selected > 0) */}
                            {selectedCount > 0 && mode === 'selected' ? (
                                <div className="flex flex-col items-center justify-between gap-2 rounded-md bg-primary/5 px-3 py-2.5 text-sm text-foreground border border-primary/20 sm:flex-row">
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                                        <span>
                                            <strong>{selectedCount}</strong> item siap dicetak (~
                                            {estimatedPages} halaman A4, 6 per halaman).
                                        </span>
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetSelection}
                                        className="h-9 text-xs px-3"
                                    >
                                        Bersihkan pilihan
                                    </Button>
                                </div>
                            ) : null}
                        </form>
                    </CardContent>
                </Card>

                {/* Table / Card List Spareparts */}
                <Card className="border border-border/70 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        {spareparts.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                                <Package2 className="size-9 text-muted-foreground/60" />
                                <p className="text-base font-semibold">Tidak ada sparepart</p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Coba ubah pencarian atau hapus filter untuk melihat data lainnya.
                                </p>
                            </div>
                        ) : isMobile ? (
                            /* Mobile Card View */
                            <div className="divide-y divide-border/60 p-3">
                                {spareparts.data.map((s) => (
                                    <div
                                        key={s.id}
                                        className="mb-3 rounded-xl border border-border/60 bg-card p-4"
                                    >
                                        <label className="flex gap-3 cursor-pointer">
                                            <div className="pt-1">
                                                <Checkbox
                                                    checked={selectedIds.has(s.id)}
                                                    onCheckedChange={(c) =>
                                                        toggleSingle(s.id, Boolean(c))
                                                    }
                                                    className="size-5 mt-0.5"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono font-bold text-sm text-primary break-all">
                                                        {s.material_number}
                                                    </span>
                                                    {s.rank ? (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            Rank {s.rank}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                <p className="text-sm font-medium line-clamp-2">
                                                    {s.part_name}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
                                                    {s.brand?.name ? (
                                                        <span>Brand: <span className="font-medium text-foreground">{s.brand.name}</span></span>
                                                    ) : null}
                                                    {s.bin ? (
                                                        <span className="font-mono">📍 {getBinLocationLabel(s.bin)}</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Desktop Table View */
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                                            <th className="w-12 px-4 py-3">
                                                <Checkbox
                                                    checked={
                                                        allCurrentSelected
                                                            ? true
                                                            : someCurrentSelected
                                                                ? 'indeterminate'
                                                                : false
                                                    }
                                                    onCheckedChange={(c) =>
                                                        togglePageAll(Boolean(c))
                                                    }
                                                    aria-label="Select all"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide font-semibold">
                                                Material Number
                                            </th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide font-semibold">
                                                Part Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide font-semibold">
                                                Rank
                                            </th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide font-semibold">
                                                Brand
                                            </th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide font-semibold">
                                                Category
                                            </th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide font-semibold">
                                                Lokasi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {spareparts.data.map((s, i) => (
                                            <tr
                                                key={s.id}
                                                className={
                                                    'transition-colors hover:bg-muted/25 ' +
                                                    (i % 2 === 1 ? 'bg-muted/5' : '')
                                                }
                                            >
                                                <td className="px-4 py-3 align-top">
                                                    <label className="flex cursor-pointer items-center justify-center h-full min-h-5">
                                                        <Checkbox
                                                            checked={selectedIds.has(s.id)}
                                                            onCheckedChange={(c) =>
                                                                toggleSingle(s.id, Boolean(c))
                                                            }
                                                        />
                                                    </label>
                                                </td>
                                                <td className="px-4 py-3 align-top font-mono font-bold text-primary break-all">
                                                    {s.material_number}
                                                </td>
                                                <td className="px-4 py-3 align-top line-clamp-2 font-medium">
                                                    {s.part_name}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    {s.rank ? (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {s.rank}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 align-top text-muted-foreground text-xs">
                                                    {s.brand?.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 align-top text-muted-foreground text-xs">
                                                    {s.category?.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 align-top font-mono text-xs">
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

                {/* Pagination */}
                <Pagination meta={spareparts} />
            </div>
        </>
    );
}

Print.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Cetak QR Code',
            href: '/qr-codes/print',
        },
    ],
};
