import { Filter, Search, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ReportFiltersProps {
    data: {
        from: string;
        to: string;
        type: string;
        search: string;
        control_id: string;
    };
    setData: (key: string, value: any) => void;
    onApply: () => void;
    onReset: () => void;
    hasFilters: boolean;
    processing: boolean;
}

export function ReportFilters({ data, setData, onApply, onReset, hasFilters, processing }: ReportFiltersProps) {
    return (
        <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 font-bold">
                    <Filter className="h-4 w-4 text-primary" />
                    Filter Laporan
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form 
                    onSubmit={(e) => { e.preventDefault(); onApply(); }}
                    className="space-y-6"
                >
                    {/* Date From */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dari Tanggal</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal rounded-xl h-11 border-border/60",
                                        !data.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {data.from ? format(parseISO(data.from), "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
                                <Calendar
                                    mode="single"
                                    locale={id}
                                    captionLayout="dropdown-buttons"
                                    fromYear={2020}
                                    toYear={new Date().getFullYear() + 2}
                                    selected={data.from ? parseISO(data.from) : undefined}
                                    onSelect={(date) => {
                                        const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                                        setData('from', formattedDate);
                                        if (data.to && date && parseISO(data.to) < date) {
                                            setData('to', '');
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sampai Tanggal</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={!data.from}
                                    className={cn(
                                        "w-full justify-start text-left font-normal rounded-xl h-11 border-border/60",
                                        !data.to && "text-muted-foreground",
                                        !data.from && "opacity-50"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {data.to ? format(parseISO(data.to), "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
                                <Calendar
                                    mode="single"
                                    locale={id}
                                    captionLayout="dropdown-buttons"
                                    fromYear={data.from ? parseISO(data.from).getFullYear() : 2020}
                                    toYear={new Date().getFullYear() + 2}
                                    selected={data.to ? parseISO(data.to) : undefined}
                                    onSelect={(date) => setData('to', date ? format(date, 'yyyy-MM-dd') : '')}
                                    disabled={(date) => data.from ? date < parseISO(data.from) : false}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipe Transaksi</Label>
                        <Select 
                            value={data.type} 
                            onValueChange={value => setData('type', value)}
                        >
                            <SelectTrigger className="rounded-xl h-11 border-border/60">
                                <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                <SelectItem value="IN">Stock IN (Masuk)</SelectItem>
                                <SelectItem value="OUT">Stock OUT (Keluar)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Control ID</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Cari Control ID..."
                                className="pl-10 rounded-xl h-11 border-border/60 focus-visible:ring-primary"
                                value={data.control_id}
                                onChange={e => setData('control_id', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Material Number</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Cari Material #..."
                                className="pl-10 rounded-xl h-11 border-border/60 focus-visible:ring-primary"
                                value={data.search}
                                onChange={e => setData('search', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button 
                            type="submit"
                            className="flex-1 rounded-xl h-11 font-bold shadow-sm" 
                            disabled={processing}
                        >
                            Apply
                        </Button>
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={onReset} 
                            className="rounded-xl h-11 px-4 border-border/60" 
                            disabled={!hasFilters || processing}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
