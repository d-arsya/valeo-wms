import { formatDateTime } from '@/components/features/spareparts/spareparts-utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityLog } from '@/types';
import type { User } from '@/types/auth';

interface Props {
    activityLogs: Array<ActivityLog & { user?: User | null }>;
}

function renderActivityBadge(type: ActivityLog['type']) {
    return type === 'IN' ? (
        <Badge variant="secondary">IN</Badge>
    ) : (
        <Badge variant="destructive">OUT</Badge>
    );
}

export function ActivityLogTable({ activityLogs }: Props) {
    return (
        <Card className="gap-0 overflow-hidden border-border/60 shadow-sm flex flex-col">
            <CardHeader className="border-b border-border/60 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Riwayat aktivitas</CardTitle>
                {activityLogs.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                        {activityLogs.length} transaksi
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="p-0 flex-1">
                {activityLogs.length > 0 ? (
                    /* Di laptop (lg:), tabel scrollable secara independen dengan sticky header */
                    <div className="overflow-x-auto lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto relative">
                        <table className="min-w-full border-collapse text-sm">
                            <thead className="bg-muted/30 lg:sticky lg:top-0 lg:z-10 lg:bg-background/95 lg:backdrop-blur border-b border-border/60 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Control ID</th>
                                    <th className="px-6 py-4 font-medium">Type</th>
                                    <th className="px-6 py-4 font-medium">Qty</th>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Performed at</th>
                                    <th className="px-6 py-4 font-medium">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activityLogs.map((log, index) => (
                                    <tr key={log.id} className={index % 2 === 1 ? 'bg-muted/10' : ''}>
                                        <td className="px-6 py-4 align-top font-medium">{log.control_id}</td>
                                        <td className="px-6 py-4 align-top">{renderActivityBadge(log.type)}</td>
                                        <td className="px-6 py-4 align-top tabular-nums">{log.quantity}</td>
                                        <td className="px-6 py-4 align-top">{log.user?.name ?? '-'}</td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">{formatDateTime(log.performed_at)}</td>
                                        <td className="px-6 py-4 align-top">{log.remarks ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Belum ada riwayat transaksi untuk sparepart ini.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
