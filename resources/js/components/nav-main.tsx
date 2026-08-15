import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

    const toggleGroup = (title: string) => {
        const newOpenGroups = new Set(openGroups);

        if (newOpenGroups.has(title)) {
            newOpenGroups.delete(title);
        } else {
            newOpenGroups.add(title);
        }

        setOpenGroups(newOpenGroups);
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>WMS</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    if (item.children) {
                        const isOpen = openGroups.has(item.title);
                        const anyChildActive = item.children.some((child) => isCurrentUrl(child.href));

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    onClick={() => toggleGroup(item.title)}
                                    isActive={anyChildActive}
                                    tooltip={{ children: item.title }}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    <ChevronRight
                                        className="ml-auto transition-transform duration-200"
                                        style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                    />
                                </SidebarMenuButton>
                                {isOpen && (
                                    <SidebarMenuSub>
                                        {item.children.map((child) => (
                                            <SidebarMenuSubItem key={child.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={isCurrentUrl(child.href)}
                                                >
                                                    <Link href={child.href} prefetch>
                                                        {child.icon && <child.icon />}
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
