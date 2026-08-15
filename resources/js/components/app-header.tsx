import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Database,
    Folder,
    FolderOpen,
    Layers,
    LayoutGrid,
    Menu,
    Printer,
    QrCode,
    ScanLine,
    Tag,
    Users,
    Warehouse,
    ChevronDown,
    ChevronRight,
    Settings,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const mobileNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
    },
    {
        title: 'Spareparts',
        href: '/spareparts',
        icon: Warehouse,
    },
    {
        title: 'Scanner',
        href: '/scanner',
        icon: ScanLine,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: QrCode,
    },
    {
        title: 'Cetak QR Code',
        href: '/qr-codes/print',
        icon: Printer,
    },
    {
        title: 'Masterdata',
        href: '/brands',
        icon: Database,
        children: [
            {
                title: 'Brands',
                href: '/brands',
                icon: Tag,
            },
            {
                title: 'Categories',
                href: '/categories',
                icon: FolderOpen,
            },
            {
                title: 'Racks',
                href: '/racks',
                icon: Layers,
            },
        ],
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

function MobileNavGroup({
    item,
    currentPath,
}: {
    item: NavItem;
    currentPath: string;
}) {
    const children = item.children ?? [];
    const [open, setOpen] = useState<boolean>(() =>
        children.some((child) => String(child.href) === currentPath),
    );
    const toggle = () => setOpen((prev) => !prev);

    return (
        <div className="flex flex-col">
            <button
                type="button"
                onClick={toggle}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 text-base font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80"
                aria-expanded={open}
            >
                {item.icon && (
                    <item.icon className="h-5 w-5 shrink-0" />
                )}
                <span className="flex-1 truncate text-left">{item.title}</span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-200',
                        open && 'rotate-180',
                    )}
                />
            </button>
            {open && (
                <div className="mt-1 ml-2 flex flex-col gap-1 border-l border-sidebar-border/70 pl-2">
                    {children.map((child) => {
                        const childActive = String(child.href) === currentPath;

                        return (
                            <SheetClose asChild key={child.title}>
                                <Link
                                    href={child.href}
                                    className={cn(
                                        'flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                        childActive &&
                                            'bg-sidebar-accent text-sidebar-accent-foreground',
                                    )}
                                >
                                    {child.icon ? (
                                        <child.icon className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                                    )}
                                    <span className="flex-1 truncate">
                                        {child.title}
                                    </span>
                                </Link>
                            </SheetClose>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage<{
        auth?: {
            user?: {
                id?: number;
                name?: string;
                email?: string;
                role?: string;
                avatar_url?: string | null;
                avatar?: string | null;
            } | null;
        };
    }>();
    const auth = page.props.auth ?? {};
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl, currentUrl } = useCurrentUrl();
    const userRole = auth.user?.role;
    const isAdmin = userRole === 'admin';

    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-11 w-11"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-72 flex-col items-stretch justify-between bg-sidebar sm:w-80"
                            >
                                <SheetHeader className="p-0">
                                    <SheetTitle className="sr-only">
                                        Navigation menu
                                    </SheetTitle>
                                    <div className="flex items-center gap-2 border-b border-sidebar-border/70 px-2 pb-4 pt-2">
                                        <Link
                                            href={dashboard()}
                                            className="flex items-center gap-2"
                                        >
                                            <AppLogo />
                                        </Link>
                                    </div>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col overflow-y-auto px-2 py-3">
                                    <div className="flex flex-col gap-1">
                                        {mobileNavItems.map((item) => {
                                            if (
                                                (item.title === 'Users' ||
                                                    item.title ===
                                                        'Cetak QR Code') &&
                                                !isAdmin
                                            ) {
                                                return null;
                                            }

                                            const children = item.children;

                                            if (
                                                children &&
                                                children.length > 0
                                            ) {
                                                return (
                                                    <MobileNavGroup
                                                        key={item.title}
                                                        item={item}
                                                        currentPath={
                                                            currentUrl
                                                        }
                                                    />
                                                );
                                            }

                                            const href = item.href!;

                                            return (
                                                <SheetClose asChild key={item.title}>
                                                    <Link
                                                        href={href}
                                                        className={cn(
                                                            'flex min-h-11 items-center gap-3 rounded-md px-3 text-base font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80',
                                                            String(href) ===
                                                                currentUrl &&
                                                                'bg-sidebar-accent text-sidebar-accent-foreground',
                                                        )}
                                                    >
                                                        {item.icon && (
                                                            <item.icon className="h-5 w-5 shrink-0" />
                                                        )}
                                                        <span className="flex-1 truncate">
                                                            {item.title}
                                                        </span>
                                                    </Link>
                                                </SheetClose>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-6 border-t border-sidebar-border/70 pt-4">
                                        <div className="flex items-center justify-between rounded-md bg-sidebar-accent/50 px-3 py-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Avatar className="h-10 w-10 shrink-0 border border-sidebar-border">
                                                    {auth.user?.avatar_url ? (
                                                        <AvatarImage
                                                            src={
                                                                auth.user
                                                                    .avatar_url
                                                            }
                                                            alt={
                                                                auth.user
                                                                    .name ??
                                                                'User avatar'
                                                            }
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="text-sm font-semibold">
                                                        {getInitials(
                                                            auth.user?.name ??
                                                                '',
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-sidebar-foreground">
                                                        {auth.user?.name}
                                                    </p>
                                                    <p className="truncate text-xs text-sidebar-foreground/60">
                                                        {auth.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            {auth.user ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 shrink-0 hover:bg-sidebar-accent"
                                                        >
                                                            <Settings className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        side="right"
                                                        className="w-56"
                                                    >
                                                        <UserMenuContent
                                                            user={auth.user}
                                                        />
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-1 pb-4">
                                        {rightNavItems.map((item) => (
                                            <a
                                                key={item.title}
                                                href={toUrl(item.href)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                            >
                                                {item.icon && (
                                                    <item.icon className="h-4 w-4 shrink-0" />
                                                )}
                                                <span>{item.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer"
                                type="button"
                                aria-label="Search"
                            >
                                <Search className="size-5! opacity-80 group-hover:opacity-100" />
                            </Button>
                            <div className="ml-1 hidden gap-1 lg:flex">
                                {rightNavItems.map((item) => (
                                    <Tooltip key={item.title}>
                                        <TooltipTrigger>
                                            <a
                                                href={toUrl(item.href)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                <span className="sr-only">
                                                    {item.title}
                                                </span>
                                                {item.icon && (
                                                    <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                                )}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={
                                                    auth.user.avatar_url ??
                                                    auth.user.avatar ??
                                                    undefined
                                                }
                                                alt={auth.user.name ?? 'User avatar'}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name ?? '')}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
