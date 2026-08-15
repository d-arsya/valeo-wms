import type { LucideIcon } from 'lucide-react';

import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon;
    children?: NavItem[];
}
