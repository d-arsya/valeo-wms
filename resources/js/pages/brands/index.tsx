import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Trash2, Tag, Edit, Eye } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

    const rows = response.data;
    const hasFilters = Boolean(search);

    function applyFilters(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        const query: Record<string, string> = {};
        if (search.trim()) query.search = search.trim();

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

            <div className="space-y-6 p-4 md:p-6">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <Tag className="size-4 text-muted-foreground" />
                                    Brands list
                                </CardTitle>
                            </div>
                            <Button asChild className="w-full gap-2 shadow-sm lg:w-auto">
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
                                        className="h-10 pl-9"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                </div>
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
                                                            className="size-8"
                                                        >
                                                            <Link href={brands.show(brand.id).url}>
                                                                <Eye className="size-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-8"
                                                        >
                                                            <Link href={brands.edit(brand.id).url}>
                                                                <Edit className="size-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={() => handleDelete(brand.id)}
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
