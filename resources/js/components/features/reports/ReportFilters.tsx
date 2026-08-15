import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Filter, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type ReportFiltersData = {
    from: string;
    to: string;
    type: string;
    search: string;
    control_id?: string;
};

interface ReportFiltersProps {
    data: ReportFiltersData;
    setData: (key: keyof ReportFiltersData, value?: unknown) => void;
    onApply: (event?: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
    hasFilters: boolean;
    processing: boolean;
}

const ALL_VALUE = 'all';

function filterCount(data: ReportFiltersData): number {
    let count = 0;
    if (data.from) count++;
    if (data.to) count++;
    if (data.type !== ALL_VALUE) count++;
    return count;
}

type DateFieldProps = {
    label: string;
    value: string;
    minValue?: string;
    disabled?: boolean;
    onChange: (val: string) => void;
};

function DateField({
    label,
    value,
    minValue,
    disabled,
    onChange,
}: DateFieldProps) {
    const parsed = value ? parseISO(value) : undefined;
    const minParsed = minValue ? parseISO(minValue) : undefined;
    return (
        <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:block">
                {label}
            </p>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            'w-full justify-start text-left font-normal h-11 sm:h-10',
                            !value && 'text-muted-foreground',
                            disabled && 'opacity-50',
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">
                            {value
                                ? format(parseISO(value), 'dd MMM yyyy', {
                                      locale: id,
                                  })
                                : 'Pilih tanggal'}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        locale={id}
                        selected={parsed}
                        onSelect={(date) => {
                            onChange(
                                date ? format(date, 'yyyy-MM-dd') : '',
                            );
                        }}
                        disabled={(date) =>
                            minParsed ? date < minParsed : false
                        }
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

type FieldsContentProps = {
    data: ReportFiltersData;
    setData: (key: keyof ReportFiltersData, value?: unknown) => void;
    cols?: string;
    labelUpperCase?: boolean;
    showSearch?: boolean;
};

function FieldsContent({
    data,
    setData,
    cols = 'grid-cols-1 md:grid-cols-2',
    showSearch = false,
}: FieldsContentProps) {
    return (
        <div className={cn('grid gap-4', cols)}>
            <DateField
                label="Dari Tanggal"
                value={data.from}
                onChange={(v) => setData('from', v)}
            />
            <DateField
                label="Sampai Tanggal"
                value={data.to}
                minValue={data.from}
                disabled={!data.from}
                onChange={(v) => setData('to', v)}
            />
            <div className="space-y-1.5">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:block">
                    Tipe
                </p>
                <Select
                    value={data.type}
                    onValueChange={(val) => setData('type', val)}
                >
                    <SelectTrigger className="h-11 w-full sm:h-10">
                        <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>Semua Tipe</SelectItem>
                        <SelectItem value="IN">Stock IN</SelectItem>
                        <SelectItem value="OUT">Stock OUT</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {showSearch ? (
                <div className="space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:block">
                        Pencarian
                    </p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari Material # atau Control ID..."
                            className="h-11 pl-9 sm:h-10"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                }
                            }}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export function ReportFilters({
    data,
    setData,
    onApply,
    onReset,
    hasFilters,
    processing,
}: ReportFiltersProps) {
    const isMobile = useIsMobile();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const count = filterCount(data);

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

    const submitForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onApply(event);
    };

    return (
        <form
            onSubmit={submitForm}
            className="grid gap-3 md:gap-4"
        >
            {/* Baris Utama: Search + Filter + Action */}
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:gap-4">
                {/* Search (Selalu Terlihat) */}
                <div className="flex-1 w-full space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:block">
                        Pencarian
                    </p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari Material # atau Control ID..."
                            className="h-11 pl-9 w-full sm:h-10"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
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
                        <div className="grid grid-cols-3 gap-2 sm:hidden">
                            <Sheet
                                open={sheetOpen}
                                onOpenChange={setSheetOpen}
                            >
                                <SheetTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="col-span-2 h-11 gap-2"
                                    >
                                        <Filter className="size-4 shrink-0" />
                                        <span>Filters</span>
                                        {count > 0 && (
                                            <Badge
                                                variant="default"
                                                className="ml-1 min-w-[1.3rem] px-1.5 text-[11px] leading-none"
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
                                            Filter Laporan
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
                                            Pilih tanggal, tipe transaksi,
                                            dan pencarian untuk memfilter
                                            laporan
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                                        <FieldsContent
                                            data={data}
                                            setData={setData}
                                            cols="grid-cols-1 gap-5"
                                            showSearch={false}
                                        />
                                    </div>

                                    <SheetFooter className="border-t bg-background/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
                                        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-11 sm:h-10"
                                                onClick={handleSheetReset}
                                                disabled={
                                                    !hasFilters || processing
                                                }
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                type="button"
                                                className="h-11 gap-2 sm:h-10 sm:min-w-40"
                                                onClick={handleSheetApply}
                                                disabled={processing}
                                            >
                                                Apply Filters
                                            </Button>
                                        </div>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>

                            <Button
                                type="submit"
                                className="col-span-1 h-11"
                                disabled={processing}
                            >
                                Apply
                            </Button>
                        </div>
                        <div className="hidden items-end gap-2 pb-0 sm:flex xl:hidden">
                            <Button
                                type="submit"
                                className="h-10 px-4"
                                disabled={processing}
                            >
                                Apply
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 px-4"
                                onClick={onReset}
                                disabled={!hasFilters || processing}
                            >
                                Reset
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Desktop: Filter By + Apply/Reset Inline */}
                        <div className="pb-0">
                            <Button
                                type="button"
                                variant={isFilterOpen ? 'default' : 'secondary'}
                                className="h-10 gap-2"
                                onClick={handleToggleFilter}
                            >
                                <Filter className="size-4 shrink-0" />
                                Filter By
                                {count > 0 && (
                                    <Badge
                                        variant={
                                            isFilterOpen
                                                ? 'secondary'
                                                : 'default'
                                        }
                                        className="ml-0.5 min-w-5 px-1.5 py-0.5 text-[11px] leading-none"
                                    >
                                        {count}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                        <div className="xl:ml-auto flex items-center gap-2 pb-0">
                            <Button
                                type="submit"
                                className="h-10 px-4"
                                disabled={processing}
                            >
                                Apply
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 px-4"
                                onClick={onReset}
                                disabled={!hasFilters || processing}
                            >
                                Reset
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Desktop: Filter Fields (collapsible inline) */}
            {!isMobile && (
                <div
                    className={cn(
                        'grid gap-4 overflow-hidden transition-all duration-300 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,0.8fr)_auto]',
                        isFilterOpen
                            ? 'max-h-125 opacity-100 mt-1'
                            : 'invisible max-h-0 opacity-0 pointer-events-none',
                    )}
                    style={{ display: isFilterOpen ? 'grid' : 'none' }}
                >
                    <FieldsContent
                        data={data}
                        setData={setData}
                        cols="contents"
                        showSearch={false}
                    />
                </div>
            )}
        </form>
    );
}
