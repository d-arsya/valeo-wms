import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ReportFiltersProps {
    data: {
        from: string;
        to: string;
        type: string;
        search: string;
        control_id?: string;
    };
    setData: (key: any, value?: any) => void;
    onApply: (event?: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
    hasFilters: boolean;
    processing: boolean;
}

export function ReportFilters({ data, setData, onApply, onReset, hasFilters, processing }: ReportFiltersProps) {
    return (
        <form
            onSubmit={onApply}
            className="grid gap-3 md:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,0.8fr)_minmax(0,1.4fr)_auto]"
        >
                    <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Dari Tanggal</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10",
                                        !data.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {data.from ? format(parseISO(data.from), "dd MMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    locale={id}
                                    selected={data.from ? parseISO(data.from) : undefined}
                                    onSelect={(date) => {
                                        const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                                        setData('from', formattedDate);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Sampai Tanggal</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={!data.from}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10",
                                        !data.to && "text-muted-foreground",
                                        !data.from && "opacity-50"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {data.to ? format(parseISO(data.to), "dd MMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    locale={id}
                                    selected={data.to ? parseISO(data.to) : undefined}
                                    onSelect={(date) => setData('to', date ? format(date, 'yyyy-MM-dd') : '')}
                                    disabled={(date) => data.from ? date < parseISO(data.from) : false}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Tipe</p>
                        <Select
                            value={data.type}
                            onValueChange={value => setData('type', value)}
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                <SelectItem value="IN">Stock IN</SelectItem>
                                <SelectItem value="OUT">Stock OUT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Pencarian</p>
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari Material # atau Control ID..."
                                className="h-10 pl-9"
                                value={data.search}
                                onChange={e => setData('search', e.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        onApply();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button type="submit" className="h-10 px-4" disabled={processing}>
                            Apply
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onReset}
                            className="h-10 px-4"
                            disabled={!hasFilters || processing}
                        >
                            Reset
                        </Button>
                    </div>
        </form>
    );
}
