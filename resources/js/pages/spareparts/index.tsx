import { Head, Link, router } from '@inertiajs/react';
import { Plus, Warehouse } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { FilterValues } from '@/components/features/spareparts/spareparts-filters';
import { SparepartFilters } from '@/components/features/spareparts/spareparts-filters';
import { SparepartsTable } from '@/components/features/spareparts/spareparts-table';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import spareparts from '@/routes/spareparts';
import type { Brand, Category, PaginatedResponse, Sparepart } from '@/types';

interface Props {
    spareparts: PaginatedResponse<Sparepart>;
    filters: {
        search?: string | null;
        brand_id?: string | null;
        category_id?: string | null;
        rank?: string | null;
        status?: string | null;
    };
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    ranks: string[];
    statuses: string[];
}

function buildQuery(values: FilterValues) {
    return {
        ...(values.search ? { search: values.search.trim() } : {}),
        ...(values.brandId && values.brandId !== 'all' ? { brand_id: values.brandId } : {}),
        ...(values.categoryId && values.categoryId !== 'all' ? { category_id: values.categoryId } : {}),
        ...(values.rank && values.rank !== 'all' ? { rank: values.rank } : {}),
        ...(values.status && values.status !== 'all' ? { status: values.status } : {}),
    };
}

export default function Index({
    spareparts: response,
    filters,
    brands,
    categories,
    ranks,
    statuses,
}: Props) {
    const [filterValues, setFilterValues] = useState<FilterValues>({
        search: filters.search ?? '',
        brandId: filters.brand_id ?? 'all',
        categoryId: filters.category_id ?? 'all',
        rank: filters.rank ?? 'all',
        status: filters.status ?? 'all',
    });

    const rows = response.data;
    const hasFilters = Boolean(
        filterValues.search ||
        filterValues.brandId !== 'all' ||
        filterValues.categoryId !== 'all' ||
        filterValues.rank !== 'all' ||
        filterValues.status !== 'all'
    );

    const handleFilterChange = (field: keyof FilterValues, value: string) => {
        setFilterValues((prev) => ({ ...prev, [field]: value }));
    };

    function applyFilters(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        router.get(spareparts.index().url, buildQuery(filterValues), {
            preserveScroll: true,
            replace: true,
        });
    }

    function resetFilters() {
        setFilterValues({
            search: '',
            brandId: 'all',
            categoryId: 'all',
            rank: 'all',
            status: 'all'
        });

        router.get(spareparts.index().url, {}, {
            preserveScroll: true,
            replace: true,
        });
    }

    return (
        <>
            <Head title="Spareparts Master" />

            <div className="space-y-6 p-4 md:p-6">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <Warehouse className="size-4 text-muted-foreground" />
                                    Sparepart list
                                </CardTitle>
                            </div>
                            <Button asChild className="w-full gap-2 shadow-sm lg:w-auto">
                                <Link href={spareparts.create()}>
                                    <Plus className="size-4" />
                                    Add sparepart
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="border-b border-border/60 bg-background p-4 md:p-6">
                        <SparepartFilters
                            values={filterValues}
                            onChange={handleFilterChange}
                            brands={brands}
                            categories={categories}
                            ranks={ranks}
                            statuses={statuses}
                            onApply={applyFilters}
                            onReset={resetFilters}
                            hasFilters={hasFilters}
                        />
                    </CardContent>

                    <CardContent className="p-0">
                        {rows.length > 0 ? (
                            <SparepartsTable rows={rows} />
                        ) : (
                            <div className="flex min-h-72 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                                <p className="text-base font-semibold text-foreground">
                                    No sparepart found
                                </p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Coba ubah kata kunci pencarian atau hapus filter untuk melihat data lainnya.
                                </p>
                                {hasFilters && (
                                    <Button variant="outline" onClick={resetFilters}>
                                        Clear filters
                                    </Button>
                                )}
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
            title: 'Spareparts',
            href: spareparts.index(),
        },
    ],
};
