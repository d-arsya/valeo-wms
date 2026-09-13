import { router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    FileSpreadsheet,
    Info,
    Loader2,
    PlusCircle,
    RefreshCw,
    ShieldCheck,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import spareparts from '@/routes/spareparts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FieldChange {
    field: string;
    label: string;
    oldValue: string;
    newValue: string;
}

interface UpdatedItem {
    material_number: string;
    part_name: string;
    type: 'updated';
    changes: FieldChange[];
}

interface CreatedItem {
    material_number: string;
    part_name: string;
    type: 'created';
    actual_stock: number;
    safety_stock: number;
    unit: string;
    price_per_unit: string;
    rank: string;
}

export interface ImportResult {
    created: number;
    updated: number;
    unchanged: number;
    skipped: number;
    total: number;
    created_items: CreatedItem[];
    updated_items: UpdatedItem[];
    has_more_items?: boolean;
}

interface SparepartsImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type Step = 'upload' | 'preview' | 'result';

// Safe endpoint fallback
const importEndpoint = spareparts?.import?.definition?.url || '/spareparts/import';

// ─── Shared sub-components ────────────────────────────────────────────────────

function UpdatedItemCard({ item }: { item: UpdatedItem }) {
    return (
        <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2 text-xs shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Badge variant="outline" className="font-mono text-2xs font-semibold bg-muted">
                        {item.material_number}
                    </Badge>
                    <span className="font-medium text-foreground truncate">{item.part_name}</span>
                </div>
                <Badge className="bg-primary hover:bg-primary text-primary-foreground text-3xs font-medium shrink-0">
                    {item.changes.length} Kolom Berubah
                </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {item.changes.map((ch) => (
                    <div
                        key={ch.field}
                        className="rounded-lg bg-muted/40 border border-border/50 p-2 flex flex-col gap-1"
                    >
                        <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {ch.label}
                        </span>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="line-through text-muted-foreground truncate max-w-[45%]">
                                {ch.oldValue}
                            </span>
                            <ArrowRight className="size-3 text-muted-foreground/70 shrink-0" />
                            <span className="font-semibold text-accent truncate max-w-[45%]">
                                {ch.newValue}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CreatedItemCard({ item }: { item: CreatedItem }) {
    return (
        <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 text-xs shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Badge
                        variant="outline"
                        className="font-mono text-2xs font-semibold bg-accent/10 text-accent border-accent/30"
                    >
                        {item.material_number}
                    </Badge>
                    <span className="font-medium text-foreground truncate">{item.part_name}</span>
                </div>
                <Badge className="bg-accent hover:bg-accent text-accent-foreground text-3xs font-medium shrink-0">
                    Data Baru
                </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                <span>
                    Stok: <strong className="text-foreground font-semibold">{item.actual_stock}</strong>
                </span>
                <span>
                    Safety: <strong className="text-foreground font-semibold">{item.safety_stock}</strong>
                </span>
                <span>
                    Unit: <strong className="text-foreground font-semibold">{item.unit}</strong>
                </span>
                <span>
                    Harga: <strong className="text-foreground font-semibold">{item.price_per_unit}</strong>
                </span>
                <span>
                    Rank: <strong className="text-foreground font-semibold">{item.rank}</strong>
                </span>
            </div>
        </div>
    );
}

function SummaryCards({ result }: { result: ImportResult }) {
    return (
        <div className="grid grid-cols-3 gap-2.5 py-1">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
                <span className="text-xs font-medium text-accent block">
                    Baru Ditambahkan
                </span>
                <span className="text-2xl font-bold text-accent">
                    {result.created}
                </span>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                <span className="text-xs font-medium text-primary block">
                    Data Diperbarui
                </span>
                <span className="text-2xl font-bold text-primary">
                    {result.updated}
                </span>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/40 p-3 text-center">
                <span className="text-xs font-medium text-muted-foreground block">Tanpa Perubahan</span>
                <span className="text-2xl font-bold text-foreground">{result.unchanged}</span>
            </div>
        </div>
    );
}

function ChangesList({
    result,
    activeTab,
    setActiveTab,
}: {
    result: ImportResult;
    activeTab: 'updated' | 'created';
    setActiveTab: (t: 'updated' | 'created') => void;
}) {
    return (
        <>
            {(result.updated_items.length > 0 || result.created_items.length > 0) && (
                <div className="flex items-center gap-2 border-b border-border pb-2 text-sm">
                    {result.updated_items.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('updated')}
                            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 ${
                                activeTab === 'updated'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                        >
                            <RefreshCw className="size-3.5" />
                            Data Diperbarui ({result.updated_items.length})
                        </button>
                    )}
                    {result.created_items.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('created')}
                            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 ${
                                activeTab === 'created'
                                    ? 'bg-accent text-accent-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                        >
                            <PlusCircle className="size-3.5" />
                            Data Baru ({result.created_items.length})
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-y-auto max-h-[42vh] pr-1 space-y-2.5">
                {activeTab === 'updated' && result.updated_items.length > 0 && (
                    <div className="space-y-2">
                        {result.updated_items.map((item) => (
                            <UpdatedItemCard key={item.material_number} item={item} />
                        ))}
                    </div>
                )}
                {activeTab === 'created' && result.created_items.length > 0 && (
                    <div className="space-y-2">
                        {result.created_items.map((item) => (
                            <CreatedItemCard key={item.material_number} item={item} />
                        ))}
                    </div>
                )}
                {result.created === 0 && result.updated === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 rounded-xl border border-dashed border-border bg-muted/20">
                        <Info className="size-6 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Tidak Ada Perubahan Data</p>
                    </div>
                )}
                {result.has_more_items && (
                    <p className="text-center text-xs text-muted-foreground pt-2">
                        Dan data lainnya akan disimpan ke database...
                    </p>
                )}
            </div>
        </>
    );
}

// ─── Main Dialog ─────────────────────────────────────────────────────────────

export function SparepartsImportDialog({ open, onOpenChange }: SparepartsImportDialogProps) {
    const [importFile, setImportFile] = useState<File | null>(null);
    const [step, setStep] = useState<Step>('upload');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<ImportResult | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'updated' | 'created'>('updated');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const resetToUpload = () => {
        setImportFile(null);
        setStep('upload');
        setError(null);
        setPreview(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        if (isLoading) return;
        onOpenChange(false);
        setTimeout(resetToUpload, 300);
    };

    // ── Step 1 → 2: Dry-run preview ──────────────────────────────────────────
    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile || isLoading) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('dry_run', '1');

        const csrfMeta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
        if (csrfMeta) {
            formData.append('_token', csrfMeta.content);
        }

        try {
            const response = await fetch(importEndpoint, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Terjadi kesalahan saat memproses file.');
            }

            const previewData: ImportResult = data.preview;
            setPreview(previewData);

            if (previewData.updated_items.length > 0) {
                setActiveTab('updated');
            } else if (previewData.created_items.length > 0) {
                setActiveTab('created');
            }

            setStep('preview');
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2 → 3: Execute real import ──────────────────────────────────────
    const handleExecute = () => {
        if (!importFile || isLoading) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', importFile);

        router.post(importEndpoint, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = (page.props as { flash?: { import_result?: ImportResult } }).flash;
                const importResult = flash?.import_result;

                if (importResult) {
                    setResult(importResult);
                    if (importResult.updated_items.length > 0) {
                        setActiveTab('updated');
                    } else if (importResult.created_items.length > 0) {
                        setActiveTab('created');
                    }
                    setStep('result');
                } else {
                    onOpenChange(false);
                }
            },
            onError: (errors) => {
                const msg =
                    (errors.file as string) ||
                    (errors.import as string) ||
                    'Terjadi kesalahan saat menyimpan data.';
                setError(msg);
                toast.error(msg);
                setStep('preview');
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const handleFinishAndRefresh = () => {
        handleClose();
        router.reload();
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const isWide = step === 'preview' || step === 'result';

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (isLoading) return;
                if (!isOpen) handleClose();
                else onOpenChange(true);
            }}
        >
            <DialogContent
                className={`transition-all ${isWide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[90vh] flex flex-col`}
                onPointerDownOutside={(e) => isLoading && e.preventDefault()}
                onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
            >
                {/* ── STEP: RESULT ── */}
                {step === 'result' && result ? (
                    <div className="flex flex-col h-full space-y-4 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
                                <CheckCircle2 className="size-5 text-accent shrink-0" />
                                Import Selesai & Tersimpan
                            </DialogTitle>
                        </DialogHeader>

                        <SummaryCards result={result} />
                        <ChangesList result={result} activeTab={activeTab} setActiveTab={setActiveTab} />

                        <DialogFooter className="pt-2 border-t border-border">
                            <Button
                                type="button"
                                className="w-full sm:w-auto"
                                onClick={handleFinishAndRefresh}
                            >
                                Selesai & Muat Ulang Data
                            </Button>
                        </DialogFooter>
                    </div>
                ) : step === 'preview' && preview ? (
                    /* ── STEP: PREVIEW ── */
                    <div className="flex flex-col h-full space-y-4 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
                                <ShieldCheck className="size-5 shrink-0" style={{ color: 'var(--chart-4)' }} />
                                Preview Perubahan Data
                            </DialogTitle>
                        </DialogHeader>

                        <SummaryCards result={preview} />

                        {error && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 flex items-start gap-2.5">
                                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                                <div className="text-sm text-destructive font-medium leading-snug">
                                    {error}
                                </div>
                            </div>
                        )}

                        <ChangesList result={preview} activeTab={activeTab} setActiveTab={setActiveTab} />

                        <DialogFooter className="pt-2 border-t border-border gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetToUpload}
                                disabled={isLoading}
                            >
                                Ganti File
                            </Button>
                            <Button
                                type="button"
                                onClick={handleExecute}
                                disabled={isLoading}
                                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="size-4" />
                                        Konfirmasi & Import
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    /* ── STEP: UPLOAD ── */
                    <form onSubmit={handlePreview} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Upload className="size-5 text-primary" />
                                Import Master Spareparts
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-2 space-y-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                                    <div className="relative flex items-center justify-center">
                                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Loader2 className="size-8 animate-spin text-primary" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-base font-medium text-foreground">
                                            Menganalisis File Excel...
                                        </h4>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {error && (
                                        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 flex items-start gap-2.5">
                                            <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                                            <div className="text-sm text-destructive font-medium leading-snug">
                                                {error}
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImportFile(file);
                                                setError(null);
                                            }
                                        }}
                                    />

                                    {!importFile ? (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setIsDragging(true);
                                            }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setIsDragging(false);
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) {
                                                    if (
                                                        file.name.endsWith('.xlsx') ||
                                                        file.name.endsWith('.xls')
                                                    ) {
                                                        setImportFile(file);
                                                        setError(null);
                                                    } else {
                                                        setError(
                                                            'Format file harus berupa Excel (.xlsx atau .xls).',
                                                        );
                                                    }
                                                }
                                            }}
                                            className={`flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                                                isDragging
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50 hover:bg-muted/40'
                                            }`}
                                        >
                                            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                                <Upload className="size-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground mb-1">
                                                Klik untuk memilih file atau seret file ke sini
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Format Excel (.xlsx, .xls)
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                                    <FileSpreadsheet className="size-5 text-accent" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {importFile.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(importFile.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-muted-foreground hover:text-foreground shrink-0"
                                                onClick={() => {
                                                    setImportFile(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="gap-2"
                                disabled={!importFile || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Menganalisis...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="size-4" />
                                        Analisis & Preview
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
