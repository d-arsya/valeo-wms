import { Filter, Search, FileText, Calendar as CalendarIcon, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    setData: (key: any, value?: any) => void;
    onReset: () => void;
    hasFilters: boolean;
    processing: boolean;
}

export function ReportFilters({ data, setData, onReset, hasFilters, processing }: ReportFiltersProps) {
    return (
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md mb-6">
            <CardContent className="p-4">
                <div className="flex flex-wrap items-end gap-4">
                    {/* Date From */}
                    <div className="flex-1 min-w-[200px] space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Dari Tanggal</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal rounded-xl h-10 border-border/60 bg-background",
                                        !data.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {data.from ? format(parseISO(data.from), "dd MMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
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

                    {/* Date To */}
                    <div className="flex-1 min-w-[200px] space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Sampai Tanggal</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={!data.from}
                                    className={cn(
                                        "w-full justify-start text-left font-normal rounded-xl h-10 border-border/60 bg-background",
                                        !data.to && "text-muted-foreground",
                                        !data.from && "opacity-50"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {data.to ? format(parseISO(data.to), "dd MMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
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

                    {/* Type */}
                    <div className="w-[180px] space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Tipe</Label>
                        <Select 
                            value={data.type} 
                            onValueChange={value => setData('type', value)}
                        >
                            <SelectTrigger className="rounded-xl h-10 border-border/60 bg-background">
                                <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                <SelectItem value="IN">Stock IN</SelectItem>
                                <SelectItem value="OUT">Stock OUT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="flex-[1.5] min-w-[250px] space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Pencarian</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Cari Material # atau Control ID..."
                                className="pl-10 rounded-xl h-10 border-border/60 bg-background focus-visible:ring-primary"
                                value={data.search}
                                onChange={e => setData('search', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Reset Button */}
                    {hasFilters && (
                        <Button 
                            type="button"
                            variant="ghost"
                            onClick={onReset} 
                            className="rounded-xl h-10 px-3 text-muted-foreground hover:text-destructive transition-colors" 
                            disabled={processing}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
