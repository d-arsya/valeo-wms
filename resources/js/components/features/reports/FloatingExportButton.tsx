import { Download, FileSpreadsheet, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { buildExportUrl } from '@/components/features/reports/ReportHeader';
import reports from '@/routes/reports';

/**
 * Floating export button — hanya muncul di mobile.
 * Tap tombol utama → expand dua pilihan (Excel + PDF).
 * Tap di luar → collapse.
 */
export function FloatingExportButton() {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    if (!isMobile) return null;

    const handleExportPdf = () => {
        setOpen(false);
        window.location.href = buildExportUrl(reports.export().url);
    };

    const handleExportExcel = () => {
        setOpen(false);
        const excelRoute = (reports as any)?.['export-excel']
            ? (reports as any)['export-excel']().url
            : '/reports/export/excel';
        window.location.href = buildExportUrl(excelRoute);
    };

    return (
        <>
            {/* Backdrop — tap untuk tutup */}
            {open && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div
                className="fixed right-5 z-40 flex flex-col items-end gap-3"
                style={{ bottom: 'max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))' }}
            >
                {/* Sub-tombol: muncul saat open */}
                <div className={cn(
                    'flex flex-col items-end gap-2 transition-all duration-200',
                    open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
                )}>
                    {/* Excel */}
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2.5 text-sm font-medium shadow-lg transition-colors hover:bg-muted active:scale-95"
                    >
                        <FileSpreadsheet className="size-4 shrink-0 text-emerald-600" />
                        Export Excel
                    </button>

                    {/* PDF */}
                    <button
                        type="button"
                        onClick={handleExportPdf}
                        className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2.5 text-sm font-medium shadow-lg transition-colors hover:bg-muted active:scale-95"
                    >
                        <Download className="size-4 shrink-0 text-primary" />
                        Export PDF
                    </button>
                </div>

                {/* Tombol utama */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Export laporan"
                    aria-expanded={open}
                    className={cn(
                        'flex size-14 items-center justify-center rounded-full shadow-2xl ring-1 ring-black/5 transition-all duration-200 active:scale-95',
                        open
                            ? 'bg-muted text-foreground rotate-45'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90',
                    )}
                >
                    {open
                        ? <X className="size-5" strokeWidth={2.5} />
                        : <Download className="size-5" strokeWidth={2.5} />
                    }
                </button>
            </div>
        </>
    );
}
