import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, FolderOpen, Package, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import categories from '@/routes/categories';
import type { Category, PaginatedResponse } from '@/types';

interface Props {
    categories: PaginatedResponse<Category>;
    filters: { search?: string | null };
}

export default function Index({ categories: response, filters }: Props) {
    const isMobile = useIsMobile();
    const [search, setSearch] = useState(filters.search ?? '');

    const rows       = response.data;
    const hasFilters = Boolean(search);

    function applyFilters(e?: FormEvent) {
        e?.preventDefault();
        router.get(categories.index().url, search.trim() ? { search: search.trim() } : {}, {
            preserveScroll: true, replace: true,
        });
    }

    function resetFilters() {
        setSearch('');
        router.get(categories.index().url, {}, { preserveScroll: true, replace: true });
    }

    function handleDelete(id: number) {
        if (!confirm('Hapus category ini?')) return;
        router.delete(categories.destroy(id).url, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Category Management" />

            <div className="space-y-6 p-3 sm:p-4 md:p-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    {/* Header */}
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <FolderOpen className="size-4 text-muted-foreground shrink-0" />
                                Categories list
                            </CardTitle>
                            <Button asChild className="hidden gap-2 shadow-sm lg:flex">
                                <Link href={categories.create().url}>
                                    <Plus className="size-4" />
                                    Add category
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Search */}
                    <CardContent className="border-b border-border/60 p-3 sm:p-4">
                        <form onSubmit={applyFilters} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari category..."
                                    className="h-10 pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="h-10 shrink-0 px-4">Cari</Button>
                            {hasFilters && (
                                <Button type="button" variant="outline" className="h-10 shrink-0 px-3" onClick={resetFilters}>
                                    <X className="size-4" />
                                </Button>
                            )}
                        </form>
                    </CardContent>

                    {/* List */}
                    <CardContent className="p-0">
                        {rows.length === 0 ? (
                            <div className="flex min-h-60 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                                <FolderOpen className="size-8 text-muted-foreground/40" />
                                <p className="text-base font-semibold">Tidak ada category</p>
                                {hasFilters && <Button variant="outline" size="sm" onClick={resetFilters}>Reset</Button>}
                            </div>
                        ) : isMobile ? (
                            <div className="divide-y divide-border/50">
                                {rows.map((cat) => {
                                    const count = cat.spareparts_count ?? 0;
                                    return (
                                        <div key={cat.id} className="flex items-center gap-3 px-4 py-3.5">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                                                <FolderOpen className="size-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-sm text-foreground">{cat.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant={count > 0 ? 'secondary' : 'outline'} className="gap-1 text-[10px] px-1.5 py-0">
                                                        <Package className="size-2.5" />{count}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(cat.created_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <Button asChild variant="outline" size="icon" className="size-8">
                                                    <Link href={categories.show(cat.id).url}><Eye className="size-3.5" /></Link>
                                                </Button>
                                                <Button asChild variant="outline" size="icon" className="size-8">
                                                    <Link href={categories.edit(cat.id).url}><Edit className="size-3.5" /></Link>
                                                </Button>
                                                <Button variant="destructive" size="icon" className="size-8"
                                                    onClick={() => handleDelete(cat.id)}>
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead className="border-b border-border/60 bg-muted/40 text-left text-muted-foreground">
                                        <tr>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide">Name</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide">Spareparts</th>
                                            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide">Created At</th>
                                            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((cat, i) => (
                                            <tr key={cat.id} className={'border-b border-border/60 transition-colors hover:bg-muted/20 ' + (i % 2 === 1 ? 'bg-muted/5' : '')}>
                                                <td className="px-5 py-4 font-semibold text-foreground">{cat.name}</td>
                                                <td className="px-5 py-4">
                                                    <Badge variant="secondary">{cat.spareparts_count ?? 0} items</Badge>
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground">{new Date(cat.created_at).toLocaleDateString('id-ID')}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button asChild variant="outline" size="icon" className="size-8">
                                                            <Link href={categories.show(cat.id).url}><Eye className="size-3.5" /></Link>
                                                        </Button>
                                                        <Button asChild variant="outline" size="icon" className="size-8">
                                                            <Link href={categories.edit(cat.id).url}><Edit className="size-3.5" /></Link>
                                                        </Button>
                                                        <Button variant="destructive" size="icon" className="size-8"
                                                            onClick={() => handleDelete(cat.id)}>
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

            <FloatingActionButton href={categories.create().url} label="Add category" />
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Categories', href: categories.index() }],
};
