import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ReportHeader() {
    const handlePlaceholderExport = () => {
        toast.info('Fitur ekspor PDF sedang dalam pengembangan', {
            description: 'Fungsi ini akan segera tersedia di pembaruan berikutnya.',
            duration: 3000,
        });
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/50 backdrop-blur-sm border p-6 rounded-2xl shadow-sm">
            <div className="space-y-1">
                <div className="flex items-center gap-3 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Laporan Transaksi</h1>
                </div>
                <p className="text-muted-foreground pl-11">
                    Monitor aktivitas Stock IN dan Stock OUT dengan detail.
                </p>
            </div>

            <div className="flex gap-3 pl-11 md:pl-0">
                <Button 
                    size="lg" 
                    onClick={handlePlaceholderExport}
                    className="rounded-xl h-12 px-8 font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Download className="mr-2 h-5 w-5" />
                    Export ke PDF
                </Button>
            </div>
        </div>
    );
}
