import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Package,
    RefreshCw,
    ScanLine,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import reports from '@/routes/reports';
import spareparts from '@/routes/spareparts';
import type { ActivityLog } from '@/types';

interface DashboardProps {
    stats: {
        total_spareparts: number;
        total_actual_stock: number;
        status_counts: { ok: number; attention: number; ng: number };
        recent_activities: ActivityLog[];
    };
}

// ── Komponen stat card ─────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    sub,
    accent,
    icon: Icon,
}: {
    label: string;
    value: number | string;
    sub: string;
    accent: string;
    icon: React.ElementType;
}) {
    return (
        <div
            className={cn(
                'relative flex min-w-[140px] flex-1 flex-col justify-between overflow-hidden rounded-2xl p-4',
                accent,
            )}
        >
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                    {label}
                </span>
                <Icon className="size-4 opacity-70" />
            </div>
            <div>
                <p className="text-3xl font-black tabular-nums leading-none">{value}</p>
                <p className="mt-1 text-[11px] opacity-65">{sub}</p>
            </div>
        </div>
    );
}

// ── Halaman utama ──────────────────────────────────────────────────────────
export default function Dashboard({ stats }: DashboardProps) {
    const page = usePage<{ auth?: { user?: { name?: string } | null } }>();
    const userName = page.props.auth?.user?.name?.split(' ')[0] ?? 'Admin';

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated]   = useState(() => new Date());

    const refreshStats = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['stats'],
            onFinish: () => {
                setIsRefreshing(false);
                setLastUpdated(new Date());
            },
        });
    };

    useEffect(() => {
        const id = window.setInterval(refreshStats, 30_000);
        return () => window.clearInterval(id);
    }, []);

    const hour = new Date().getHours();
    const greeting =
        hour < 11 ? 'Selamat pagi' :
        hour < 15 ? 'Selamat siang' :
        hour < 18 ? 'Selamat sore' : 'Selamat malam';

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-5 px-4 pb-6 pt-4 md:gap-6 md:px-8 md:pt-8">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        {/* Greeting — hanya muncul di mobile */}
                        <p className="text-xs text-muted-foreground md:hidden">
                            {greeting}, <span className="font-semibold text-foreground">{userName}</span>
                        </p>
                        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                            Dashboard
                        </h1>
                        <p className="hidden text-sm text-muted-foreground md:block">
                            Ringkasan stok gudang dan aktivitas terbaru.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={refreshStats}
                        disabled={isRefreshing}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
                        <span className="hidden sm:inline">
                            {format(lastUpdated, 'HH:mm:ss')}
                        </span>
                        <span className="sm:hidden">Refresh</span>
                    </button>
                </div>

                {/* ── Stat cards — horizontal scroll di mobile ───────── */}
                <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
                    <StatCard
                        label="Total"
                        value={stats.total_spareparts.toLocaleString()}
                        sub={`${stats.total_actual_stock.toLocaleString()} unit stok`}
                        icon={Package}
                        accent="bg-primary/10 text-primary dark:bg-primary/20"
                    />
                    <StatCard
                        label="OK"
                        value={stats.status_counts.ok}
                        sub="Stok aman"
                        icon={CheckCircle2}
                        accent="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    />
                    <StatCard
                        label="Attention"
                        value={stats.status_counts.attention}
                        sub="Mendekati safety stock"
                        icon={AlertTriangle}
                        accent="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    />
                    <StatCard
                        label="NG"
                        value={stats.status_counts.ng}
                        sub="Stok kritis / habis"
                        icon={XCircle}
                        accent="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    />
                </div>

                {/* ── Quick Actions — hanya di mobile ────────────────── */}
                <div className="grid grid-cols-3 gap-2 md:hidden">
                    {[
                        { href: spareparts.index().url, icon: Package,  label: 'Spareparts' },
                        { href: '/scanner',             icon: ScanLine,  label: 'Scanner' },
                        { href: reports.index().url,    icon: Activity,  label: 'Laporan' },
                    ].map(({ href, icon: Icon, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card py-4 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted active:scale-95"
                        >
                            <Icon className="size-5 text-primary" />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* ── Konten bawah: Activity + Quick Actions desktop ── */}
                <div className="grid gap-4 md:grid-cols-7">

                    {/* Recent Activities */}
                    <div className="rounded-2xl border border-border/60 bg-card shadow-sm md:col-span-4">
                        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                            <div>
                                <p className="text-sm font-semibold">Aktivitas Terbaru</p>
                                <p className="text-xs text-muted-foreground">Transaksi stok terakhir.</p>
                            </div>
                            <Link
                                href={reports.index().url}
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                                Lihat semua <ArrowRight className="size-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-border/40">
                            {stats.recent_activities.length > 0 ? (
                                stats.recent_activities.map((log) => {
                                    const isIn = log.type === 'IN';
                                    return (
                                        <div key={log.id} className="flex items-center gap-3 px-5 py-3.5">
                                            {/* Badge IN / OUT */}
                                            <div className={cn(
                                                'flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                                isIn
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
                                            )}>
                                                {isIn ? 'IN' : 'OUT'}
                                            </div>

                                            {/* Info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <Link
                                                        href={spareparts.show(log.sparepart?.material_number ?? '').url}
                                                        className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                                                    >
                                                        {log.sparepart?.material_number}
                                                    </Link>
                                                    <span className={cn(
                                                        'shrink-0 text-xs font-bold tabular-nums',
                                                        isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                                                    )}>
                                                        {isIn ? '+' : '-'}{log.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {log.sparepart?.part_name}
                                                    </p>
                                                    <span className="shrink-0 text-[10px] text-muted-foreground/70">
                                                        {format(new Date(log.performed_at), 'd MMM, HH:mm', { locale: localeId })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                    <Activity className="size-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions — desktop only */}
                    <div className="hidden md:col-span-3 md:flex md:flex-col md:gap-4">
                        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                            <p className="mb-4 text-sm font-semibold">Quick Actions</p>
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" className="h-11 justify-start gap-3" asChild>
                                    <Link href={spareparts.index().url}>
                                        <Package className="size-4" /> Kelola Inventory
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-11 justify-start gap-3" asChild>
                                    <Link href="/scanner">
                                        <ScanLine className="size-4" /> Buka Scanner
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-11 justify-start gap-3" asChild>
                                    <Link href={reports.index().url}>
                                        <Activity className="size-4" /> Lihat Laporan
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Ringkasan status */}
                        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                            <p className="mb-3 text-sm font-semibold">Ringkasan Status</p>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'OK', val: stats.status_counts.ok, total: stats.total_spareparts, color: 'bg-emerald-500' },
                                    { label: 'Attention', val: stats.status_counts.attention, total: stats.total_spareparts, color: 'bg-amber-500' },
                                    { label: 'NG', val: stats.status_counts.ng, total: stats.total_spareparts, color: 'bg-rose-500' },
                                ].map(({ label, val, total, color }) => {
                                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                    return (
                                        <div key={label}>
                                            <div className="mb-1 flex justify-between text-xs">
                                                <span className="font-medium">{label}</span>
                                                <span className="tabular-nums text-muted-foreground">{val} ({pct}%)</span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={cn('h-full rounded-full transition-all', color)}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
