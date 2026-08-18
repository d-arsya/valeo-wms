import { ArrowUpDown, ChevronDown, Filter, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { SortDir } from '@/components/ui/sortable-header';
import { useIsMobile } from '@/hooks/use-mobile';
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
    /** Sort props — opsional, kalau tidak diberikan sort selector tidak ditampilkan */
    sort?: string;
    dir?: SortDir;
    onSortChange?: (column: string, dir: SortDir) => void;
}

// Opsi sort yang tersedia di mobile
const SORT_OPTIONS: { value: string; label: string }[] = [
    { value: 'created_at:desc', label: 'Terbaru' },
    { value: 'created_at:asc',  label: 'Terlama' },
    { value: 'material_number:asc',  label: 'Material Number A–Z' },
    { value: 'material_number:desc', label: 'Material Number Z–A' },
    { value: 'part_name:asc',  label: 'Part Name A–Z' },
    { value: 'part_name:desc', label: 'Part Name Z–A' },
    { value: 'actual_stock:desc', label: 'Stok terbanyak' },
    { value: 'actual_stock:asc',  label: 'Stok tersedikit' },
    { value: 'rank:asc',  label: 'Rank A–C' },
    { value: 'rank:desc', label: 'Rank C–A' },
    { value: 'status:asc',  label: 'Status (OK dulu)' },
    { value: 'status:desc', label: 'Status (NG dulu)' },
];

const ALL_VALUE = 'all';

function filterCount(values: FilterValues): number {
    let count = 0;

    if (values.brandId !== ALL_VALUE) {
count++;
}

    if (values.categoryId !== ALL_VALUE) {
count++;
}

    if (values.rank !== ALL_VALUE) {
count++;
}

    if (values.status !== ALL_VALUE) {
count++;
}

    return count;
}

function FilterFields({
    values,
    onChange,
    brands,
    categories,
    ranks,
    statuses,
    cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    labelUpperCase = true,
}: {
    values: FilterValues;
    onChange: (field: keyof FilterValues, value: string) => void;
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    ranks: string[];
    statuses: string[];
    cols?: string;
    labelUpperCase?: boolean;
}) {
    const labelClass = cn(
        'text-xs font-medium tracking-wide text-muted-foreground',
        labelUpperCase && 'uppercase',
    );

    return (
        <div className={cn('grid gap-4', cols)}>
            <div className="space-y-1.5">
                <p className={labelClass}>Brand</p>
                <Select
                    value={values.brandId}
                    onValueChange={(val) => onChange('brandId', val)}
                >
                    <SelectTrigger className="h-11 w-full sm:h-10">
                        <SelectValue placeholder="Filter brand" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>All brands</SelectItem>
                        {brands.map((brand) => (
                            <SelectItem key={brand.id} value={String(brand.id)}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <p className={labelClass}>Category</p>
                <Select
                    value={values.categoryId}
                    onValueChange={(val) => onChange('categoryId', val)}
                >
                    <SelectTrigger className="h-11 w-full sm:h-10">
                        <SelectValue placeholder="Filter category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem
                                key={category.id}
                                value={String(category.id)}
                            >
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <p className={labelClass}>Rank</p>
                <Select
                    value={values.rank}
                    onValueChange={(val) => onChange('rank', val)}
                >
                    <SelectTrigger className="h-11 w-full sm:h-10">
                        <SelectValue placeholder="Filter rank" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>All ranks</SelectItem>
                        {ranks.map((rank) => (
                            <SelectItem key={rank} value={rank}>
                                {rank}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <p className={labelClass}>Status</p>
                <Select
                    value={values.status}
                    onValueChange={(val) => onChange('status', val)}
                >
                    <SelectTrigger className="h-11 w-full sm:h-10">
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                        {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                    status.slice(1).replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
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
    sort,
    dir,
    onSortChange,
}: Props) {
    const isMobile = useIsMobile();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const count = filterCount(values);

    const handleToggleFilter = () => {
        setIsFilterOpen((current) => !current);
    };

    const handleSheetApply = (event?: React.MouseEvent) => {
        event?.preventDefault();
        setSheetOpen(false);
        onApply();
    };

    const handleSheetReset = (event?: React.MouseEvent) => {
        event?.preventDefault();
        onReset();
        setSheetOpen(false);
    };

    return (
        <form onSubmit={onApply} className="">
            {/* Baris Utama (Selalu Terlihat) */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
                {/* Search - Lebar Maksimal */}
                <div className="flex-1 w-full space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:block">
                        Pencarian
                    </p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari material number atau part name..."
                            className="h-11 pl-9 w-full sm:h-10"
                            aria-label="Search spareparts"
                            value={values.search}
                            onChange={(event) =>
                                onChange('search', event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    onApply();
                                }
                            }}
                        />
                    </div>
                </div>

                {isMobile ? (
                    <>
                        {/* Mobile toolbar: Sort | Filter | Apply — 3 tombol sejajar */}
                        <div className="grid grid-cols-3 gap-2 sm:hidden">

                            {/* Tombol Sort — DropdownMenu langsung, tidak perlu buka Sheet */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={sort && sort !== 'created_at' ? 'default' : 'secondary'}
                                        className="col-span-1 h-11 gap-1.5 px-3"
                                    >
                                        <ArrowUpDown className="size-4 shrink-0" />
                                        <span className="truncate text-xs">Urut</span>
                                        {sort && sort !== 'created_at' && (
                                            <span className="size-1.5 rounded-full bg-primary-foreground/70" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52">
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                                        Urutkan berdasarkan
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {SORT_OPTIONS.map((opt) => {
                                        const [col, d] = opt.value.split(':') as [string, SortDir];
                                        const isActive = sort === col && dir === d;
                                        return (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                className={cn(
                                                    'text-sm',
                                                    isActive && 'bg-primary/10 font-medium text-primary',
                                                )}
                                                onSelect={() => onSortChange?.(col, d)}
                                            >
                                                {isActive && (
                                                    <span className="mr-2 size-1.5 rounded-full bg-primary" />
                                                )}
                                                {opt.label}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Tombol Filter — buka Sheet */}
                            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={count > 0 ? 'default' : 'secondary'}
                                        className="col-span-1 h-11 gap-1.5 px-3"
                                    >
                                        <Filter className="size-4 shrink-0" />
                                        <span className="truncate text-xs">Filter</span>
                                        {count > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-0.5 min-w-[1.1rem] px-1 text-[10px] leading-none"
                                            >
                                                {count}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="bottom"
                                    className="flex h-[85vh] max-h-160 flex-col rounded-t-2xl border-t p-0 focus-visible:outline-none sm:rounded-t-[1.75rem]"
                                >
                                    <SheetHeader className="border-b px-4 pb-3 pt-4 sm:px-6">
                                        <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/25 sm:hidden" />
                                        <SheetTitle className="text-left text-base font-semibold">
                                            Filter Spareparts
                                            {count > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-2 text-[11px]"
                                                >
                                                    {count} active
                                                </Badge>
                                            )}
                                        </SheetTitle>
                                        <SheetDescription className="sr-only">
                                            Select filters to apply to the spareparts list
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                                        <FilterFields
                                            values={values}
                                            onChange={onChange}
                                            brands={brands}
                                            categories={categories}
                                            ranks={ranks}
                                            statuses={statuses}
                                            cols="grid-cols-1 gap-5"
                                        />
                                    </div>

                                    <SheetFooter className="border-t bg-background/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
                                        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-11 sm:h-10"
                                                onClick={handleSheetReset}
                                                disabled={!hasFilters}
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                type="button"
                                                className="h-11 gap-2 sm:h-10 sm:min-w-40"
                                                onClick={handleSheetApply}
                                            >
                                                Apply Filters
                                            </Button>
                                        </div>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>

                            {/* Tombol Apply */}
                            <Button type="submit" className="col-span-1 h-11 px-3">
                                <span className="text-xs">Cari</span>
                            </Button>
                        </div>
                        <div className="hidden items-end gap-2 pb-0 sm:flex lg:hidden">
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
                    </>
                ) : (
                    <>
                        {/* Desktop: Tombol Filter By + Apply Reset Inline */}
                        <div className="pb-0">
                            <Button
                                type="button"
                                variant={isFilterOpen ? 'default' : 'secondary'}
                                className="h-10 gap-2"
                                onClick={handleToggleFilter}
                            >
                                <Filter className="size-4" />
                                Filter By
                                {count > 0 && (
                                    <Badge
                                        variant={
                                            isFilterOpen ? 'secondary' : 'default'
                                        }
                                        className="ml-0.5 min-w-5 px-1.5 py-0.5 text-[11px] leading-none"
                                    >
                                        {count}
                                    </Badge>
                                )}
                            </Button>
                        </div>

                        {/* Tombol Apply & Reset (Apply dulu baru Reset) */}
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
                    </>
                )}
            </div>

            {/* Desktop Only: Area Filter (Collapsible, tetap terbuka setelah apply) */}
            {!isMobile && (
                <div
                    className={cn(
                        'mt-4 grid gap-4 overflow-hidden transition-all duration-300 md:grid-cols-2 lg:grid-cols-4',
                        isFilterOpen
                            ? 'max-h-125 opacity-100'
                            : 'invisible max-h-0 opacity-0 pointer-events-none',
                    )}
                    style={{ display: isFilterOpen ? 'grid' : 'none' }}
                >
                    <FilterFields
                        values={values}
                        onChange={onChange}
                        brands={brands}
                        categories={categories}
                        ranks={ranks}
                        statuses={statuses}
                    />
                </div>
            )}
        </form>
    );
}
