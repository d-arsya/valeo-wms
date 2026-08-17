import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActivityLog, PaginatedResponse } from '@/types';

interface Props {
    logs: PaginatedResponse<ActivityLog>;
    onReset: () => void;
}

export function ReportMobileList({ logs, onReset }: Props) {
    if (logs.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                <Search className="size-8 text-muted-foreground/40" />
                <p className="text-base font-semibold">Tidak ada data laporan</p>
                <p className="text-sm text-muted-foreground">
                    Coba ubah pencarian atau hapus filter.
                </p>
                <Button variant="outline" size="sm" onClick={onReset}>
                    Reset filter
                </Button>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border/50">
            {logs.data.map((log) => {
                const isIn = log.type === 'IN';
                const date = parseISO(log.performed_at);

                return (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3.5">
                        {/* Badge IN / OUT */}
                        <div className={cn(
                            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                            isIn
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
                        )}>
                            {isIn ? 'IN' : 'OUT'}
                        </div>

                        {/* Konten */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                            {/* Baris 1: material + qty */}
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="truncate font-mono text-sm font-bold text-foreground">
                                    {log.sparepart?.material_number ?? '-'}
                                </span>
                                <span className={cn(
                                    'shrink-0 text-sm font-bold tabular-nums',
                                    isIn
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400',
                                )}>
                                    {isIn ? '+' : '-'}{log.quantity}
                                </span>
                            </div>

                            {/* Baris 2: part name */}
                            <p className="truncate text-xs text-muted-foreground">
                                {log.sparepart?.part_name ?? '-'}
                            </p>

                            {/* Baris 3: control ID + operator + waktu */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5 text-[11px] text-muted-foreground">
                                <span className="font-mono">{log.control_id}</span>
                                <span className="opacity-40">·</span>
                                <span>{log.user?.name ?? '-'}</span>
                                <span className="opacity-40">·</span>
                                <span>{format(date, 'd MMM, HH:mm', { locale: id })}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
