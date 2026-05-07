import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Brand, Category } from '@/types';

export type FilterValues = {
    search: string;
    brandId: string;
    categoryId: string;
};

interface Props {
    values: FilterValues;
    onChange: (field: keyof FilterValues, value: string) => void;
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    onApply: (event?: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
    hasFilters: boolean;
}

export function SparepartFilters({
    values,
    onChange,
    brands,
    categories,
    onApply,
    onReset,
    hasFilters,
}: Props) {
    return (
        <form
            onSubmit={onApply}
            className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)_auto]"
        >
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search material number or part name..."
                    className="h-10 pl-9"
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

            <div className="flex gap-2">
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
        </form>
    );
}
