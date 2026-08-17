import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Search, ShieldAlert, Trash2, UserCheck, Users, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import users from '@/routes/users';
import type { PaginatedResponse } from '@/types';
import type { User } from '@/types/auth';

interface Props {
    users: PaginatedResponse<User>;
    filters: { search?: string | null; role?: string | null };
    roles: { value: string; label: string }[];
}

export default function Index({ users: response, filters, roles }: Props) {
    const isMobile = useIsMobile();
    const [search, setSearch] = useState(filters.search ?? '');
    const [role,   setRole]   = useState(filters.role   ?? 'all');

    const rows       = response.data;
    const hasFilters = Boolean(search || role !== 'all');

    function applyFilters(e?: FormEvent) {
        e?.preventDefault();
        const q: Record<string, string> = {};
        if (search.trim()) q.search = search.trim();
        if (role !== 'all') q.role = role;
        router.get(users.index().url, q, { preserveScroll: true, replace: true });
    }

    function resetFilters() {
        setSearch(''); setRole('all');
        router.get(users.index().url, {}, { preserveScroll: true, replace: true });
    }

    function handleDelete(id: number) {
        if (!confirm('Hapus user ini?')) return;
        router.delete(users.destroy(id).url, { preserveScroll: true });
    }

    function RoleBadge({ r }: { r?: string }) {
        return r === 'admin' ? (
            <Badge className="gap-1 bg-indigo-600 text-white hover:bg-indigo-700">
                <ShieldAlert className="size-3" />Admin
            </Badge>
        ) : (
            <Badge variant="secondary" className="gap-1">
                <UserCheck className="size-3" />Technician
            </Badge>
        );
    }

    return (
        <>
            <Head title="User Management" />

            <div className="space-y-6 p-3 sm:p-4 md:p-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    {/* Header */}
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Users className="size-4 text-muted-foreground shrink-0" />
                                Users list
                            </CardTitle>
                            <Button asChild className="hidden gap-2 shadow-sm lg:flex">
                                <Link href={users.create().url}>
                                    <Plus className="size-4" />
                                    Add user
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Filter — search + role select */}
                    <CardContent className="border-b border-border/60 p-3 sm:p-4">
                        <form onSubmit={applyFilters} className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau email..."
                                    className="h-10 pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="h-10 w-full sm:w-36 shrink-0">
                                    <SelectValue placeholder="Semua role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua role</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button type="submit" className="h-10 flex-1 sm:flex-none sm:px-4">Cari</Button>
                                {hasFilters && (
                                    <Button type="button" variant="outline" className="h-10 shrink-0 px-3" onClick={resetFilters}>
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>

                    {/* List */}
                    <CardContent className="p-0">
                        {rows.length === 0 ? (
                            <div className="flex min-h-60 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                                <Users className="size-8 text-muted-foreground/40" />
                                <p className="text-base font-semibold">Tidak ada user</p>
                                {hasFilters && <Button variant="outline" size="sm" onClick={resetFilters}>Reset</Button>}
                            </div>
                        ) : isMobile ? (
                            <div className="divide-y divide-border/50">
                                {rows.map((user) => (
                                    <div key={user.id} className="flex items-center gap-3 px-4 py-3.5">
                                        {/* Avatar initial */}
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-sm text-foreground">
                                            {user.name?.[0]?.toUpperCase() ?? 'U'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-sm text-foreground">{user.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <RoleBadge r={user.role} />
                                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <Button asChild variant="outline" size="icon" className="size-8">
                                                <Link href={users.edit(user.id).url}><Edit className="size-3.5" /></Link>
                                            </Button>
                                            <Button variant="destructive" size="icon" className="size-8"
                                                onClick={() => handleDelete(user.id)}>
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead className="border-b border-border/60 bg-muted/40 text-left text-muted-foreground">
                                        <tr>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide">Name</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide">Email</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide">Role</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide">Created At</th>
                                            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((user, i) => (
                                            <tr key={user.id} className={'border-b border-border/60 transition-colors hover:bg-muted/20 ' + (i % 2 === 1 ? 'bg-muted/5' : '')}>
                                                <td className="px-5 py-4 font-semibold text-foreground whitespace-nowrap">{user.name}</td>
                                                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{user.email}</td>
                                                <td className="px-5 py-4 whitespace-nowrap"><RoleBadge r={user.role} /></td>
                                                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                                    <div className="flex justify-end gap-2">
                                                        <Button asChild variant="outline" size="icon" className="size-8">
                                                            <Link href={users.edit(user.id).url}><Edit className="size-3.5" /></Link>
                                                        </Button>
                                                        <Button variant="destructive" size="icon" className="size-8"
                                                            onClick={() => handleDelete(user.id)}>
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Pagination meta={response} />
            </div>

            <FloatingActionButton href={users.create().url} label="Add user" />
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Users', href: users.index() }],
};
