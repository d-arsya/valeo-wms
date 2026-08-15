import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Trash2, UserCheck, ShieldAlert, Edit } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import users from '@/routes/users';
import type { PaginatedResponse, User } from '@/types';

interface Props {
    users: PaginatedResponse<User>;
    filters: {
        search?: string | null;
        role?: string | null;
    };
    roles: { value: string; label: string }[];
}

export default function Index({
    users: response,
    filters,
    roles,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? 'all');

    const rows = response.data;
    const hasFilters = Boolean(search || role !== 'all');

    function applyFilters(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        const query: Record<string, string> = {};

        if (search.trim()) {
query.search = search.trim();
}

        if (role !== 'all') {
query.role = role;
}

        router.get(users.index().url, query, {
            preserveScroll: true,
            replace: true,
        });
    }

    function resetFilters() {
        setSearch('');
        setRole('all');

        router.get(users.index().url, {}, {
            preserveScroll: true,
            replace: true,
        });
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(users.destroy(id).url, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="User Management" />

            <div className="space-y-6 p-4 md:p-6">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <UserCheck className="size-4 text-muted-foreground" />
                                    Users list
                                </CardTitle>
                            </div>
                            <Button asChild className="w-full gap-2 shadow-sm lg:w-auto">
                                <Link href={users.create().url}>
                                    <Plus className="size-4" />
                                    Add user
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="border-b border-border/60 bg-background p-4 md:p-6">
                        <form
                            onSubmit={applyFilters}
                            className="grid gap-3 md:gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)_auto]"
                        >
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Search
                                </p>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name or email..."
                                        className="h-10 pl-9"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Role
                                </p>
                                <Select value={role} onValueChange={(val) => setRole(val)}>
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="Filter role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All roles</SelectItem>
                                        {roles.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" className="h-10 px-4">
                                    Apply
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 px-4"
                                    onClick={resetFilters}
                                    disabled={!hasFilters}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>

                    <CardContent className="p-0">
                        {rows.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-muted-foreground border-b border-border/60">
                                        <tr>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase">Name</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase">Email</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase">Role</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase">Created At</th>
                                            <th className="px-5 py-3.5 text-right text-[11px] font-semibold tracking-wide uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-border/60 transition-colors hover:bg-muted/20"
                                            >
                                                <td className="px-5 py-4 font-semibold text-foreground whitespace-nowrap">
                                                    {user.name}
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                                                    {user.email}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    {user.role === 'admin' ? (
                                                        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
                                                            <ShieldAlert className="size-3" />
                                                            Admin
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <UserCheck className="size-3" />
                                                            Technician
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-8"
                                                        >
                                                            <Link href={users.edit(user.id).url}>
                                                                <Edit className="size-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex min-h-72 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                                <p className="text-base font-semibold text-foreground">
                                    No users found
                                </p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Try modifying your search or filters to see other users.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Pagination meta={response} />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index(),
        },
    ],
};
