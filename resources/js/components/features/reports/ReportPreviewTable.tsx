import { Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ActivityLog, PaginatedResponse } from '@/types';

interface ReportPreviewTableProps {
    logs: PaginatedResponse<ActivityLog>;
    onReset: () => void;
}

export function ReportPreviewTable({ logs, onReset }: ReportPreviewTableProps) {
    return (
        <Card className="lg:col-span-3 border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-0 bg-muted/20 border-b border-border/40">
                <div className="flex items-center justify-between py-2">
                    <div>
                        <CardTitle className="text-xl font-bold">Preview Aktivitas</CardTitle>
                        <CardDescription>
                            Menampilkan total {logs.total} data transaksi.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-background/50 font-mono text-[10px] px-3 py-1 text-primary border-primary/20">
                        LIVE PREVIEW
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border/40">
                                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">Waktu Transaksi</th>
                                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">Control ID</th>
                                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">Material Number</th>
                                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px] text-center">Status</th>
                                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px] text-right">Kuantitas</th>
                                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">Operator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {logs.data.length > 0 ? (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">
                                                    {format(parseISO(log.performed_at), "dd MMM yyyy", { locale: id })}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground font-mono">
                                                    {format(parseISO(log.performed_at), "HH:mm:ss")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-primary font-bold">{log.control_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.sparepart?.material_number || '-'}</span>
                                                <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                                                    {log.sparepart?.part_name || 'Sparepart Detail'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge 
                                                className={cn(
                                                    "px-3 py-1 font-extrabold text-[10px] rounded-full border-none shadow-sm",
                                                    log.type === 'IN' 
                                                        ? "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/10" 
                                                        : "bg-rose-500/10 text-rose-600 shadow-rose-500/10"
                                                )}
                                            >
                                                {log.type === 'IN' ? 'STOCK IN' : 'STOCK OUT'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "text-lg font-black",
                                                log.type === 'IN' ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                                    {log.user?.name?.[0] || 'U'}
                                                </div>
                                                <span className="text-muted-foreground font-medium truncate max-w-[100px]">
                                                    {log.user?.name || '-'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-muted rounded-full">
                                                <Search className="h-8 w-8 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">Data tidak ditemukan untuk filter ini.</p>
                                            <Button variant="link" onClick={onReset} className="text-primary font-bold">
                                                Reset semua filter
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
