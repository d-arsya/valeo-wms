import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboard, spareparts, reports } from '@/routes';
import { Package, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Activity } from 'lucide-react';
import { ActivityLog } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DashboardProps {
    stats: {
        total_spareparts: number;
        total_actual_stock: number;
        status_counts: {
            ok: number;
            attention: number;
            ng: number;
        };
        recent_activities: ActivityLog[];
    }
}

export default function Dashboard({ stats }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spareparts</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_spareparts}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_actual_stock.toLocaleString()} units in total stock
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status: OK</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.status_counts.ok}</div>
                            <p className="text-xs text-muted-foreground">
                                Stock levels are healthy
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status: ATTENTION</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.status_counts.attention}</div>
                            <p className="text-xs text-muted-foreground">
                                Reaching safety stock level
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-destructive">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status: NG</CardTitle>
                            <XCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.status_counts.ng}</div>
                            <p className="text-xs text-muted-foreground">
                                Out of stock or critically low
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section: Recent Activities & Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Activities</CardTitle>
                                    <CardDescription>
                                        Latest stock transactions in the warehouse.
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={reports.index().url} className="flex items-center gap-1">
                                        View All <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {stats.recent_activities.length > 0 ? (
                                    stats.recent_activities.map((log) => (
                                        <div key={log.id} className="flex items-center gap-4">
                                            <div className={cn(
                                                "flex h-9 w-9 items-center justify-center rounded-full",
                                                log.type === 'IN' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                            )}>
                                                <Activity className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-1 flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium leading-none">
                                                        <Link 
                                                            href={spareparts.show(log.sparepart_id).url}
                                                            className="hover:underline"
                                                        >
                                                            {log.sparepart?.material_number}
                                                        </Link>
                                                        <span className="text-muted-foreground font-normal ml-2">
                                                            ({log.type === 'IN' ? '+' : '-'}{log.quantity})
                                                        </span>
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {format(new Date(log.performed_at), 'MMM d, HH:mm')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {log.sparepart?.part_name} — PIC: {log.user?.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No recent activities found.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common warehouse tasks.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button variant="outline" className="justify-start h-12" asChild>
                                <Link href={spareparts.index().url}>
                                    <Package className="mr-2 h-4 w-4" /> Manage Inventory
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start h-12" asChild>
                                <Link href="/scanner">
                                    <Activity className="mr-2 h-4 w-4" /> Open Scanner
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start h-12" asChild>
                                <Link href={reports.index().url}>
                                    <ArrowRight className="mr-2 h-4 w-4" /> View Audit Logs
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

// Reuse Button to avoid import error if it's already used but not shown in view
import { Button } from '@/components/ui/button';

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
