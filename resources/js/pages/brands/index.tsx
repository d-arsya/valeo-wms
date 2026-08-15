import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Trash2, Tag, Edit, Eye } from 'lucide-react';
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
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import brands from '@/routes/brands';
import type { PaginatedResponse, Brand } from '@/types';

interface Props {
    brands: PaginatedResponse<Brand>;
    filters: {
        search?: string | null;
    };
}

export default function Index({
    brands: response,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const isMobile = useIsMobile();

    const rows = response.data;
    const hasFilters = Boolean(search);

    function applyFilters(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        const query: Record<string, string> = {};

        if (search.trim()) {
query.search = search.trim();
}

        router.get(brands.index().url, query, {
            preserveScroll: true,
            replace: true,
        });
    }

    function resetFilters() {
        setSearch('');

        router.get(brands.index().url, {}, {
            preserveScroll: true,
            replace: true,
        });
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this brand?')) {
            router.delete(brands.destroy(id).url, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Brand Management" />

            <div className="space-y-6 p-3 sm:p-4 md:p-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <Tag className="size-4 text-muted-foreground" />
                                    Brands list
                                </CardTitle>
                            </div>
                            <Button asChild className="hidden w-full gap-2 shadow-sm lg:flex lg:w-auto">
                                <Link href={brands.create().url}>
                                    <Plus className="size-4" />
                                    Add brand
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="border-b border-border/60 bg-background p-4 md:p-6">
                        <form
                            onSubmit={applyFilters}
                            className="grid gap-3 md:gap-4 xl:grid-cols-[minmax(0,2fr)_auto]"
                        >
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Search
                                </p>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by brand name..."
                                        className="h-11 pl-9 sm:h-10"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" className="h-11 px-5 sm:h-10 sm:px-4 min-w-20">
                                    Apply
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 px-5 sm:h-10 sm:px-4"
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
                            isMobile ? (
                                <div className="flex flex-col gap-3 p-3 sm:p-4">
                                    {rows.map((brand) => (
                                        <div
                                            key={brand.id}
                                            className="group rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/70">
                                                        <Tag className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate font-semibold text-foreground text-[15px]">
                                                            {brand.name}
                                                        </h3>
                                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            <span>
                                                                Created {new Date(brand.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="shrink-0">
                                                        #{brand.id}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-11 w-full gap-1.5 text-sm"
                                                >
                                                    <Link href={brands.show(brand.id).url}>
                                                        <Eye className="size-4 shrink-0" />
                                                        <span className="truncate">View</span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-11 w-full gap-1.5 text-sm"
                                                >
                                                    <Link href={brands.edit(brand.id).url}>
                                                        <Edit className="size-4 shrink-0" />
                                                        <span className="truncate">Edit</span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-11 w-full gap-1.5 text-sm"
                                                    onClick={() => handleDelete(brand.id)}
                                                >
                                                    <Trash2 className="size-4 shrink-0" />
                                                    <span className="truncate">Delete</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead className="bg-muted/40 text-left text-muted-foreground border-b border-border/60">
                                            <tr>
                                                <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase">Name</th>
                                                <th className="px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase">Created At</th>
                                                <th className="px-5 py-3.5 text-right text-[11px] font-semibold tracking-wide uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((brand) => (
                                                <tr
                                                    key={brand.id}
                                                    className="border-b border-border/60 transition-colors hover:bg-muted/20"
                                                >
                                                    <td className="px-5 py-4 font-semibold text-foreground whitespace-nowrap">
                                                        {brand.name}
                                                    </td>
                                                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                                                        {new Date(brand.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-5 py-4 text-right whitespace-nowrap">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-11 sm:size-8"
                                                            >
                                                                <Link href={brands.show(brand.id).url}>
                                                                    <Eye className="size-5 sm:size-3.5" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-11 sm:size-8"
                                                            >
                                                                <Link href={brands.edit(brand.id).url}>
                                                                    <Edit className="size-5 sm:size-3.5" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="size-11 sm:size-8"
                                                                onClick={() => handleDelete(brand.id)}
                                                            >
                                                                <Trash2 className="size-5 sm:size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            <div className="flex min-h-72 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                                <p className="text-base font-semibold text-foreground">
                                    No brands found
                                </p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Try modifying your search to see other brands.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Pagination meta={response} />
            </div>

            <FloatingActionButton
                href={brands.create().url}
                label="Add brand"
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Brands',
            href: brands.index(),
        },
    ],
};
