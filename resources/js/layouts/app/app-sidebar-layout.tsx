import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { FlashToaster } from '@/components/flash-toaster';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <FlashToaster />
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {/* Padding bottom di mobile agar konten tidak tertutup bottom nav (h-16 = 64px) */}
                <div className="pb-16 md:pb-0">
                    {children}
                </div>
            </AppContent>
            {/* Bottom nav hanya muncul di mobile (md:hidden ada di dalam komponen) */}
            <MobileBottomNav />
        </AppShell>
    );
}
