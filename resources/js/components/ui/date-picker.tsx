import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    /** Nilai tanggal dalam format ISO string 'yyyy-MM-dd' atau '' */
    value: string;
    /** Dipanggil dengan format 'yyyy-MM-dd' atau '' saat tanggal berubah */
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    /** Boleh dikosongkan — tampilkan tombol X */
    clearable?: boolean;
}

/**
 * DatePicker reusable — konsisten di seluruh aplikasi.
 * Menerima dan mengembalikan string ISO 'yyyy-MM-dd'.
 * Menggunakan Calendar + Popover dari shadcn/ui.
 */
export function DatePicker({
    value,
    onChange,
    placeholder = 'Pilih tanggal',
    disabled = false,
    className,
    clearable = true,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);

    // Parse value string ke Date object untuk Calendar
    const selectedDate: Date | undefined = (() => {
        if (!value) return undefined;
        const parsed = parseISO(value);
        return isValid(parsed) ? parsed : undefined;
    })();

    const handleSelect = (date: Date | undefined) => {
        onChange(date ? format(date, 'yyyy-MM-dd') : '');
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'h-10 w-full justify-start gap-2 text-left font-normal',
                        !selectedDate && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                        {selectedDate
                            ? format(selectedDate, 'dd MMM yyyy', { locale: id })
                            : placeholder
                        }
                    </span>
                    {clearable && selectedDate && (
                        <X
                            className="size-3.5 shrink-0 opacity-50 hover:opacity-100"
                            onClick={handleClear}
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    locale={id}
                    selected={selectedDate}
                    onSelect={handleSelect}
                    captionLayout="dropdown-buttons"
                    fromYear={2000}
                    toYear={new Date().getFullYear() + 1}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
