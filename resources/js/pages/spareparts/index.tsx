import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileSpreadsheet, Loader2, Plus, Warehouse } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import type { FilterValues } from '@/components/features/spareparts/spareparts-filters';
import { SparepartFilters } from '@/components/features/spareparts/spareparts-filters';
import { SparepartsMobileList } from '@/components/features/spareparts/spareparts-mobile-list';
import { SparepartsTable } from '@/components/features/spareparts/spareparts-table';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SortDir } from '@/components/ui/sortable-header';
import { useIsMobile } from '@/hooks/use-mobile';
import spareparts from '@/routes/spareparts';
import type { Brand, Category, PaginatedResponse, Sparepart } from '@/types';

interface Props {
    spareparts: PaginatedResponse<Sparepart>;
    filters: {
        search?: string | null;
        brand_id?: string | null;
        category_id?: string | null;
        rank?: string | null;
        status?: string | null;
    };
    sort: string;
    dir: SortDir;
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    ranks: string[];
    statuses: string[];
}

function buildQuery(values: FilterValues, sort: string, dir: SortDir) {
    return {
        ...(values.search ? { search: values.search.trim() } : {}),
        ...(values.brandId && values.brandId !== 'all' ? { brand_id: values.brandId } : {}),
        ...(values.categoryId && values.categoryId !== 'all' ? { category_id: values.categoryId } : {}),
        ...(values.rank && values.rank !== 'all' ? { rank: values.rank } : {}),
        ...(values.status && values.status !== 'all' ? { status: values.status } : {}),
        ...(sort !== 'created_at' ? { sort } : {}),
        ...(dir !== 'desc' ? { dir } : {}),
    };
}

export default function Index({
    spareparts: response,
    filters,
    sort,
    dir,
    brands,
    categories,
    ranks,
    statuses,
}: Props) {
    const { auth } = usePage().props;
    const isAdmin  = auth.user?.role === 'admin';
    const isMobile = useIsMobile();

    const [filterValues, setFilterValues] = useState<FilterValues>({
        search: filters.search ?? '',
        brandId: filters.brand_id ?? 'all',
        categoryId: filters.category_id ?? 'all',
        rank: filters.rank ?? 'all',
        status: filters.status ?? 'all',
    });

    // Export Modal States (Admin only)
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [docNo, setDocNo] = useState('VI-MT-QP01-001-F02');
    const [revision, setRevision] = useState('V1.1');

    const rows = response.data;
    const hasFilters = Boolean(
        filterValues.search ||
        filterValues.brandId !== 'all' ||
        filterValues.categoryId !== 'all' ||
        filterValues.rank !== 'all' ||
        filterValues.status !== 'all'
    );

    const handleFilterChange = (field: keyof FilterValues, value: string) => {
        setFilterValues((prev) => ({ ...prev, [field]: value }));
    };

    function applyFilters(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        router.get(spareparts.index().url, buildQuery(filterValues, sort, dir), {
            preserveScroll: true,
            replace: true,
        });
    }

    function resetFilters() {
        setFilterValues({
            search: '',
            brandId: 'all',
            categoryId: 'all',
            rank: 'all',
            status: 'all',
        });
        router.get(spareparts.index().url, {}, {
            preserveScroll: true,
            replace: true,
        });
    }

    const handleSort = useCallback((column: string, newDir: SortDir) => {
        router.get(spareparts.index().url, buildQuery(filterValues, column, newDir), {
            preserveScroll: true,
            replace: true,
        });
    }, [filterValues]);

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsExporting(true);
        const toastId = toast.loading('Menyiapkan file Excel...');

        try {
            const params = new URLSearchParams();
            if (docNo.trim()) params.append('doc_no', docNo.trim());
            if (revision.trim()) params.append('revision', revision.trim());

            const response = await fetch(`/spareparts/export/master-list?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Gagal mengunduh file export.');
            }

            // Dapatkan nama file dari header jika ada
            const disposition = response.headers.get('content-disposition');
            let filename = `Warehouse Management System_A23_${new Date().toISOString().split('T')[0]}.xlsx`;
            if (disposition && disposition.includes('filename=')) {
                const matches = disposition.match(/filename="?([^"]+)"?/);
                if (matches && matches[1]) {
                    filename = matches[1];
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('File Excel berhasil diunduh.', { id: toastId });
            setIsExportDialogOpen(false);
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengekspor data.', { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <Head title="Spareparts Master" />

            <div className="space-y-6 p-3 sm:p-4 md:p-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <Warehouse className="size-4 text-muted-foreground" />
                                    Sparepart list
                                </CardTitle>
                            </div>
                            {isAdmin && (
                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2 shadow-sm"
                                        onClick={() => setIsExportDialogOpen(true)}
                                    >
                                        <FileSpreadsheet className="size-4 shrink-0 text-emerald-600" />
                                        Export Excel
                                    </Button>
                                    <Button asChild className="gap-2 shadow-sm">
                                        <Link href={spareparts.create()}>
                                            <Plus className="size-4" />
                                            Add sparepart
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>

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

                    <CardContent className="p-0">
                        {rows.length > 0 ? (
                            isMobile ? (
                                <SparepartsMobileList rows={rows} />
                            ) : (
                                <SparepartsTable rows={rows} sort={sort} dir={dir} onSort={handleSort} />
                            )
                        ) : (
                            <div className="flex min-h-72 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                                <p className="text-base font-semibold text-foreground">
                                    No sparepart found
                                </p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Coba ubah kata kunci pencarian atau hapus filter untuk melihat data lainnya.
                                </p>
                                {hasFilters && (
                                    <Button variant="outline" onClick={resetFilters}>
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Pagination meta={response} />
            </div>

            {isAdmin && (
                <FloatingActionButton
                    href={spareparts.create().url}
                    label="Add sparepart"
                />
            )}

            {/* Export Dialog (Admin only) */}
            {isAdmin && (
                <Dialog open={isExportDialogOpen} onOpenChange={(open) => !isExporting && setIsExportDialogOpen(open)}>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleExport}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg">
                                    <FileSpreadsheet className="size-5 text-emerald-600" />
                                    Export Master List Excel
                                </DialogTitle>
                                <DialogDescription>
                                    Sesuaikan nomor dokumen dan nomor revisi sebelum mengunduh format Excel.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="doc_no">Nomor Dokumen</Label>
                                    <Input
                                        id="doc_no"
                                        value={docNo}
                                        onChange={(e) => setDocNo(e.target.value)}
                                        placeholder="VI-MT-QP01-001-F02"
                                        disabled={isExporting}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="revision">Revisi</Label>
                                    <Input
                                        id="revision"
                                        value={revision}
                                        onChange={(e) => setRevision(e.target.value)}
                                        placeholder="0 atau V1.1"
                                        disabled={isExporting}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Nilai ini akan muncul pada header dokumen dan bagian revisi PIC.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsExportDialogOpen(false)}
                                    disabled={isExporting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Mengunduh...
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet className="size-4" />
                                            Download Excel
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
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
