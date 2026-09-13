import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

interface SparepartsExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SparepartsExportDialog({ open, onOpenChange }: SparepartsExportDialogProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [docNo, setDocNo] = useState('VI-MT-QP01-001-F02');
    const [revision, setRevision] = useState('V1.1');

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
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengekspor data.', { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (isExporting) return;
                onOpenChange(isOpen);
            }}
        >
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => isExporting && e.preventDefault()}
                onEscapeKeyDown={(e) => isExporting && e.preventDefault()}
            >
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
                            onClick={() => onOpenChange(false)}
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
    );
}
