import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    FolderGit2,
    QrCode,
    ScanLine,
    Warehouse,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
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
        title: 'Users',
        href: '/users',
        icon: Users,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    const filteredNavItems = mainNavItems.filter((item) => {
        if (item.href === '/users') {
            return auth.user?.role === 'admin';
        }
        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
