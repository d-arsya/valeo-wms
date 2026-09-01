import { Head, useForm, router, usePage } from '@inertiajs/react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportPreviewTable } from '@/components/features/reports/ReportPreviewTable';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import reports from '@/routes/reports';
import type { ActivityLog, PaginatedResponse } from '@/types';

interface ReportsProps {
    logs: PaginatedResponse<ActivityLog>;
    filters: {
        from?: string;
        to?: string;
        type?: string;
        search?: string;
        control_id?: string;
    };
    dir: 'asc' | 'desc';
}

export default function ReportsIndex({ logs, filters, dir }: ReportsProps) {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';

    const { data, setData, processing, reset } = useForm({
        from: filters.from || '',
        to: filters.to || '',
        type: filters.type || 'all',
        search: filters.search || '',
    });

    const hasFilters = Boolean(
        data.from || data.to || data.type !== 'all' || data.search
    );

    // Export Control Dialog States (Admin only)
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState<'IN' | 'OUT'>('OUT');
    const [docNo, setDocNo] = useState('');
    const [revision, setRevision] = useState('');

    const handleApplyFilters = (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        router.get(
            reports.index().url,
            {
                from: data.from,
                to: data.to,
                type: data.type,
                search: data.search,
                ...(dir !== 'desc' ? { dir } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleClearFilters = () => {
        reset();
        router.get(reports.index().url, {}, {
            preserveState: false, preserveScroll: true, replace: true,
        });
    };

    const handleDirChange = (newDir: 'asc' | 'desc') => {
        router.get(
            reports.index().url,
            {
                from: data.from,
                to: data.to,
                type: data.type,
                search: data.search,
                ...(newDir !== 'desc' ? { dir: newDir } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleExportControl = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsExporting(true);
        const toastId = toast.loading('Menyiapkan file Excel...');

        try {
            const params = new URLSearchParams();
            params.append('type', exportType);
            if (docNo.trim()) params.append('doc_no', docNo.trim());
            if (revision.trim()) params.append('revision', revision.trim());
            // Pass current page filters so the export matches what the user sees
            if (data.from) params.append('from', data.from);
            if (data.to) params.append('to', data.to);
            if (data.search) params.append('search', data.search);

            const response = await fetch(`/reports/export/control?${params.toString()}`);
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Akses ditolak. Hanya admin yang dapat mengekspor.');
                }
                throw new Error('Gagal mengunduh file export.');
            }

            // Get filename from response header
            const disposition = response.headers.get('content-disposition');
            const typeLabel = exportType === 'IN' ? 'IN_CONTROL' : 'OUT_CONTROL';
            let filename = `Warehouse Management System_A23_${typeLabel}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
            if (disposition && disposition.includes('filename=')) {
                const matches = disposition.match(/filename="?([^"]+)"?/);
                if (matches && matches[1]) {
                    filename = decodeURIComponent(matches[1]);
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
            <Head title="Laporan Transaksi" />

            <div className="space-y-6 p-4 md:p-6">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <ReportHeader
                            isAdmin={isAdmin}
                            onExportControl={() => setIsExportDialogOpen(true)}
                        />
                    </CardHeader>

                    <CardContent className="border-b border-border/60 bg-background p-4 md:p-6">
                        <ReportFilters
                            data={data}
                            setData={setData}
                            onApply={handleApplyFilters}
                            onReset={handleClearFilters}
                            hasFilters={hasFilters}
                            processing={processing}
                            dir={dir}
                            onDirChange={handleDirChange}
                        />
                    </CardContent>

                    <CardContent className="p-0">
                        <ReportPreviewTable
                            logs={logs}
                            onReset={handleClearFilters}
                        />
                    </CardContent>
                </Card>

                <Pagination meta={logs} />
            </div>

            {/* Export IN/OUT Control Dialog (Admin only) */}
            {isAdmin && (
                <Dialog open={isExportDialogOpen} onOpenChange={(open) => !isExporting && setIsExportDialogOpen(open)}>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleExportControl}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg">
                                    <FileSpreadsheet className="size-5 text-emerald-600" />
                                    Export IN/OUT Control
                                </DialogTitle>
                                <DialogDescription>
                                    Pilih tipe kontrol, nomor dokumen, dan revisi sebelum mengunduh file Excel.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="export_type">Tipe Kontrol</Label>
                                    <Select
                                        value={exportType}
                                        onValueChange={(val) => setExportType(val as 'IN' | 'OUT')}
                                        disabled={isExporting}
                                    >
                                        <SelectTrigger id="export_type" className="w-full">
                                            <SelectValue placeholder="Pilih tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OUT">OUT Control</SelectItem>
                                            <SelectItem value="IN">IN Control</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ctrl_doc_no">Nomor Dokumen</Label>
                                    <Input
                                        id="ctrl_doc_no"
                                        value={docNo}
                                        onChange={(e) => setDocNo(e.target.value)}
                                        placeholder={exportType === 'IN' ? 'VI-MT-QP01-001-F04' : 'VI-MT-QP01-001-F05'}
                                        disabled={isExporting}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ctrl_revision">Revisi</Label>
                                    <Input
                                        id="ctrl_revision"
                                        value={revision}
                                        onChange={(e) => setRevision(e.target.value)}
                                        placeholder="0"
                                        disabled={isExporting}
                                    />
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

ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '#' },
    ],
};
