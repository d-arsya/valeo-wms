import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ChevronRight,
    Database,
    FolderOpen,
    Layers,
    LogOut,
    Menu,
    Printer,
    QrCode,
    ScanLine,
    Settings,
    Tag,
    Users,
    Warehouse,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { UserInfo } from '@/components/user-info';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { NavItem } from '@/types';

// ── Navigasi utama di bottom bar (4 item) ──────────────────────────────────
const PRIMARY_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { title: 'Spareparts', href: '/spareparts', icon: Warehouse },
    { title: 'Scanner', href: '/scanner', icon: ScanLine },
    { title: 'Reports', href: '/reports', icon: QrCode },
];

// ── Navigasi sekunder di dalam drawer ─────────────────────────────────────
const SECONDARY_NAV: NavItem[] = [
    { title: 'Cetak QR Code', href: '/qr-codes/print', icon: Printer },
    {
        title: 'Masterdata',
        href: '/brands',
        icon: Database,
        children: [
            { title: 'Brands', href: '/brands', icon: Tag },
            { title: 'Categories', href: '/categories', icon: FolderOpen },
            { title: 'Racks', href: '/racks', icon: Layers },
        ],
    },
    { title: 'Users', href: '/users', icon: Users },
];

// ── Sub-komponen: grup dengan expand/collapse ──────────────────────────────
function SecondaryNavGroup({
    item,
    currentPath,
}: {
    item: NavItem;
    currentPath: string;
}) {
    const children = item.children ?? [];
    const anyActive = children.some((c) => String(c.href) === currentPath);
    const [open, setOpen] = useState(anyActive);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="flex w-full min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent"
                aria-expanded={open}
            >
                {item.icon && <item.icon className="size-5 shrink-0" />}
                <span className="flex-1 truncate text-left">{item.title}</span>
                <ChevronRight
                    className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                        open && 'rotate-90',
                    )}
                />
            </button>

            {open && (
                <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-sidebar-border/60 pl-3">
                    {children.map((child) => {
                        const active = String(child.href) === currentPath;
                        return (
                            <SheetClose asChild key={child.title}>
                                <Link
                                    href={child.href}
                                    className={cn(
                                        'flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                                        active
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent',
                                    )}
                                >
                                    {child.icon
                                        ? <child.icon className="size-4 shrink-0" />
                                        : <ChevronRight className="size-3 shrink-0 opacity-40" />
                                    }
                                    <span>{child.title}</span>
                                </Link>
                            </SheetClose>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Komponen utama ─────────────────────────────────────────────────────────
export function MobileBottomNav() {
    const page = usePage<{
        auth?: { user?: { name?: string; email?: string; role?: string; avatar_url?: string | null } | null };
    }>();
    const auth    = page.props.auth ?? {};
    const isAdmin = auth.user?.role === 'admin';

    const { currentUrl } = useCurrentUrl();
    const cleanup         = useMobileNavigation();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        cleanup();
        setDrawerOpen(false);
        router.post(logout().url, {}, { onFinish: () => router.flushAll() });
    };

    // Filter secondary nav berdasarkan role
    const secondaryItems = SECONDARY_NAV.filter((item) => {
        if (item.href === '/users') return isAdmin;
        if (item.title === 'Masterdata') return isAdmin;
        if (item.href === '/qr-codes/print') return isAdmin;
        return true;
    });

    // Apakah halaman aktif ada di menu sekunder?
    const secondaryActive = secondaryItems.some((item) =>
        item.children
            ? item.children.some((c) => String(c.href) === currentUrl)
            : String(item.href) === currentUrl,
    );

    return (
        <>
            {/* ── Bottom bar ──────────────────────────────────────────── */}
            <nav
                aria-label="Navigasi utama"
                className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                {/* 4 item utama */}
                {PRIMARY_NAV.map((item) => {
                    const active = currentUrl.startsWith(String(item.href));
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                            aria-label={item.title}
                            aria-current={active ? 'page' : undefined}
                        >
                            {item.icon && (
                                <item.icon
                                    className={cn(
                                        'size-5 shrink-0 transition-transform',
                                        active && 'scale-110',
                                    )}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                            )}
                            <span>{item.title}</span>

                            {/* Dot indikator aktif */}
                            {active && (
                                <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}

                {/* Tombol Menu → buka drawer */}
                <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Buka menu"
                    className={cn(
                        'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                        secondaryActive
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <Menu
                        className={cn('size-5 shrink-0', secondaryActive && 'scale-110')}
                        strokeWidth={secondaryActive ? 2.5 : 2}
                    />
                    <span>Menu</span>
                    {secondaryActive && (
                        <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                    )}
                </button>
            </nav>

            {/* ── Drawer sekunder ─────────────────────────────────────── */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent
                    side="bottom"
                    className="flex max-h-[80dvh] flex-col rounded-t-2xl bg-sidebar px-0 pb-0 md:hidden"
                >
                    <SheetHeader className="shrink-0 px-4 pb-3 pt-2">
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        {/* Handle drag indicator */}
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
                        <div className="flex items-center gap-2">
                            <AppLogo />
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-3 pb-4">
                        {/* Item sekunder */}
                        <div className="flex flex-col gap-0.5">
                            {secondaryItems.map((item) => {
                                if (item.children?.length) {
                                    return (
                                        <SecondaryNavGroup
                                            key={item.title}
                                            item={item}
                                            currentPath={currentUrl}
                                        />
                                    );
                                }
                                const active = String(item.href) === currentUrl;
                                return (
                                    <SheetClose asChild key={item.title}>
                                        <Link
                                            href={item.href!}
                                            className={cn(
                                                'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                                                active
                                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent',
                                            )}
                                        >
                                            {item.icon && <item.icon className="size-5 shrink-0" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SheetClose>
                                );
                            })}
                        </div>

                        {/* Divider */}
                        <div className="my-3 border-t border-sidebar-border/60" />

                        {/* User info + aksi */}
                        <div className="rounded-xl bg-sidebar-accent/40 px-3 py-3">
                            <div className="mb-3 flex items-center gap-3">
                                <UserInfo user={auth.user as Parameters<typeof UserInfo>[0]['user']} showEmail />
                            </div>

                            <div className="flex flex-col gap-1">
                                <SheetClose asChild>
                                    <Link
                                        href={editProfile()}
                                        className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent"
                                        onClick={cleanup}
                                    >
                                        <Settings className="size-4 shrink-0" />
                                        <span>Settings</span>
                                    </Link>
                                </SheetClose>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
                                >
                                    <LogOut className="size-4 shrink-0" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
