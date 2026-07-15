import { Filter, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Brand, Category } from '@/types';

export type FilterValues = {
    search: string;
    brandId: string;
    categoryId: string;
    rank: string;
    status: string;
};

interface Props {
    values: FilterValues;
    onChange: (field: keyof FilterValues, value: string) => void;
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    ranks: string[];
    statuses: string[];
    onApply: (event?: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
    hasFilters: boolean;
}

export function SparepartFilters({
    values,
    onChange,
    brands,
    categories,
    ranks,
    statuses,
    onApply,
    onReset,
    hasFilters,
}: Props) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleToggleFilter = () => {
        setIsFilterOpen((current) => !current);
    };

    return (
        <form onSubmit={onApply} className="">
            {/* Baris Utama (Selalu Terlihat) */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
                {/* Search - Lebar Maksimal */}
                <div className="flex-1 w-full space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Pencarian
                    </p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari material number atau part name..."
                            className="h-10 pl-9 w-full"
                            aria-label="Search spareparts"
                            value={values.search}
                            onChange={(event) => onChange('search', event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    onApply();
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Tombol Filter By */}
                <div className="pb-0">
                    <Button
                        type="button"
                        variant={isFilterOpen ? 'default' : 'secondary'}
                        className="h-10 gap-2"
                        onClick={handleToggleFilter}
                    >
                        <Filter className="size-4" />
                        Filter By
                    </Button>
                </div>

                {/* Tombol Apply & Reset (Posisi dibalik, Apply dulu baru Reset) */}
                <div className="lg:ml-auto flex items-center gap-2 pb-0">
                    <Button type="submit" className="h-10 px-4">
                        Apply
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4"
                        onClick={onReset}
                        disabled={!hasFilters}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {/* Area Filter (Collapsible, tetap terbuka setelah apply) */}
            <div
                className={cn(
                    'mt-4 grid gap-4 overflow-hidden transition-all duration-300 md:grid-cols-2 lg:grid-cols-4',
                    isFilterOpen ? 'max-h-[500px] opacity-100' : 'invisible max-h-0 opacity-0 pointer-events-none',
                )}
                style={{ display: isFilterOpen ? 'grid' : 'none' }}
            >
                <div className="space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Brand
                    </p>
                    <Select value={values.brandId} onValueChange={(val) => onChange('brandId', val)}>
                        <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Filter brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All brands</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={brand.id} value={String(brand.id)}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Category
                    </p>
                    <Select value={values.categoryId} onValueChange={(val) => onChange('categoryId', val)}>
                        <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Filter category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Rank
                    </p>
                    <Select value={values.rank} onValueChange={(val) => onChange('rank', val)}>
                        <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Filter rank" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All ranks</SelectItem>
                            {ranks.map((rank) => (
                                <SelectItem key={rank} value={rank}>
                                    {rank}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Status
                    </p>
                    <Select value={values.status} onValueChange={(val) => onChange('status', val)}>
                        <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </form>
    );
}
